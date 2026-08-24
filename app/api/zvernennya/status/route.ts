import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getClientIp, isWithinRateLimit } from "@/lib/rate-limit";
import { complaintStatusQuerySchema } from "@/lib/validation/complaint";
import type { ApiResponse } from "@/types/api";

const RATE_LIMIT_PER_MINUTE = 10;

export interface ComplaintStatusVersion {
  status: string;
  resolutionText: string | null;
  changedAt: string;
}

export interface ComplaintStatusResult {
  registrationNumber: string;
  type: string;
  subject: string;
  status: string;
  isAnnulled: boolean;
  annulReason: string | null;
  createdAt: string;
  dueDate: string;
  versions: ComplaintStatusVersion[];
}

function normalizeContact(value: string): string {
  return value.trim().toLowerCase().replace(/[\s()-]/g, "");
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ComplaintStatusResult>>> {
  const clientIp = getClientIp(request);
  const withinLimit = await isWithinRateLimit({
    ip: clientIp,
    endpoint: "zvernennya-status",
    limitPerMinute: RATE_LIMIT_PER_MINUTE,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { success: false, error: "Забагато запитів. Спробуйте пізніше." },
      { status: 429 },
    );
  }

  const parseResult = complaintStatusQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректний запит",
      },
      { status: 400 },
    );
  }

  const { registrationNumber, contact } = parseResult.data;

  const complaint = await prisma.complaint.findUnique({
    where: { registrationNumber },
    include: { versions: { orderBy: { versionNumber: "asc" } } },
  });

  const normalizedContact = normalizeContact(contact);
  const matchesContact =
    complaint &&
    ((complaint.applicantPhone &&
      normalizeContact(complaint.applicantPhone) === normalizedContact) ||
      (complaint.applicantEmail &&
        normalizeContact(complaint.applicantEmail) === normalizedContact));

  if (!complaint || !matchesContact) {
    return NextResponse.json(
      {
        success: false,
        error: "Звернення не знайдено за вказаними даними",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      registrationNumber: complaint.registrationNumber,
      type: complaint.type,
      subject: complaint.subject,
      status: complaint.status,
      isAnnulled: complaint.isAnnulled,
      annulReason: complaint.annulReason,
      createdAt: complaint.createdAt.toISOString(),
      dueDate: complaint.dueDate.toISOString(),
      versions: complaint.versions.map((version) => ({
        status: version.status,
        resolutionText: version.resolutionText,
        changedAt: version.changedAt.toISOString(),
      })),
    },
  });
}
