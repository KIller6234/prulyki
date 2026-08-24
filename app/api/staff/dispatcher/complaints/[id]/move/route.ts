import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import { dispatcherMoveSchema } from "@/lib/validation/dispatcherMove";
import { COLUMN_TO_STATUS } from "@/lib/complaints/kanbanColumn";
import type { ApiResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Переміщення картки звернення між колонками канбану (drag-and-drop або
 * кнопка швидкої зміни статусу). На відміну від загального ендпоінта зміни
 * статусу, не перепризначає звернення на диспетчера, що його перемістив.
 */
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
  const parseResult = dispatcherMoveSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: "Некоректні дані" },
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

  const targetColumn = parseResult.data.column;
  if (targetColumn === "assigned" && !complaint.assignedToStaffId) {
    return NextResponse.json(
      {
        success: false,
        error: "Спочатку призначте інспектора через «Швидке призначення»",
      },
      { status: 400 },
    );
  }

  const nextStatus = COLUMN_TO_STATUS[targetColumn];
  const nextVersionNumber = (complaint.versions[0]?.versionNumber ?? 0) + 1;

  await prisma.$transaction([
    prisma.complaintVersion.create({
      data: {
        complaintId: complaint.id,
        versionNumber: nextVersionNumber,
        status: nextStatus,
        authorStaffId: session.staffId,
      },
    }),
    prisma.complaint.update({
      where: { id: complaint.id },
      data: { status: nextStatus },
    }),
  ]);

  return NextResponse.json({ success: true, data: { status: nextStatus } });
}
