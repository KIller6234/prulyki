import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/guard";
import { computeDispatcherStats } from "@/lib/staff/dispatcherStats";
import type { DispatcherStats } from "@/lib/staff/dispatcherStats";
import type { ApiResponse } from "@/types/api";

export type { DispatcherStat, DispatcherStats } from "@/lib/staff/dispatcherStats";

export async function GET(): Promise<NextResponse<ApiResponse<DispatcherStats>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }
  const data = await computeDispatcherStats();
  return NextResponse.json({ success: true, data });
}
