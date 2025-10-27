import axios from 'axios';
import { query } from '../db.js';
import { toBinancePair } from '../utils/symbols.js';

const BINANCE_HTTP = process.env.BINANCE_HTTP || 'https://api.binance.com';

export async function getSpotPrice(symbol: string) {
  const pair = toBinancePair(symbol);
  try {
    const { data } = await axios.get(`${BINANCE_HTTP}/api/v3/ticker/price`, {
      params: { symbol: pair }, timeout: 5000
    });
    const price = Number(data.price);
    await query(
      'insert into price_ticks (symbol, price, source) values ($1,$2,$3)',
      [pair, price, 'binance']
    );
    return { symbol: pair, price, source: 'binance' };
  } catch {
    // Coinbase fallback
    const base = pair.slice(0, -4);
    const quote = pair.slice(-4) === 'USDT' ? 'USDT' : 'USD';
    const url = `https://api.coinbase.com/v2/prices/${base}-${quote}/spot`;
    const { data } = await axios.get(url, { timeout: 5000 });
    const price = Number(data?.data?.amount);
    await query(
      'insert into price_ticks (symbol, price, source) values ($1,$2,$3)',
      [`${base}${quote}`, price, 'coinbase']
    );
    return { symbol: `${base}${quote}`, price, source: 'coinbase' };
  }
}
