import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/auth/guard";
import { dispatcherComplaintsQuerySchema } from "@/lib/validation/dispatcherComplaintsQuery";
import { fetchDispatcherComplaints } from "@/lib/staff/dispatcherComplaints";
import type { DispatcherComplaintItem } from "@/lib/staff/dispatcherComplaints";
import type { ApiResponse } from "@/types/api";

export type { DispatcherComplaintItem } from "@/lib/staff/dispatcherComplaints";

/** Диспетчерська дошка звернень — фільтри за районом/пріоритетом/колонкою/текстом. */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<DispatcherComplaintItem[]>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const parseResult = dispatcherComplaintsQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: "Некоректні параметри запиту" },
      { status: 400 },
    );
  }

  const data = await fetchDispatcherComplaints(parseResult.data);
  return NextResponse.json({ success: true, data });
}
