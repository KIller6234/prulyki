import { prisma } from "@/lib/db";

/** Список районів для фільтра диспетчерської дошки. */
export async function fetchDispatcherDistricts(): Promise<string[]> {
  const rows = await prisma.street.findMany({
    where: { district: { not: null } },
    select: { district: true },
    distinct: ["district"],
    orderBy: { district: "asc" },
  });

  return rows.map((r) => r.district).filter((d): d is string => d !== null);
}
