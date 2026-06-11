import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });
    const result = await pool.query("SELECT NOW() as time");
    res.json({ ok: true, time: result.rows[0].time });
    await pool.end();
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message, stack: e.stack?.split("\n").slice(0, 3) });
  }
};
