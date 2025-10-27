import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { DEFAULT_SYMBOLS } from '../utils/symbols.js';
import { query } from '../db.js';

export function startLivePricesWS(server: Server) {
  const BASE = process.env.BASE_PATH || '';
  const wss = new WebSocketServer({ server, path: `${BASE}/ws/prices` });

  const streams = DEFAULT_SYMBOLS.map(s => `${s.toLowerCase()}@ticker`).join('/');
  const binance = new WebSocket(`${process.env.BINANCE_WS}/stream?streams=${streams}`);

  binance.on('message', async (raw) => {
    const msg = JSON.parse(raw.toString());
    const data = msg?.data;
    if (!data?.s || !data?.c) return;

    const payload = { symbol: data.s, price: Number(data.c), source: 'binance' };
    wss.clients.forEach(c => c.readyState === WebSocket.OPEN && c.send(JSON.stringify(payload)));

    await query('insert into price_ticks (symbol, price, source) values ($1,$2,$3)',
      [data.s, Number(data.c), 'binance']);
  });

  binance.on('error', (e) => console.error('Binance WS error', e));
}
