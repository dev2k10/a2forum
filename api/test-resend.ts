import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("No RESEND_API_KEY");
    const r = new Resend(key);
    res.json({ ok: true, message: "Resend initialized" });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
