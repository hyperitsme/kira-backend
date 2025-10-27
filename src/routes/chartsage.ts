import { Router } from 'express';
import { getOHLCV } from '../services/ohlcv.js';
import { computeIndicators, humanNarrative } from '../services/chartsage.js';

export const chartsageRouter = Router();

chartsageRouter.get('/narrative', async (req, res) => {
  const { exchange = 'binance', symbol = 'SOL/USDT', timeframe = '1h', limit = '200' } = req.query;
  try {
    const rows = await getOHLCV(String(exchange), String(symbol), String(timeframe), Number(limit));
    const closes = rows.map(r => r.c);
    const highs = rows.map(r => r.h);
    const lows  = rows.map(r => r.l);
    const ind = computeIndicators(closes, highs, lows);
    const narrative = humanNarrative(String(symbol), String(timeframe), ind, closes.at(-1));
    res.json({ symbol, timeframe, indicators: ind, narrative });
  } catch (e:any) {
    res.status(502).json({ error: e.message || 'failed' });
  }
});
