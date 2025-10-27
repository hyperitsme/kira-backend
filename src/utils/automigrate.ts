import fs from 'fs';
import path from 'path';
import { query } from '../db.js';

export async function autoMigrateIfEnabled() {
  if (process.env.RUN_MIGRATIONS !== '1') return;
  try {
    const p = path.join(process.cwd(), 'sql', 'schema.sql');
    const sql = fs.readFileSync(p, 'utf8');
    await query(sql);
    console.log('[KiraAI] Auto-migrate done');
  } catch (e) {
    console.error('[KiraAI] Auto-migrate failed:', e);
  }
}
