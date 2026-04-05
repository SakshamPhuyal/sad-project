import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaAdapter: PrismaMariaDb | undefined;
};

function createAdapterFromEnv() {
  const rawUrl = process.env.DATABASE_URL?.trim();
  if (!rawUrl) {
    throw new Error("DATABASE_URL is missing");
  }

  const parsed = new URL(rawUrl);
  const sslMode = parsed.searchParams.get("ssl-mode")?.toUpperCase();
  const useSsl = sslMode !== "DISABLED";

  const adapterConfig = {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "") || undefined,
    connectTimeout: 10_000,
    acquireTimeout: 10_000,
    // `mariadb` driver can hang with `ssl: true`; explicit options are more reliable.
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  };

  return new PrismaMariaDb(adapterConfig);
}

const adapter = globalForPrisma.prismaAdapter || createAdapterFromEnv();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaAdapter = adapter;
}
