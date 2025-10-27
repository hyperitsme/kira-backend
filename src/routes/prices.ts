import { Router } from 'express';
import { getSpotPrice } from '../services/prices.js';

export const pricesRouter = Router();

pricesRouter.get('/spot/:symbol', async (req, res) => {
  try {
    const out = await getSpotPrice(req.params.symbol);
    res.json(out);
  } catch (e:any) {
    res.status(502).json({ error: e.message || 'failed' });
  }
});
