import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// На serverless-хостингу (Netlify Functions) кожен інстанс функції тримає
// власний пул з'єднань. Supabase-пулер має ліміт pool_size, тож без
// обмеження `max` з'єднання впираються в EMAXCONNSESSION і кожен запит до
// БД падає з 500. Тримаємо маленький пул на інстанс і переживаємо клієнта
// між викликами через globalThis — у тому числі в production.
const POOL_MAX = Number(process.env.DATABASE_POOL_MAX ?? 1);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: POOL_MAX,
});

export const prisma: PrismaClient =
  globalThis.prismaGlobal ?? new PrismaClient({ adapter });

globalThis.prismaGlobal = prisma;
