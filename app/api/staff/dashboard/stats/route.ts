import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/guard";
import { computeDashboardStats } from "@/lib/staff/dashboardStats";
import type { DashboardStats } from "@/lib/staff/dashboardStats";
import type { ApiResponse } from "@/types/api";

export type { DashboardStat, DashboardStats } from "@/lib/staff/dashboardStats";

export async function GET(): Promise<NextResponse<ApiResponse<DashboardStats>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const data = await computeDashboardStats();
  return NextResponse.json({ success: true, data });
}
