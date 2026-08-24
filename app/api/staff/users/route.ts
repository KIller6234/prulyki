import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/guard";
import { hashPassword } from "@/lib/auth/hash";
import { generateTempPassword } from "@/lib/auth/generateTempPassword";
import { staffCreateSchema } from "@/lib/validation/staffUser";
import type { ApiResponse } from "@/types/api";

export interface StaffUserListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
}

/** Реєстр персоналу (ФВ-8.1) — доступно лише адміністратору. */
export async function GET(): Promise<
  NextResponse<ApiResponse<StaffUserListItem[]>>
> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібні права адміністратора" },
      { status: 403 },
    );
  }

  const staff = await prisma.staffUser.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    success: true,
    data: staff.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    })),
  });
}

export interface StaffUserCreateResult {
  id: string;
  tempPassword: string;
}

/** Створення нового співробітника з тимчасовим паролем (показується один раз). */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<StaffUserCreateResult>>> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібні права адміністратора" },
      { status: 403 },
    );
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parseResult = staffCreateSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректні дані",
      },
      { status: 400 },
    );
  }

  const { fullName, email, phone, role } = parseResult.data;

  const existing = await prisma.staffUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "Співробітник з такою поштою вже існує" },
      { status: 409 },
    );
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await prisma.staffUser.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      role,
      passwordHash,
    },
  });

  return NextResponse.json({
    success: true,
    data: { id: user.id, tempPassword },
  });
}
