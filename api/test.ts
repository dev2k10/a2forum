import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "./_db";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Test table exists
    const tables = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    );
    const result = await query("SELECT 1 as val");
    return res.json({
      ok: true,
      tables: tables.rows.map((r) => r.table_name),
      result: result.rows,
    });
  } catch (e: any) {
    return res.json({
      ok: false,
      error: e.message,
      stack: e.stack?.split("\n").slice(0, 4),
    });
  }
};
