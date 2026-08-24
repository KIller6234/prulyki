import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const PUBLIC_STAFF_PATHS = new Set(["/staff/login"]);

export async function proxy(request: NextRequest): Promise<NextResponse> {
  if (PUBLIC_STAFF_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/staff/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"],
};
