import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import axios from 'axios';
import { DEFAULT_SYMBOLS } from '../utils/symbols.js';
import { query } from '../db.js';

type Tick = { symbol: string; price: number; source: string };

export function startLivePricesWS(server: Server) {
  const BASE = process.env.BASE_PATH || '';
  const wss = new WebSocketServer({ server, path: `${BASE}/ws/prices` });

  // helper broadcast
  const broadcast = (payload: Tick) => {
    const msg = JSON.stringify(payload);
    wss.clients.forEach((c) => c.readyState === WebSocket.OPEN && c.send(msg));
  };

  // ----- 1) Coba WS Binance
  const wsBase = (process.env.BINANCE_WS || 'wss://stream.binance.com:9443').replace(/\/+$/,'');
  const streams = DEFAULT_SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
  const url = `${wsBase}/stream?streams=${streams}`;

  let ws: WebSocket | null = null;
  let pollingTimer: NodeJS.Timer | null = null;

  const startPollingFallback = () => {
    if (pollingTimer) return;
    const httpBase = process.env.BINANCE_HTTP || 'https://api.binance.com';
    console.warn('[KiraAI] Falling back to HTTP polling ticker…');
    pollingTimer = setInterval(async () => {
      try {
        // ambil semua symbol secara paralel
        const reqs = DEFAULT_SYMBOLS.map(sym =>
          axios.get(`${httpBase}/api/v3/ticker/price`, { params: { symbol: sym }, timeout: 4000 })
            .then(({ data }) => ({ symbol: sym, price: Number(data.price), source: 'binance-http' }))
            .catch(async () => {
              // fallback kedua: Coinbase spot (BTC/ETH/SOL/BNB → USD jika ada)
              const base = sym.replace(/USDT$/,'').toUpperCase();
              const quote = 'USD';
              const { data } = await axios.get(`https://api.coinbase.com/v2/prices/${base}-${quote}/spot`, { timeout: 4000 });
              return { symbol: `${base}${quote}`, price: Number(data?.data?.amount), source: 'coinbase-http' };
            })
        );
        const ticks: Tick[] = await Promise.all(reqs);
        for (const t of ticks) {
          broadcast(t);
          // simpan ke DB
          await query('insert into price_ticks (symbol, price, source) values ($1,$2,$3)', [t.symbol, t.price, t.source]);
        }
      } catch (e) {
        console.error('[KiraAI] polling error:', e);
      }
    }, 1500); // 1.5s
  };

  try {
    ws = new WebSocket(url);
  } catch (e) {
    console.error('Binance WS init error', e);
    startPollingFallback();
    return;
  }

  ws.on('open', () => {
    console.log('[KiraAI] Binance WS connected:', url);
    // jika sebelumnya polling berjalan, hentikan
    if (pollingTimer) { clearInterval(pollingTimer); pollingTimer = null; }
  });

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const data = msg?.data;
      if (!data?.s || !data?.c) return;
      const payload: Tick = { symbol: data.s, price: Number(data.c), source: 'binance-ws' };
      broadcast(payload);
      await query('insert into price_ticks (symbol, price, source) values ($1,$2,$3)', [data.s, Number(data.c), 'binance-ws']);
    } catch (e) {
      console.error('WS message handle error', e);
    }
  });

  ws.on('error', (e: any) => {
    console.error('Binance WS error', e?.message || e);
    // 451 = geofence → langsung fallback
    startPollingFallback();
  });

  ws.on('close', () => {
    console.warn('Binance WS closed, switching to polling.');
    startPollingFallback();
  });
}
