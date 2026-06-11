import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Dynamic import to isolate any load error
    const { PrismaClient } = await import("@prisma/client");
    const p = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
    });
    const result = await p.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, result });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e.message,
      name: e.constructor?.name,
      stack: e.stack?.split("\n").slice(0, 4),
    });
  }
};
