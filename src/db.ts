import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function query(q: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(q, params);
    return res;
  } finally {
    client.release();
  }
}
