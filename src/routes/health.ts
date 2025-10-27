import { Router } from 'express';
import { pool } from '../db.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await pool.query('select 1');
    res.json({ ok: true, status: 'healthy' });
  } catch {
    res.status(500).json({ ok: false });
  }
});
