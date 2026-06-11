import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import sql from "./db";

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error("RESEND_API_KEY environment variable is not set");
}
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!resend) {
    return res
      .status(500)
      .json({
        error:
          "Resend API key chưa được cấu hình. Vui lòng set biến môi trường RESEND_API_KEY trên Vercel.",
      });
  }

  if (!sql) {
    return res
      .status(500)
      .json({
        error:
          "Database chưa được kết nối. Vui lòng set biến môi trường DATABASE_URL trên Vercel.",
      });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Invalidate old unused codes for this email
    await sql`
      UPDATE verification_codes SET used = TRUE
      WHERE email = ${email} AND used = FALSE
    `;

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store code in DB
    await sql`
      INSERT INTO verification_codes (email, code, expires_at)
      VALUES (${email}, ${code}, ${expiresAt})
    `;

    // Send email via Resend
    await resend.emails.send({
      from: "A2 Forum <no-reply@a2forum.vercel.app>",
      to: email,
      subject: "Mã xác nhận đăng ký A2 Forum",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
          <h2>Xác nhận đăng ký A2 Forum</h2>
          <p>Mã xác nhận của bạn là:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f0f0f0; border-radius: 8px; letter-spacing: 8px;">
            ${code}
          </div>
          <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
          <p style="color: #666; margin-top: 20px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Mã xác nhận đã được gửi đến email của bạn",
      });
  } catch (error) {
    console.error("Send code error:", error);
    return res
      .status(500)
      .json({ error: "Không thể gửi mã xác nhận. Vui lòng thử lại sau." });
  }
};
