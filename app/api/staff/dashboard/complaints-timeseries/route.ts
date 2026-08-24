import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import type { ApiResponse } from "@/types/api";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PERIOD_DAYS = 30;
const ALLOWED_PERIOD_DAYS = [7, 14, 30, 90];

export interface ComplaintsTimeseriesPoint {
  date: string; // YYYY-MM-DD, Europe/Kyiv calendar day
  count: number;
}

function kyivDateKey(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kyiv",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ComplaintsTimeseriesPoint[]>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const requestedDays = Number(request.nextUrl.searchParams.get("days"));
  const days = ALLOWED_PERIOD_DAYS.includes(requestedDays)
    ? requestedDays
    : DEFAULT_PERIOD_DAYS;

  const now = new Date();
  const periodStart = new Date(now.getTime() - days * DAY_MS);

  const complaints = await prisma.complaint.findMany({
    where: { createdAt: { gte: periodStart } },
    select: { createdAt: true },
  });

  const countsByDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const day = kyivDateKey(new Date(periodStart.getTime() + i * DAY_MS));
    countsByDay.set(day, 0);
  }
  for (const complaint of complaints) {
    const day = kyivDateKey(complaint.createdAt);
    countsByDay.set(day, (countsByDay.get(day) ?? 0) + 1);
  }

  const data: ComplaintsTimeseriesPoint[] = [...countsByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({ success: true, data });
}
