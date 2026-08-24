import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma: PrismaClient =
  globalThis.prismaGlobal ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
