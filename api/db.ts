import postgres from "postgres";

function getDb() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    return null;
  }

  try {
    const sql = postgres(DATABASE_URL, {
      ssl: { rejectUnauthorized: false },
    });

    // Init tables in background (don't block the first request)
    initTables(sql).catch((err) =>
      console.error("DB init error:", err.message),
    );

    return sql;
  } catch (err: any) {
    console.error("DB connection error:", err.message);
    return null;
  }
}

async function initTables(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      date_of_birth DATE,
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  console.log("Database tables initialized");
}

const sql = getDb();
export default sql;
