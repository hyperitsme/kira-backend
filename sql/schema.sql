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
  kind text not null,               -- 'pulsescout' | 'chartsage'
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
