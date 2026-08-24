import { prisma } from "@/lib/db";
import {
  statusToColumn,
  COLUMN_TO_STATUSES,
  type KanbanColumnId,
} from "@/lib/complaints/kanbanColumn";
import type { ComplaintPriority, Prisma } from "@/app/generated/prisma/client";

const BOARD_ROW_LIMIT = 300;

export interface DispatcherComplaintItem {
  id: string;
  registrationNumber: string;
  subject: string;
  addressText: string | null;
  district: string | null;
  priority: string;
  status: string;
  column: KanbanColumnId;
  assignedTo: { id: string; fullName: string } | null;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
}

export interface DispatcherComplaintsFilter {
  district?: string;
  priority?: ComplaintPriority;
  column?: KanbanColumnId;
  q?: string;
}

/** Диспетчерська дошка звернень — джерело даних як для сторінки (SSR), так і для API-поллінгу. */
export async function fetchDispatcherComplaints(
  filter: DispatcherComplaintsFilter = {},
): Promise<DispatcherComplaintItem[]> {
  const { district, priority, column, q } = filter;

  const where: Prisma.ComplaintWhereInput = {
    ...(district ? { street: { district } } : {}),
    ...(priority ? { priority } : {}),
    ...(column ? { status: { in: COLUMN_TO_STATUSES[column] } } : {}),
    ...(q
      ? {
          OR: [
            { subject: { contains: q, mode: "insensitive" } },
            { addressText: { contains: q, mode: "insensitive" } },
            { registrationNumber: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const complaints = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: BOARD_ROW_LIMIT,
    include: {
      street: { select: { district: true } },
      assignedToStaff: { select: { id: true, fullName: true } },
      _count: { select: { versions: true } },
    },
  });

  return complaints.map((c) => ({
    id: c.id,
    registrationNumber: c.registrationNumber,
    subject: c.subject,
    addressText: c.addressText,
    district: c.street?.district ?? null,
    priority: c.priority,
    status: c.status,
    column: statusToColumn(c.status),
    assignedTo: c.assignedToStaff
      ? { id: c.assignedToStaff.id, fullName: c.assignedToStaff.fullName }
      : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    commentsCount: Math.max(0, c._count.versions - 1),
  }));
}
