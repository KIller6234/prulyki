import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { streetAutocompleteQuerySchema } from "@/lib/validation/schedule";
import { normalizeUkrainianStreetName } from "@/lib/geo/ukrainianNormalize";
import type { ApiResponse } from "@/types/api";

const AUTOCOMPLETE_LIMIT = 8;

export interface StreetSuggestion {
  id: string;
  name: string;
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<StreetSuggestion[]>>> {
  const parseResult = streetAutocompleteQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parseResult.success) {
    return NextResponse.json({ success: true, data: [] });
  }

  const normalized = normalizeUkrainianStreetName(parseResult.data.q);
  if (!normalized) {
    return NextResponse.json({ success: true, data: [] });
  }

  const streets = await prisma.street.findMany({
    where: { nameNormalized: { contains: normalized } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: AUTOCOMPLETE_LIMIT,
  });

  return NextResponse.json({ success: true, data: streets });
}
