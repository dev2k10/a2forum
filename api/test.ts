import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../lib/db";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const r = await query("SELECT 1 as val");
    return res.json({ ok: true, result: r.rows });
  } catch (e: any) {
    return res.status(200).json({
      ok: false,
      error: e.message,
      name: e.constructor?.name,
      stack: e.stack?.split("\n").slice(0, 4),
    });
  }
};
