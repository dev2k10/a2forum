import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { getPrisma } from "../lib/db";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password, dateOfBirth, code } = req.body;

  if (!name || !email || !password || !code) {
    return res.status(400).json({
      error: "Vui lòng điền đầy đủ thông tin",
    });
  }

  try {
    const prisma = await getPrisma();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email này đã được đăng ký" });
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: { email, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!verificationCode) {
      return res.status(400).json({ error: "Chưa có mã xác nhận." });
    }
    if (verificationCode.code !== code) {
      return res.status(400).json({ error: "Mã xác nhận không đúng" });
    }
    if (verificationCode.expiresAt < new Date()) {
      return res.status(400).json({ error: "Mã xác nhận đã hết hạn." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        verified: true,
      },
    });

    await prisma.verificationCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    return res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
      message: "Đăng ký thành công!",
    });
  } catch (error: any) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ error: "Đăng ký thất bại." });
  }
};
