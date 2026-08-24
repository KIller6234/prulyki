import { prisma } from "@/lib/db";
import { computeTrend, type TrendInfo } from "@/lib/staff/trend";

const PERIOD_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const PERIOD_LABEL = "за останні 7 днів";
const SOON_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;
const NON_TERMINAL_STATUSES = [
  "REGISTERED",
  "UNDER_REVIEW",
  "FORWARDED",
  "EXTENDED",
] as const;

export interface DashboardStat {
  value: string;
  trend: TrendInfo | null;
}

export interface DashboardStats {
  totalComplaints: DashboardStat;
  activeStaff: DashboardStat;
  activeCollectionPoints: DashboardStat;
  avgResponseTime: DashboardStat;
  /** Звернення зі строком, що спливає (≤3 дні) або прострочено — для бейджа сповіщень. */
  urgentComplaintsCount: number;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes} хв`;
  return `${hours} год ${minutes} хв`;
}

/**
 * Середній час від реєстрації звернення до першої зміни статусу
 * (перша версія після REGISTERED) — для звернень, зареєстрованих у вікні.
 */
async function computeAvgResponseMinutes(
  from: Date,
  to: Date,
): Promise<number | null> {
  const complaints = await prisma.complaint.findMany({
    where: { createdAt: { gte: from, lt: to } },
    select: {
      createdAt: true,
      versions: {
        where: { versionNumber: 2 },
        select: { changedAt: true },
        take: 1,
      },
    },
  });

  const durationsMinutes = complaints
    .filter((c) => c.versions[0])
    .map(
      (c) =>
        (c.versions[0].changedAt.getTime() - c.createdAt.getTime()) / 60000,
    );

  if (durationsMinutes.length === 0) return null;
  return durationsMinutes.reduce((a, b) => a + b, 0) / durationsMinutes.length;
}

export async function computeDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const periodStart = new Date(now.getTime() - PERIOD_DAYS * DAY_MS);
  const previousPeriodStart = new Date(
    periodStart.getTime() - PERIOD_DAYS * DAY_MS,
  );

  const [
    totalComplaints,
    complaintsThisPeriod,
    complaintsPrevPeriod,
    activeStaffCount,
    staffCreatedThisPeriod,
    staffCreatedPrevPeriod,
    activeCollectionPointsCount,
    pointsCreatedThisPeriod,
    pointsCreatedPrevPeriod,
  ] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { createdAt: { gte: periodStart } } }),
    prisma.complaint.count({
      where: { createdAt: { gte: previousPeriodStart, lt: periodStart } },
    }),
    prisma.staffUser.count({ where: { isActive: true } }),
    prisma.staffUser.count({ where: { createdAt: { gte: periodStart } } }),
    prisma.staffUser.count({
      where: { createdAt: { gte: previousPeriodStart, lt: periodStart } },
    }),
    prisma.collectionPoint.count({ where: { status: "ACTIVE" } }),
    prisma.collectionPoint.count({
      where: { createdAt: { gte: periodStart } },
    }),
    prisma.collectionPoint.count({
      where: { createdAt: { gte: previousPeriodStart, lt: periodStart } },
    }),
  ]);

  const urgentComplaintsCount = await prisma.complaint.count({
    where: {
      status: { in: [...NON_TERMINAL_STATUSES] },
      dueDate: { lte: new Date(now.getTime() + SOON_THRESHOLD_MS) },
    },
  });

  const [responseTimeThisPeriod, responseTimePrevPeriod] = await Promise.all([
    computeAvgResponseMinutes(periodStart, now),
    computeAvgResponseMinutes(previousPeriodStart, periodStart),
  ]);

  return {
    totalComplaints: {
      value: String(totalComplaints),
      trend: computeTrend(
        complaintsThisPeriod,
        complaintsPrevPeriod,
        PERIOD_LABEL,
      ),
    },
    activeStaff: {
      value: String(activeStaffCount),
      trend: computeTrend(
        staffCreatedThisPeriod,
        staffCreatedPrevPeriod,
        PERIOD_LABEL,
      ),
    },
    activeCollectionPoints: {
      value: String(activeCollectionPointsCount),
      trend: computeTrend(
        pointsCreatedThisPeriod,
        pointsCreatedPrevPeriod,
        PERIOD_LABEL,
      ),
    },
    avgResponseTime: {
      value:
        responseTimeThisPeriod === null
          ? "—"
          : formatMinutes(responseTimeThisPeriod),
      trend:
        responseTimeThisPeriod !== null && responseTimePrevPeriod !== null
          ? computeTrend(
              Math.round(responseTimeThisPeriod),
              Math.round(responseTimePrevPeriod),
              PERIOD_LABEL,
            )
          : null,
    },
    urgentComplaintsCount,
  };
}
