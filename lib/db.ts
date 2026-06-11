import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? ({} as PrismaClient);

// Lazy init with adapter (avoids module-level crash on Vercel)
export async function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const { PrismaPg } = await import("@prisma/adapter-pg");
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;

  const adapter = new PrismaPg({ connectionString: url });
  const client = new PrismaClient({ adapter, log: ["error"] });

  globalForPrisma.prisma = client;
  return client;
}

export default prisma;
