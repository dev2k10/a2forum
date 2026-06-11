import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "./db";
import { Resend } from "resend";
import bcrypt from "bcryptjs";

export default async (req: VercelRequest, res: VercelResponse) => {
  const results: Record<string, any> = {};

  // Test Resend init
  try {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      const r = new Resend(key);
      results.resend = "Resend initialized OK";
    } else {
      results.resend = "RESEND_API_KEY not set";
    }
  } catch (e: any) {
    results.resend = `Resend error: ${e.message}`;
  }

  // Test DB query
  try {
    const result = await query("SELECT NOW() as time");
    results.db = `DB connected: ${result.rows[0].time}`;
  } catch (e: any) {
    results.db = `DB error: ${e.message}`;
  }

  // Test bcrypt
  try {
    const hash = await bcrypt.hash("test", 4);
    results.bcrypt = `Bcrypt OK (hash=${hash.substring(0, 10)}...)`;
  } catch (e: any) {
    results.bcrypt = `Bcrypt error: ${e.message}`;
  }

  res.status(200).json({ ok: true, results });
};
