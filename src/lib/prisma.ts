import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaAdapter: PrismaMariaDb | undefined;
};

const adapter =
  globalForPrisma.prismaAdapter ||
  new PrismaMariaDb(process.env.DATABASE_URL || "");

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaAdapter = adapter;
}
