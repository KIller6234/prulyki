import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import { storageProvider } from "@/lib/storage";
import {
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_COMPLAINT_ATTACHMENTS,
} from "@/lib/validation/complaint";
import type { InspectorTaskAttachment } from "@/lib/staff/inspectorTasks";
import type { ApiResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Завантаження фото до власного завдання інспектором — зберігається одразу, не чекає остаточного вирішення. */
export async function POST(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<InspectorTaskAttachment[]>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const complaint = await prisma.complaint.findFirst({
    where: { id, assignedToStaffId: session.staffId },
    include: { attachments: { select: { id: true } } },
  });
  if (!complaint) {
    return NextResponse.json(
      { success: false, error: "Завдання не знайдено" },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const files = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    return NextResponse.json(
      { success: false, error: "Оберіть хоча б один файл" },
      { status: 400 },
    );
  }
  if (complaint.attachments.length + files.length > MAX_COMPLAINT_ATTACHMENTS) {
    return NextResponse.json(
      {
        success: false,
        error: `Максимум ${MAX_COMPLAINT_ATTACHMENTS} фотографій на завдання`,
      },
      { status: 400 },
    );
  }
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: `Файл «${file.name}» перевищує 10 МБ` },
        { status: 400 },
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: `Файл «${file.name}» має бути зображенням` },
        { status: 400 },
      );
    }
  }

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storageProvider.upload("complaints", {
      fileName: file.name,
      contentType: file.type,
      data: buffer,
    });
    await prisma.complaintAttachment.create({
      data: {
        complaintId: id,
        storagePath: stored.storagePath,
        originalFileName: file.name,
        mimeType: file.type,
        sizeBytes: buffer.byteLength,
      },
    });
  }

  const attachments = await prisma.complaintAttachment.findMany({
    where: { complaintId: id },
    orderBy: { uploadedAt: "asc" },
  });

  const data: InspectorTaskAttachment[] = attachments.map((a) => ({
    id: a.id,
    url: `/uploads/${a.storagePath}`,
    originalFileName: a.originalFileName,
  }));

  return NextResponse.json({ success: true, data });
}
