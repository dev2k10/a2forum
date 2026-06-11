import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { query } from "./db";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password, dateOfBirth, code } = req.body;

  if (!name || !email || !password || !code) {
    return res.status(400).json({
      error:
        "Vui lòng điền đầy đủ thông tin: họ tên, email, mật khẩu và mã xác nhận",
    });
  }

  try {
    // Check if email already exists
    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email này đã được đăng ký" });
    }

    // Verify the code
    const codes = await query(
      "SELECT code, expires_at FROM verification_codes WHERE email = $1 AND used = FALSE ORDER BY created_at DESC LIMIT 1",
      [email],
    );

    if (codes.rows.length === 0) {
      return res.status(400).json({
        error: "Chưa có mã xác nhận. Vui lòng gửi mã trước.",
      });
    }

    const record = codes.rows[0];

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
    const users = await query(
      "INSERT INTO users (name, email, password, date_of_birth, verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING id, name, email, created_at",
      [name, email, hashedPassword, dateOfBirth || null],
    );

    // Mark code as used
    await query(
      "UPDATE verification_codes SET used = TRUE WHERE email = $1 AND used = FALSE",
      [email],
    );

    const user = users.rows[0];

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "Đăng ký thành công!",
    });
  } catch (error: any) {
    console.error("Signup error:", error.message);
    return res
      .status(500)
      .json({ error: "Đăng ký thất bại. Vui lòng thử lại sau." });
  }
};
