import { prisma } from "@/lib/db";
import { computeTrend, type TrendInfo } from "@/lib/staff/trend";
import { getKyivDateParts, kyivWallClockToUtc } from "@/lib/schedule/nextOccurrence";

const DAY_MS = 24 * 60 * 60 * 1000;
const IN_PROGRESS_STATUSES = ["UNDER_REVIEW", "FORWARDED", "EXTENDED"] as const;
const RESOLUTION_WINDOW_DAYS = 30;

export interface DispatcherStat {
  value: string;
  trend: TrendInfo | null;
}

export interface DispatcherStats {
  complaintsToday: DispatcherStat;
  inProgress: DispatcherStat;
  resolvedToday: DispatcherStat;
  avgResolutionTime: DispatcherStat;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes} хв`;
  return `${hours} год ${minutes} хв`;
}

/** Межі календарного дня за київським часом, виражені в UTC-моментах. */
function kyivDayBounds(daysAgo: number): { start: Date; end: Date } {
  const targetInstant = new Date(Date.now() - daysAgo * DAY_MS);
  const { year, month, day } = getKyivDateParts(targetInstant);
  const start = kyivWallClockToUtc({ year, month, day }, 0, 0);
  const end = new Date(start.getTime() + DAY_MS);
  return { start, end };
}

export async function computeDispatcherStats(): Promise<DispatcherStats> {
  const today = kyivDayBounds(0);
  const yesterday = kyivDayBounds(1);
  const resolutionWindowStart = new Date(
    Date.now() - RESOLUTION_WINDOW_DAYS * DAY_MS,
  );

  const [
    complaintsToday,
    complaintsYesterday,
    inProgressCount,
    resolvedTodayCount,
    resolvedComplaints,
  ] = await Promise.all([
    prisma.complaint.count({
      where: { createdAt: { gte: today.start, lt: today.end } },
    }),
    prisma.complaint.count({
      where: { createdAt: { gte: yesterday.start, lt: yesterday.end } },
    }),
    prisma.complaint.count({
      where: { status: { in: [...IN_PROGRESS_STATUSES] } },
    }),
    prisma.complaintVersion.count({
      where: {
        status: "DONE",
        changedAt: { gte: today.start, lt: today.end },
      },
    }),
    prisma.complaint.findMany({
      where: {
        status: "DONE",
        createdAt: { gte: resolutionWindowStart },
      },
      select: {
        createdAt: true,
        versions: {
          where: { status: "DONE" },
          orderBy: { versionNumber: "desc" },
          take: 1,
          select: { changedAt: true },
        },
      },
    }),
  ]);

  const resolutionMinutes = resolvedComplaints
    .filter((c) => c.versions[0])
    .map(
      (c) => (c.versions[0].changedAt.getTime() - c.createdAt.getTime()) / 60000,
    );
  const avgResolutionMinutes =
    resolutionMinutes.length === 0
      ? null
      : resolutionMinutes.reduce((a, b) => a + b, 0) / resolutionMinutes.length;

  return {
    complaintsToday: {
      value: String(complaintsToday),
      trend: computeTrend(complaintsToday, complaintsYesterday, "до вчора"),
    },
    inProgress: {
      value: String(inProgressCount),
      trend: null,
    },
    resolvedToday: {
      value: String(resolvedTodayCount),
      trend: null,
    },
    avgResolutionTime: {
      value:
        avgResolutionMinutes === null ? "—" : formatMinutes(avgResolutionMinutes),
      trend: null,
    },
  };
}
