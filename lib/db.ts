const globalForPool = globalThis as unknown as { pool: any };

async function getPool() {
  if (globalForPool.pool) return globalForPool.pool;

  const { Pool } = await import("pg");
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    "";

  globalForPool.pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 1,
    connectionTimeoutMillis: 10000,
  });

  return globalForPool.pool;
}

export async function query(text: string, params?: any[]) {
  const pool = await getPool();
  return pool.query(text, params);
}
