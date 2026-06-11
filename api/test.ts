import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const url = process.env.DATABASE_URL;
    const prisma = new PrismaClient({ accelerateUrl: url, log: ["query"] });
    await prisma.$connect();
    const r = await prisma.$queryRaw`SELECT 1 as val`;
    await prisma.$disconnect();
    return res.json({ ok: true, result: r });
  } catch (e: any) {
    return res.status(200).json({
      ok: false,
      name: e.constructor?.name,
      error: e.message,
      stack: e.stack?.split("\n").slice(0, 5),
    });
  }
};
