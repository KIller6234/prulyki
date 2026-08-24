import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/hash";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { getClientIp, isWithinRateLimit } from "@/lib/rate-limit";
import { staffLoginSchema } from "@/lib/validation/staffAuth";
import type { ApiResponse } from "@/types/api";

// ТЗ п. 4.9: блокування облікового запису на 15 хвилин після 5 невдалих спроб.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_PER_MINUTE = 10;
const GENERIC_LOGIN_ERROR = "Невірний логін або пароль";

export interface StaffLoginResult {
  role: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<StaffLoginResult>>> {
  const clientIp = getClientIp(request);
  const withinLimit = await isWithinRateLimit({
    ip: clientIp,
    endpoint: "staff-login",
    limitPerMinute: LOGIN_RATE_LIMIT_PER_MINUTE,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { success: false, error: "Забагато спроб входу. Спробуйте пізніше." },
      { status: 429 },
    );
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parseResult = staffLoginSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: "Вкажіть e-mail і пароль" },
      { status: 400 },
    );
  }

  const { email, password } = parseResult.data;
  const staff = await prisma.staffUser.findUnique({ where: { email } });

  if (!staff || !staff.isActive) {
    return NextResponse.json(
      { success: false, error: GENERIC_LOGIN_ERROR },
      { status: 401 },
    );
  }

  if (staff.lockedUntil && staff.lockedUntil > new Date()) {
    return NextResponse.json(
      {
        success: false,
        error: "Обліковий запис тимчасово заблоковано. Спробуйте пізніше.",
      },
      { status: 423 },
    );
  }

  const isValidPassword = await verifyPassword(password, staff.passwordHash);
  if (!isValidPassword) {
    const failedLoginAttempts = staff.failedLoginAttempts + 1;
    const shouldLock = failedLoginAttempts >= MAX_FAILED_ATTEMPTS;

    await prisma.staffUser.update({
      where: { id: staff.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : failedLoginAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_DURATION_MS)
          : null,
      },
    });

    return NextResponse.json(
      { success: false, error: GENERIC_LOGIN_ERROR },
      { status: 401 },
    );
  }

  await prisma.staffUser.update({
    where: { id: staff.id },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  const token = await createSessionToken({
    staffId: staff.id,
    email: staff.email,
    role: staff.role,
  });

  const response = NextResponse.json({ success: true, data: { role: staff.role } });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
