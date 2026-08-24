import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/guard";
import { fetchDispatcherDistricts } from "@/lib/staff/dispatcherDistricts";
import type { ApiResponse } from "@/types/api";

export async function GET(): Promise<NextResponse<ApiResponse<string[]>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }
  const data = await fetchDispatcherDistricts();
  return NextResponse.json({ success: true, data });
}
