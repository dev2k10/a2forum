import { Pool } from "pg";

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (pool) return pool;

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    return null;
  }

  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}

async function query(text: string, params?: any[]) {
  const p = getPool();
  if (!p) throw new Error("Database not configured");
  return p.query(text, params);
}

async function initTables() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("Database tables initialized");
  } catch (err: any) {
    console.error("DB init error:", err.message);
  }
}

// Init tables in background
initTables();

export { query, getPool };
