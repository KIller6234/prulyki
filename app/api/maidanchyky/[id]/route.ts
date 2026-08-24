import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import { collectionPointUpdateSchema } from "@/lib/validation/collectionPointAdmin";
import type { ApiResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Деактивація майданчика зберігає запис в історії (не видаляється) і
 * прибирає його з публічної мапи — GET /api/maidanchyky фільтрує лише
 * status=ACTIVE (ФВ-2.7).
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const rawBody: unknown = await request.json().catch(() => null);
  const parseResult = collectionPointUpdateSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректні дані",
      },
      { status: 400 },
    );
  }

  const { status, deactivationReason, fillLevelPercent } = parseResult.data;

  const point = await prisma.collectionPoint.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(status === "INACTIVE"
        ? { deactivatedAt: new Date(), deactivationReason }
        : {}),
      ...(status === "ACTIVE"
        ? { deactivatedAt: null, deactivationReason: null }
        : {}),
      ...(fillLevelPercent !== undefined
        ? { fillLevelPercent, lastMeasuredAt: new Date() }
        : {}),
    },
  });

  return NextResponse.json({ success: true, data: { id: point.id } });
}
