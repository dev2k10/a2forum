import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  // Test 1: import pg
  try {
    const pg = await import("pg");
    res.status(200).json({ ok: true, pg: Object.keys(pg) });
  } catch (e: any) {
    res.status(200).json({ ok: false, step: "pg", error: e.message });
  }
};
