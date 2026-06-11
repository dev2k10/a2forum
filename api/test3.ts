import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  const results: any = {};

  try {
    const b = await import("bcryptjs");
    results.bcrypt = "ok";
  } catch (e: any) {
    results.bcrypt = e.message;
  }

  try {
    const r = await import("resend");
    results.resend = "ok";
  } catch (e: any) {
    results.resend = e.message;
  }

  try {
    const { Pool } = await import("pg");
    results.pg = "ok";
  } catch (e: any) {
    results.pg = e.message;
  }

  res.json({ ok: true, results });
};
