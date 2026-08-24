import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import { dispatcherAssignSchema } from "@/lib/validation/dispatcherAssign";
import type { ApiResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Призначення звернення інспектору диспетчером — не змінює assignedToStaffId на себе. */
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
  const parseResult = dispatcherAssignSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректні дані",
      },
      { status: 400 },
    );
  }

  const inspector = await prisma.staffUser.findUnique({
    where: { id: parseResult.data.staffId },
  });
  if (!inspector || inspector.role !== "INSPECTOR" || !inspector.isActive) {
    return NextResponse.json(
      { success: false, error: "Інспектора не знайдено або він неактивний" },
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

  const nextStatus = complaint.status === "REGISTERED" ? "UNDER_REVIEW" : complaint.status;
  const nextVersionNumber = (complaint.versions[0]?.versionNumber ?? 0) + 1;

  await prisma.$transaction([
    prisma.complaintVersion.create({
      data: {
        complaintId: complaint.id,
        versionNumber: nextVersionNumber,
        status: nextStatus,
        authorStaffId: session.staffId,
        resolutionText: `Призначено виконавця: ${inspector.fullName}`,
      },
    }),
    prisma.complaint.update({
      where: { id: complaint.id },
      data: { assignedToStaffId: inspector.id, status: nextStatus },
    }),
  ]);

  return NextResponse.json({ success: true, data: { status: nextStatus } });
}
