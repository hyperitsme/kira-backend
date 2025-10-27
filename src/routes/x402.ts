import { Router } from 'express';
import { fetchWith402 } from '../x402/engine.js';

export const x402Router = Router();

x402Router.post('/proxy', async (req, res) => {
  const url = process.env.X402_PROVIDER_URL!;
  if (!url) return res.status(500).json({ error: 'X402_PROVIDER_URL not set' });
  try {
    const data = await fetchWith402(url, req.body || {});
    res.json({ ok: true, data });
  } catch (e: any) {
    const status = e?.status || 502;
    res.status(status).json({
      error: e?.message || 'x402 failed',
      details: e?.details || null
    });
  }
});
