import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import type { ApiResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{ id: string; attachmentId: string }>;
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const { id, attachmentId } = await params;
  const complaint = await prisma.complaint.findFirst({
    where: { id, assignedToStaffId: session.staffId },
    select: { id: true },
  });
  if (!complaint) {
    return NextResponse.json(
      { success: false, error: "Завдання не знайдено" },
      { status: 404 },
    );
  }

  const attachment = await prisma.complaintAttachment.findFirst({
    where: { id: attachmentId, complaintId: id },
  });
  if (!attachment) {
    return NextResponse.json(
      { success: false, error: "Фото не знайдено" },
      { status: 404 },
    );
  }

  await prisma.complaintAttachment.delete({ where: { id: attachmentId } });

  return NextResponse.json({ success: true, data: { id: attachmentId } });
}
