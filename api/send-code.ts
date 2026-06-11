import type { VercelRequest, VercelResponse } from "@vercel/node";

const globalPool = globalThis as any;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: "Resend key not configured" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    // Lazy init pool
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

    const { Resend } = await import("resend");
    const resend = new Resend(key);

    await globalPool._pool.query(
      "UPDATE verification_codes SET used = TRUE WHERE email = $1 AND used = FALSE",
      [email],
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await globalPool._pool.query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt],
    );

    await resend.emails.send({
      from: "A2 Forum <onboarding@resend.dev>",
      to: email,
      subject: "Mã xác nhận A2 Forum",
      html: `<div>Mã: <b>${code}</b></div>`,
    });

    return res.status(200).json({ success: true, message: "Mã đã gửi" });
  } catch (error: any) {
    console.error("Send code error:", error.message);
    return res.status(500).json({ error: "Gửi mã thất bại." });
  }
};
