import axios from 'axios';
import { query } from '../db.js';
import { toBinancePair } from '../utils/symbols.js';
import { ensureSchemaOnce } from '../utils/automigrate.js';

const BINANCE_HTTP = process.env.BINANCE_HTTP || 'https://api.binance.com';

async function insertTick(symbol: string, price: number, source: string) {
  try {
    await query('insert into price_ticks (symbol, price, source) values ($1,$2,$3)', [symbol, price, source]);
  } catch (e:any) {
    // kalau tabel belum ada → buat lalu coba sekali lagi
    if (String(e?.message || '').includes('relation "price_ticks"')) {
      await ensureSchemaOnce();
      await query('insert into price_ticks (symbol, price, source) values ($1,$2,$3)', [symbol, price, source]);
    } else {
      throw e;
    }
  }
}

export async function getSpotPrice(symbol: string) {
  const pair = toBinancePair(symbol);
  try {
    const { data } = await axios.get(`${BINANCE_HTTP}/api/v3/ticker/price`, {
      params: { symbol: pair }, timeout: 5000
    });
    const price = Number(data.price);
    await insertTick(pair, price, 'binance');
    return { symbol: pair, price, source: 'binance' };
  } catch {
    const base = pair.slice(0, -4);
    const quote = pair.slice(-4) === 'USDT' ? 'USDT' : 'USD';
    const url = `https://api.coinbase.com/v2/prices/${base}-${quote}/spot`;
    const { data } = await axios.get(url, { timeout: 5000 });
    const price = Number(data?.data?.amount);
    await insertTick(`${base}${quote}`, price, 'coinbase');
    return { symbol: `${base}${quote}`, price, source: 'coinbase' };
  }
}
