import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { scheduleSearchQuerySchema } from "@/lib/validation/schedule";
import { normalizeUkrainianStreetName } from "@/lib/geo/ukrainianNormalize";
import { nextOccurrence } from "@/lib/schedule/nextOccurrence";
import type { ApiResponse } from "@/types/api";

// Правило заборони раннього виставлення тари — не раніше ніж за 1 годину
// до визначеного графіком часу (ФВ-3.5, п. 2.16 ДСанПіН — точний реквізит
// підлягає верифікації при наповненні бази знань, див. план).
const SET_OUT_LEAD_TIME_MS = 60 * 60 * 1000;

interface StreetMatchRow {
  id: string;
  name: string;
  collectionMethod: "CONTAINER" | "PACKAGE";
  primaryCollectionPointId: string | null;
}

export interface ScheduleSearchResult {
  streetName: string;
  collectionMethod: "CONTAINER" | "PACKAGE";
  nextCollectionAt: string;
  collectionPoint?: {
    id: string;
    address: string;
    lat: number;
    lng: number;
  };
  earliestSetOutAt?: string;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ScheduleSearchResult>>> {
  const parseResult = scheduleSearchQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: "Вкажіть назву вулиці" },
      { status: 400 },
    );
  }

  const normalized = normalizeUkrainianStreetName(parseResult.data.street);
  if (!normalized) {
    return NextResponse.json(
      { success: false, error: "Вкажіть назву вулиці" },
      { status: 400 },
    );
  }

  const matches = await prisma.$queryRaw<StreetMatchRow[]>`
    SELECT id, name, "collectionMethod", "primaryCollectionPointId"
    FROM "Street"
    WHERE "nameNormalized" % ${normalized}
       OR "nameNormalized" ILIKE '%' || ${normalized} || '%'
    ORDER BY similarity("nameNormalized", ${normalized}) DESC
    LIMIT 1
  `;

  const match = matches[0];
  if (!match) {
    return NextResponse.json(
      {
        success: false,
        error: `Вулицю «${parseResult.data.street}» не знайдено в довіднику`,
      },
      { status: 404 },
    );
  }

  if (match.collectionMethod === "CONTAINER") {
    return resolveContainerMethod(match);
  }
  return resolvePackageMethod(match);
}

async function resolveContainerMethod(
  match: StreetMatchRow,
): Promise<NextResponse<ApiResponse<ScheduleSearchResult>>> {
  if (!match.primaryCollectionPointId) {
    return NextResponse.json(
      {
        success: false,
        error: "Для цієї вулиці ще не призначено контейнерний майданчик",
      },
      { status: 404 },
    );
  }

  const point = await prisma.collectionPoint.findUnique({
    where: { id: match.primaryCollectionPointId },
    include: { schedules: { where: { status: "ACTIVE" }, take: 1 } },
  });
  const schedule = point?.schedules[0];

  if (!point || !schedule) {
    return NextResponse.json(
      {
        success: false,
        error: "Для найближчого майданчика ще не затверджено графік",
      },
      { status: 404 },
    );
  }

  const nextCollectionAt = nextOccurrence(schedule.daysOfWeek, schedule.timeFrom);

  return NextResponse.json({
    success: true,
    data: {
      streetName: match.name,
      collectionMethod: "CONTAINER",
      nextCollectionAt: nextCollectionAt.toISOString(),
      collectionPoint: {
        id: point.id,
        address: point.address,
        lat: point.lat,
        lng: point.lng,
      },
    },
  });
}

async function resolvePackageMethod(
  match: StreetMatchRow,
): Promise<NextResponse<ApiResponse<ScheduleSearchResult>>> {
  const packageLink = await prisma.schedulePackageStreet.findFirst({
    where: { streetId: match.id, schedulePackage: { status: "ACTIVE" } },
    include: { schedulePackage: true },
  });

  if (!packageLink) {
    return NextResponse.json(
      {
        success: false,
        error: "Для цієї вулиці ще не затверджено графік пакетного вивезення",
      },
      { status: 404 },
    );
  }

  const nextCollectionAt = nextOccurrence(
    packageLink.schedulePackage.daysOfWeek,
    packageLink.schedulePackage.timeFrom,
  );
  const earliestSetOutAt = new Date(
    nextCollectionAt.getTime() - SET_OUT_LEAD_TIME_MS,
  );

  return NextResponse.json({
    success: true,
    data: {
      streetName: match.name,
      collectionMethod: "PACKAGE",
      nextCollectionAt: nextCollectionAt.toISOString(),
      earliestSetOutAt: earliestSetOutAt.toISOString(),
    },
  });
}
