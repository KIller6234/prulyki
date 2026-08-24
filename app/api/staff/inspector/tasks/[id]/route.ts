import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/guard";
import { fetchInspectorTaskDetail } from "@/lib/staff/inspectorTasks";
import type { InspectorTaskDetail } from "@/lib/staff/inspectorTasks";
import type { ApiResponse } from "@/types/api";

export type { InspectorTaskDetail, InspectorTaskAttachment } from "@/lib/staff/inspectorTasks";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<InspectorTaskDetail>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const task = await fetchInspectorTaskDetail(session.staffId, id);
  if (!task) {
    return NextResponse.json(
      { success: false, error: "Завдання не знайдено" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: task });
}
