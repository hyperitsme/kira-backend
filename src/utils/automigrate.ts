import fs from 'fs';
import path from 'path';
import { query } from '../db.js';

const INLINE_SQL = `
create table if not exists price_ticks (
  id bigserial primary key,
  symbol text not null,
  price numeric not null,
  source text not null,
  ts timestamptz not null default now()
);
create index if not exists price_ticks_symbol_ts_idx
  on price_ticks (symbol, ts desc);

create table if not exists alerts (
  id bigserial primary key,
  kind text not null,
  symbol text not null,
  payload jsonb not null,
  validity numeric not null,
  ts timestamptz not null default now()
);

create table if not exists quiz_sessions (
  id bigserial primary key,
  user_id text not null,
  elo integer not null default 1200,
  last_result jsonb,
  ts timestamptz not null default now()
);
`;

export async function autoMigrateIfEnabled() {
  if (process.env.RUN_MIGRATIONS !== '1') return;
  try {
    const p = path.join(process.cwd(), 'sql', 'schema.sql');
    let sql = INLINE_SQL;
    try {
      if (fs.existsSync(p)) sql = fs.readFileSync(p, 'utf8');
    } catch {}
    await query(sql);
    console.log('[KiraAI] Auto-migrate done');
  } catch (e) {
    console.error('[KiraAI] Auto-migrate failed:', e);
  }
}

// util yang bisa dipanggil saat gagal insert (self-heal)
export async function ensureSchemaOnce() {
  try {
    await query(INLINE_SQL);
  } catch (e) {
    console.error('[KiraAI] ensureSchemaOnce failed:', e);
  }
}
