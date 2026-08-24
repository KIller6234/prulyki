import { prisma } from "@/lib/db";

const ACTIVE_WORKLOAD_STATUSES = ["UNDER_REVIEW", "FORWARDED", "EXTENDED"] as const;

export interface DispatcherInspectorItem {
  id: string;
  fullName: string;
  activeComplaintsCount: number;
}

/** Активні інспектори з поточним навантаженням — для форми швидкого призначення. */
export async function fetchDispatcherInspectors(): Promise<
  DispatcherInspectorItem[]
> {
  const inspectors = await prisma.staffUser.findMany({
    where: { role: "INSPECTOR", isActive: true },
    select: {
      id: true,
      fullName: true,
      _count: {
        select: {
          assignedComplaints: {
            where: { status: { in: [...ACTIVE_WORKLOAD_STATUSES] } },
          },
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  return inspectors.map((inspector) => ({
    id: inspector.id,
    fullName: inspector.fullName,
    activeComplaintsCount: inspector._count.assignedComplaints,
  }));
}
