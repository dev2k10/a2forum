import type { VercelRequest, VercelResponse } from "@vercel/node";

const globalPool = globalThis as any;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { name, email, password, dateOfBirth, code } = req.body;
  if (!name || !email || !password || !code)
    return res.status(400).json({ error: "Missing fields" });

  try {
    if (!globalPool._pool) {
      const { Pool } = await import("pg");
      globalPool._pool = new Pool({
        connectionString:
          process.env.DATABASE_URL ||
          process.env.POSTGRES_URL_NON_POOLING ||
          process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false },
        max: 1,
        connectionTimeoutMillis: 10000,
      });
    }

    const bcrypt = await import("bcryptjs");
    const pool = globalPool._pool;

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Email exists" });

    const codes = await pool.query(
      "SELECT code, expires_at FROM verification_codes WHERE email = $1 AND used = FALSE ORDER BY created_at DESC LIMIT 1",
      [email],
    );
    if (codes.rows.length === 0)
      return res.status(400).json({ error: "No code" });

    const rec = codes.rows[0];
    if (rec.code !== code) return res.status(400).json({ error: "Wrong code" });
    if (new Date(rec.expires_at) < new Date())
      return res.status(400).json({ error: "Code expired" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await pool.query(
      "INSERT INTO users (name, email, password, date_of_birth, verified) VALUES ($1,$2,$3,$4,TRUE) RETURNING id, name, email",
      [name, email, hashed, dateOfBirth || null],
    );
    await pool.query(
      "UPDATE verification_codes SET used = TRUE WHERE email = $1 AND used = FALSE",
      [email],
    );

    return res.status(201).json({
      success: true,
      message: "Signup OK",
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
      },
    });
  } catch (error: any) {
    console.error("Signup:", error.message);
    return res.status(500).json({ error: "Signup failed" });
  }
};
