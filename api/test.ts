import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { Pool } = await import("pg");
    const url = process.env.DATABASE_URL || "";
    const pool = new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000,
    });
    const r = await pool.query("SELECT 1 as val");
    await pool.end();
    return res.json({ ok: true, result: r.rows });
  } catch (e: any) {
    return res.status(200).json({
      ok: false,
      error: e.message,
      name: e.constructor?.name,
      stack: e.stack?.split("\n").slice(0, 4),
    });
  }
};
