import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import type { ApiResponse } from "@/types/api";

export async function POST(): Promise<NextResponse<ApiResponse<null>>> {
  const response = NextResponse.json({ success: true, data: null });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
