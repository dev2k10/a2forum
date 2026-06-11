import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import sql from "./db";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password, dateOfBirth, code } = req.body;

  if (!name || !email || !password || !code) {
    return res.status(400).json({
      error: "Vui lòng điền đầy đủ thông tin: họ tên, email, mật khẩu và mã xác nhận",
    });
  }

  try {
    // Check if email already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email này đã được đăng ký" });
    }

    // Verify the code
    const codes = await sql`
      SELECT code, expires_at FROM verification_codes
      WHERE email = ${email} AND used = FALSE
      ORDER BY created_at DESC LIMIT 1
    `;

    if (codes.length === 0) {
      return res.status(400).json({
        error: "Chưa có mã xác nhận. Vui lòng gửi mã trước.",
      });
    }

    const record = codes[0];

    if (record.code !== code) {
      return res.status(400).json({ error: "Mã xác nhận không đúng" });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({
        error: "Mã xác nhận đã hết hạn. Vui lòng gửi lại mã mới.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const users = await sql`
      INSERT INTO users (name, email, password, date_of_birth, verified)
      VALUES (${name}, ${email}, ${hashedPassword}, ${dateOfBirth || null}, TRUE)
      RETURNING id, name, email, created_at
    `;

    // Mark code as used
    await sql`
      UPDATE verification_codes SET used = TRUE
      WHERE email = ${email} AND used = FALSE
    `;

    const user = users[0];

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "Đăng ký thành công!",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Đăng ký thất bại. Vui lòng thử lại sau." });
  }
};
