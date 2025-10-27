import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { pricesRouter } from './routes/prices.js';
import { ohlcvRouter } from './routes/ohlcv.js';
import { pulsescoutRouter } from './routes/pulsescout.js';
import { chartsageRouter } from './routes/chartsage.js';
import { x402Router } from './routes/x402.js';

export async function createServer() {
  const app = express();
  const BASE = process.env.BASE_PATH || '';

  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || '*'
    })
  );

  // Mount under /dashboard
  app.use(`${BASE}/health`, healthRouter);
  app.use(`${BASE}/prices`, pricesRouter);
  app.use(`${BASE}/ohlcv`, ohlcvRouter);
  app.use(`${BASE}/pulsescout`, pulsescoutRouter);
  app.use(`${BASE}/chartsage`, chartsageRouter);
  app.use(`${BASE}/x402`, x402Router);

  app.get(BASE || '/', (_req, res) =>
    res.json({ ok: true, name: 'Kira AI Backend', base: BASE || '/' })
  );

  return app;
}
