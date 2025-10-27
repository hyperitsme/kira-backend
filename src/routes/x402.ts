import { Router } from 'express';
import { fetchWith402 } from '../x402/engine.js';

export const x402Router = Router();

x402Router.post('/proxy', async (req, res) => {
  const url = process.env.X402_PROVIDER_URL!;
  try {
    const data = await fetchWith402(url, req.body || {});
    res.json({ ok: true, data });
  } catch (e:any) {
    res.status(502).json({ error: e.message || 'x402 failed' });
  }
});
