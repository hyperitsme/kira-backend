import { Router } from 'express';
import { getOHLCV } from '../services/ohlcv.js';

export const ohlcvRouter = Router();

ohlcvRouter.get('/', async (req, res) => {
  const { exchange = 'binance', symbol = 'BTC/USDT', timeframe = '1h', limit = '200' } = req.query;
  try {
    const rows = await getOHLCV(String(exchange), String(symbol), String(timeframe), Number(limit));
    res.json({ exchange, symbol, timeframe, rows });
  } catch (e:any) {
    res.status(502).json({ error: e.message || 'failed' });
  }
});
