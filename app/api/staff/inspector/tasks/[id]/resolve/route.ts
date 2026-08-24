import { NextResponse, type NextRequest } from "next/server";
import { getStaffSession } from "@/lib/auth/guard";
import { resolveInspectorTask } from "@/lib/staff/inspectorTasks";
import { inspectorResolveSchema } from "@/lib/validation/inspectorResolve";
import type { ApiResponse } from "@/types/api";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  not_found: "Завдання не знайдено",
  already_done: "Завдання вже позначено виконаним",
  photos_required: "Додайте хоча б одне фото перед тим, як позначити вирішеним",
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
): Promise<NextResponse<ApiResponse<{ status: string }>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const rawBody: unknown = await request.json().catch(() => null);
  const parseResult = inspectorResolveSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректні дані",
      },
      { status: 400 },
    );
  }

  const { error } = await resolveInspectorTask(session.staffId, id, parseResult.data);
  if (error) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES[error] },
      { status: error === "not_found" ? 404 : 400 },
    );
  }

  return NextResponse.json({ success: true, data: { status: "DONE" } });
}
