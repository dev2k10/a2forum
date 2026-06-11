import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { query } from "./db";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu" });
  }

  try {
    // Find user
    const users = await query(
      "SELECT id, name, email, password, verified, date_of_birth FROM users WHERE email = $1",
      [email],
    );

    if (users.rows.length === 0) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

    const user = users.rows[0];

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }

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
    console.error("Login error:", error.message);
    return res
      .status(500)
      .json({ error: "Đăng nhập thất bại. Vui lòng thử lại sau." });
  }
};
