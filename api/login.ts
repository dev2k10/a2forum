import type { VercelRequest, VercelResponse } from "@vercel/node";

const globalPool = globalThis as any;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

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

    const result = await pool.query(
      "SELECT id, name, email, password, verified FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error: any) {
    console.error("Login:", error.message);
    return res.status(500).json({ error: "Login failed" });
  }
};
