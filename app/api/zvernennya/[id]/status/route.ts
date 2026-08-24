import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import { complaintStatusUpdateSchema } from "@/lib/validation/complaintStatusUpdate";
import type { ApiResponse } from "@/types/api";

const EXTENDED_DEADLINE_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<{ status: string }>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const rawBody: unknown = await request.json().catch(() => null);
  const parseResult = complaintStatusUpdateSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректні дані",
      },
      { status: 400 },
    );
  }

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
  if (!complaint) {
    return NextResponse.json(
      { success: false, error: "Звернення не знайдено" },
      { status: 404 },
    );
  }

  const { status, resolutionText, annulReason } = parseResult.data;
  const nextVersionNumber = (complaint.versions[0]?.versionNumber ?? 0) + 1;

  await prisma.$transaction([
    prisma.complaintVersion.create({
      data: {
        complaintId: complaint.id,
        versionNumber: nextVersionNumber,
        status,
        resolutionText,
        authorStaffId: session.staffId,
      },
    }),
    prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status,
        assignedToStaffId: session.staffId,
        isAnnulled: status === "ANNULLED",
        annulReason: status === "ANNULLED" ? annulReason : complaint.annulReason,
        dueDate:
          status === "EXTENDED"
            ? new Date(Date.now() + EXTENDED_DEADLINE_DAYS * DAY_MS)
            : complaint.dueDate,
      },
    }),
  ]);

  return NextResponse.json({ success: true, data: { status } });
}
