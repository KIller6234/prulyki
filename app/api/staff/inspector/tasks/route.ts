import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/auth/guard";
import { fetchInspectorTasks } from "@/lib/staff/inspectorTasks";
import type { InspectorTaskListItem } from "@/lib/staff/inspectorTasks";
import type { ApiResponse } from "@/types/api";

export type { InspectorTaskListItem } from "@/lib/staff/inspectorTasks";

/** Завдання, призначені поточному співробітнику (для кабінету інспектора). */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<InspectorTaskListItem[]>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const statusFilter = request.nextUrl.searchParams.get("status") ?? undefined;
  const data = await fetchInspectorTasks(session.staffId, statusFilter);
  return NextResponse.json({ success: true, data });
}
