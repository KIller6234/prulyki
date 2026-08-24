import { prisma } from "@/lib/db";
import type { ComplaintStatus } from "@/app/generated/prisma/client";

const ALL_TASK_STATUSES: ComplaintStatus[] = [
  "UNDER_REVIEW",
  "FORWARDED",
  "EXTENDED",
  "DONE",
];

const STATUS_FILTER_GROUPS: Record<string, ComplaintStatus[]> = {
  pending: ["UNDER_REVIEW"],
  in_progress: ["FORWARDED", "EXTENDED"],
  done: ["DONE"],
};

export interface InspectorTaskListItem {
  id: string;
  registrationNumber: string;
  subject: string;
  description: string;
  addressText: string | null;
  lat: number | null;
  lng: number | null;
  priority: string;
  status: string;
  createdAt: string;
}

/** Завдання, призначені конкретному інспектору — не показує чужі звернення. */
export async function fetchInspectorTasks(
  staffId: string,
  statusFilter?: string,
): Promise<InspectorTaskListItem[]> {
  const statuses =
    statusFilter && STATUS_FILTER_GROUPS[statusFilter]
      ? STATUS_FILTER_GROUPS[statusFilter]
      : ALL_TASK_STATUSES;

  const complaints = await prisma.complaint.findMany({
    where: { assignedToStaffId: staffId, status: { in: statuses } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      registrationNumber: true,
      subject: true,
      description: true,
      addressText: true,
      lat: true,
      lng: true,
      priority: true,
      status: true,
      createdAt: true,
    },
  });

  return complaints.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }));
}

export interface InspectorTaskAttachment {
  id: string;
  url: string;
  originalFileName: string;
}

export interface InspectorTaskDetail extends InspectorTaskListItem {
  assignedToFullName: string | null;
  reportedFillLevelPercent: number | null;
  collectionPoint: {
    id: string;
    address: string;
    lat: number;
    lng: number;
    fillLevelPercent: number | null;
  } | null;
  attachments: InspectorTaskAttachment[];
}

export async function fetchInspectorTaskDetail(
  staffId: string,
  complaintId: string,
): Promise<InspectorTaskDetail | null> {
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, assignedToStaffId: staffId },
    include: {
      attachments: { orderBy: { uploadedAt: "asc" } },
      assignedToStaff: { select: { fullName: true } },
      collectionPoint: {
        select: { id: true, address: true, lat: true, lng: true, fillLevelPercent: true },
      },
    },
  });
  if (!complaint) return null;

  return {
    id: complaint.id,
    registrationNumber: complaint.registrationNumber,
    subject: complaint.subject,
    description: complaint.description,
    addressText: complaint.addressText,
    lat: complaint.lat,
    lng: complaint.lng,
    priority: complaint.priority,
    status: complaint.status,
    createdAt: complaint.createdAt.toISOString(),
    assignedToFullName: complaint.assignedToStaff?.fullName ?? null,
    reportedFillLevelPercent: complaint.reportedFillLevelPercent,
    collectionPoint: complaint.collectionPoint,
    attachments: complaint.attachments.map((a) => ({
      id: a.id,
      url: `/uploads/${a.storagePath}`,
      originalFileName: a.originalFileName,
    })),
  };
}

export type ResolveInspectorTaskError =
  | "not_found"
  | "already_done"
  | "photos_required";

export async function resolveInspectorTask(
  staffId: string,
  complaintId: string,
  input: { resolutionText?: string; fillLevelPercent: number },
): Promise<{ error: ResolveInspectorTaskError | null }> {
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, assignedToStaffId: staffId },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      attachments: { select: { id: true }, take: 1 },
    },
  });
  if (!complaint) return { error: "not_found" };
  if (complaint.status === "DONE") return { error: "already_done" };
  if (complaint.attachments.length === 0) return { error: "photos_required" };

  const nextVersionNumber = (complaint.versions[0]?.versionNumber ?? 0) + 1;

  await prisma.$transaction([
    prisma.complaintVersion.create({
      data: {
        complaintId,
        versionNumber: nextVersionNumber,
        status: "DONE",
        resolutionText: input.resolutionText,
        authorStaffId: staffId,
      },
    }),
    prisma.complaint.update({
      where: { id: complaintId },
      data: { status: "DONE", reportedFillLevelPercent: input.fillLevelPercent },
    }),
    ...(complaint.collectionPointId
      ? [
          prisma.collectionPoint.update({
            where: { id: complaint.collectionPointId },
            data: {
              fillLevelPercent: input.fillLevelPercent,
              lastMeasuredAt: new Date(),
            },
          }),
        ]
      : []),
  ]);

  return { error: null };
}
