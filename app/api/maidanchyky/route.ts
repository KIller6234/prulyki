import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { collectionPointsQuerySchema } from "@/lib/validation/collectionPoint";
import { collectionPointCreateSchema } from "@/lib/validation/collectionPointAdmin";
import { getStaffSession } from "@/lib/auth/guard";
import { nextOccurrence } from "@/lib/schedule/nextOccurrence";
import type { ApiResponse } from "@/types/api";

const PROBLEM_FILL_THRESHOLD_PERCENT = 90;

export interface PublicCollectionPointContainer {
  wasteCategory: string;
  volumeLiters: number;
  quantity: number;
}

export interface PublicCollectionPoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
  operatorName: string;
  isBulkWasteSite: boolean;
  fillLevelPercent: number | null;
  lastMeasuredAt: string | null;
  isProblem: boolean;
  nextCollectionAt: string | null;
  containers: PublicCollectionPointContainer[];
}

/**
 * Публічний, доступний без автентифікації перелік активних контейнерних
 * майданчиків. Службові поля (internalNotes, деактивація) навмисно виключені
 * зі відповіді — ФВ-2.9.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PublicCollectionPoint[]>>> {
  const parseResult = collectionPointsQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: "Некоректні параметри запиту" },
      { status: 400 },
    );
  }

  const { wasteCategory, onlyBulk, onlyProblem } = parseResult.data;

  const points = await prisma.collectionPoint.findMany({
    where: {
      status: "ACTIVE",
      ...(onlyBulk ? { isBulkWasteSite: true } : {}),
      ...(wasteCategory
        ? { containers: { some: { wasteCategory } } }
        : {}),
    },
    include: {
      containers: true,
      schedules: { where: { status: "ACTIVE" }, take: 1 },
    },
    orderBy: { address: "asc" },
  });

  const data: PublicCollectionPoint[] = points
    .map((point) => {
      const schedule = point.schedules[0];
      const nextCollectionAt = schedule
        ? nextOccurrence(schedule.daysOfWeek, schedule.timeFrom).toISOString()
        : null;

      return {
        id: point.id,
        address: point.address,
        lat: point.lat,
        lng: point.lng,
        operatorName: point.operatorName,
        isBulkWasteSite: point.isBulkWasteSite,
        fillLevelPercent: point.fillLevelPercent,
        lastMeasuredAt: point.lastMeasuredAt?.toISOString() ?? null,
        isProblem:
          (point.fillLevelPercent ?? 0) >= PROBLEM_FILL_THRESHOLD_PERCENT,
        nextCollectionAt,
        containers: point.containers.map((container) => ({
          wasteCategory: container.wasteCategory,
          volumeLiters: container.volumeLiters,
          quantity: container.quantity,
        })),
      };
    })
    .filter((point) => !onlyProblem || point.isProblem);

  return NextResponse.json({ success: true, data });
}

/** Створення нового майданчика в адмінпанелі (ФВ-2.7) — лише для staff. */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parseResult = collectionPointCreateSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректні дані",
      },
      { status: 400 },
    );
  }

  const point = await prisma.collectionPoint.create({
    data: parseResult.data,
  });

  return NextResponse.json({ success: true, data: { id: point.id } });
}
