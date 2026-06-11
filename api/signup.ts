import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { query } from "../lib/db";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password, dateOfBirth, code } = req.body;
  if (!name || !email || !password || !code) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email exists" });
    }

    const codes = await query(
      "SELECT code, expires_at FROM verification_codes WHERE email = $1 AND used = FALSE ORDER BY created_at DESC LIMIT 1",
      [email],
    );

    if (codes.rows.length === 0) {
      return res.status(400).json({ error: "No verification code found" });
    }

    const record = codes.rows[0];
    if (record.code !== code) {
      return res.status(400).json({ error: "Wrong code" });
    }
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: "Code expired" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await query(
      "INSERT INTO users (name, email, password, date_of_birth, verified) VALUES ($1, $2, $3, $4, TRUE)",
      [name, email, hashed, dateOfBirth || null],
    );

    await query(
      "UPDATE verification_codes SET used = TRUE WHERE email = $1 AND used = FALSE",
      [email],
    );

    return res.status(201).json({ success: true, message: "Signup OK" });
  } catch (error: any) {
    console.error("Signup:", error.message);
    return res.status(500).json({ error: "Signup failed" });
  }
};
