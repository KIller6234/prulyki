import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { storageProvider } from "@/lib/storage";
import { formDataToStringRecord } from "@/lib/formData";
import { getClientIp, isWithinRateLimit } from "@/lib/rate-limit";
import { generateRegistrationNumber } from "@/lib/complaints/registrationNumber";
import { computeComplaintDeadline } from "@/lib/complaints/deadline";
import {
  complaintCreateSchema,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_COMPLAINT_ATTACHMENTS,
} from "@/lib/validation/complaint";
import type { ApiResponse } from "@/types/api";

const RATE_LIMIT_PER_MINUTE = 5;

export interface ComplaintCreateResult {
  registrationNumber: string;
  dueDate: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ComplaintCreateResult>>> {
  const clientIp = getClientIp(request);
  const withinLimit = await isWithinRateLimit({
    ip: clientIp,
    endpoint: "zvernennya-create",
    limitPerMinute: RATE_LIMIT_PER_MINUTE,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { success: false, error: "Забагато запитів. Спробуйте пізніше." },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const parseResult = complaintCreateSchema.safeParse(
    formDataToStringRecord(formData),
  );

  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректні дані форми",
      },
      { status: 400 },
    );
  }

  const attachmentValidationError = validateAttachments(
    formData.getAll("attachments"),
  );
  if (attachmentValidationError) {
    return NextResponse.json(
      { success: false, error: attachmentValidationError },
      { status: 400 },
    );
  }

  const input = parseResult.data;
  const registeredAt = new Date();
  const registrationNumber = await generateRegistrationNumber(registeredAt);
  const { dueDate, deadlineType } = computeComplaintDeadline(
    input.type,
    registeredAt,
  );

  const complaint = await prisma.complaint.create({
    data: {
      registrationNumber,
      type: input.type,
      subject: input.subject,
      description: input.description,
      addressText: input.addressText,
      lat: input.lat,
      lng: input.lng,
      applicantName: input.applicantName,
      applicantPhone: input.applicantPhone,
      applicantEmail: input.applicantEmail,
      personalDataConsent: input.personalDataConsent,
      deadlineType,
      dueDate,
      versions: {
        create: {
          versionNumber: 1,
          status: "REGISTERED",
        },
      },
    },
  });

  const attachmentFiles = formData
    .getAll("attachments")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  for (const file of attachmentFiles) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await storageProvider.upload("complaints", {
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      data: buffer,
    });
    await prisma.complaintAttachment.create({
      data: {
        complaintId: complaint.id,
        storagePath: stored.storagePath,
        originalFileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: buffer.byteLength,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      registrationNumber: complaint.registrationNumber,
      dueDate: complaint.dueDate.toISOString(),
    },
  });
}

function validateAttachments(entries: FormDataEntryValue[]): string | null {
  const files = entries.filter((entry): entry is File => entry instanceof File);

  if (files.length > MAX_COMPLAINT_ATTACHMENTS) {
    return `Максимум ${MAX_COMPLAINT_ATTACHMENTS} фотододатків`;
  }
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return `Файл «${file.name}» перевищує 10 МБ`;
    }
    if (file.size > 0 && !file.type.startsWith("image/")) {
      return `Файл «${file.name}» має бути зображенням`;
    }
  }
  return null;
}
