import { NextResponse } from "next/server";
import { getStaffSession } from "@/lib/auth/guard";
import { fetchDispatcherInspectors } from "@/lib/staff/dispatcherInspectors";
import type { DispatcherInspectorItem } from "@/lib/staff/dispatcherInspectors";
import type { ApiResponse } from "@/types/api";

export type { DispatcherInspectorItem } from "@/lib/staff/dispatcherInspectors";

export async function GET(): Promise<
  NextResponse<ApiResponse<DispatcherInspectorItem[]>>
> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }
  const data = await fetchDispatcherInspectors();
  return NextResponse.json({ success: true, data });
}
