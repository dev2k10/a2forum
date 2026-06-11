const globalForPool = globalThis as unknown as { pool: any };
const globalForUrl = globalThis as unknown as { url: string };

function getUrl() {
  if (!globalForUrl.url) {
    globalForUrl.url =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_URL ||
      "";
  }
  return globalForUrl.url;
}

export async function query(text: string, params?: any[]) {
  if (!globalForPool.pool) {
    const { Pool } = await import("pg");
    globalForPool.pool = new Pool({
      connectionString: getUrl(),
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalForPool.pool.query(text, params);
}
