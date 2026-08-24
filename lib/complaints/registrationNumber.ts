import { prisma } from "@/lib/db";

const SEQUENCE_PADDING = 6;

/**
 * Формат "ЗВ-{рік}-{6-значний лічильник}" (ФВ-5.2). Лічильник — кількість
 * звернень цього року + 1. Для навантаження цього MVP (одна громада, ручне
 * подання) гонки при одночасному записі малоймовірні; для промислової
 * експлуатації варто перейти на БД-послідовність.
 */
export async function generateRegistrationNumber(
  registeredAt: Date,
): Promise<string> {
  const year = registeredAt.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

  const countThisYear = await prisma.complaint.count({
    where: { createdAt: { gte: yearStart, lt: yearEnd } },
  });

  const sequence = String(countThisYear + 1).padStart(SEQUENCE_PADDING, "0");
  return `ЗВ-${year}-${sequence}`;
}
