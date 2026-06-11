import { Pool } from "pg";

const globalForPool = globalThis as unknown as { pool: Pool };

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

export async function query(text: string, params?: any[]) {
  if (!globalForPool.pool) {
    globalForPool.pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalForPool.pool.query(text, params);
}
