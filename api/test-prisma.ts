import type { VercelRequest, VercelResponse } from "@vercel/node";
import prisma from "./db";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true, prisma: "Prisma works!", result });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e.message,
      stack: e.stack?.split("\n").slice(0, 3),
    });
  }
};
