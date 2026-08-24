import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/guard";
import { staffUpdateSchema } from "@/lib/validation/staffUser";
import type { ApiResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Редагування даних співробітника або зміна статусу (деактивація/активація). */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібні права адміністратора" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const rawBody: unknown = await request.json().catch(() => null);
  const parseResult = staffUpdateSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректні дані",
      },
      { status: 400 },
    );
  }

  const existing = await prisma.staffUser.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Співробітника не знайдено" },
      { status: 404 },
    );
  }

  if (
    existing.id === session.staffId &&
    parseResult.data.isActive === false
  ) {
    return NextResponse.json(
      { success: false, error: "Не можна деактивувати власний обліковий запис" },
      { status: 400 },
    );
  }

  const { fullName, email, phone, role, isActive } = parseResult.data;

  if (email && email !== existing.email) {
    const emailTaken = await prisma.staffUser.findUnique({
      where: { email },
    });
    if (emailTaken) {
      return NextResponse.json(
        { success: false, error: "Ця пошта вже використовується" },
        { status: 409 },
      );
    }
  }

  const user = await prisma.staffUser.update({
    where: { id },
    data: {
      ...(fullName !== undefined ? { fullName } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
      ...(role !== undefined ? { role } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  });

  return NextResponse.json({ success: true, data: { id: user.id } });
}
