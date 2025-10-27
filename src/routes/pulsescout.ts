import { Router } from 'express';
import { scanDexTopMovers, validityScore } from '../services/pulsescout.js';

export const pulsescoutRouter = Router();

pulsescoutRouter.get('/scan', async (req, res) => {
  const limit = Number(req.query.limit || 20);
  const rows = await scanDexTopMovers(limit);
  const enriched = rows.map(r => ({
    ...r,
    validity: validityScore(0.9, 0.95, 0.9) // placeholder weight; wire to your backtests later
  }));
  res.json({ items: enriched });
});
