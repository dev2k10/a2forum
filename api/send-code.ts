import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Resend API key not configured" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const [{ query }, { Resend }] = await Promise.all([
      import("../lib/db"),
      import("resend"),
    ]);

    const resend = new Resend(key);

    await query(
      "UPDATE verification_codes SET used = TRUE WHERE email = $1 AND used = FALSE",
      [email],
    );

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt],
    );

    await resend.emails.send({
      from: "A2 Forum <no-reply@a2forum.vercel.app>",
      to: email,
      subject: "Mã xác nhận A2 Forum",
      html: `<div style="font-family:Arial,sans-serif;max-width:400px;"><h2>Xác nhận đăng ký</h2><p>Mã của bạn:</p><div style="font-size:32px;font-weight:bold;text-align:center;padding:20px;background:#f0f0f0;border-radius:8px;letter-spacing:8px;">${code}</div><p>Hiệu lực 10 phút.</p></div>`,
    });

    return res.status(200).json({ success: true, message: "Mã đã gửi" });
  } catch (error: any) {
    console.error("Send code error:", error.message);
    return res.status(500).json({ error: "Gửi mã thất bại." });
  }
};
