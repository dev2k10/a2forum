const globalForPrisma = globalThis as unknown as { prisma: any };

export async function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const { PrismaClient } = await import("@prisma/client");
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

export default async () => getPrisma();
