import { NextResponse, type NextRequest } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getStaffSession } from "@/lib/auth/guard";
import type { ApiResponse } from "@/types/api";

// Орієнтовний bounding box м. Прилуки — валідація координат (ФВ-2.8).
const PRYLUKY_LAT_RANGE = { min: 50.45, max: 50.7 };
const PRYLUKY_LNG_RANGE = { min: 32.2, max: 32.6 };

const csvRowSchema = z.object({
  address: z.string().trim().min(3, "Порожня або закоротка адреса"),
  lat: z.coerce
    .number()
    .min(PRYLUKY_LAT_RANGE.min, "Широта поза межами Прилук")
    .max(PRYLUKY_LAT_RANGE.max, "Широта поза межами Прилук"),
  lng: z.coerce
    .number()
    .min(PRYLUKY_LNG_RANGE.min, "Довгота поза межами Прилук")
    .max(PRYLUKY_LNG_RANGE.max, "Довгота поза межами Прилук"),
  operatorName: z.string().trim().min(2, "Вкажіть оператора"),
  isBulkWasteSite: z
    .string()
    .optional()
    .transform((v) => v?.trim().toLowerCase() === "true"),
});

interface RowError {
  row: number;
  message: string;
}

export interface CollectionPointImportResult {
  createdCount: number;
  errors: RowError[];
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<CollectionPointImportResult>>> {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Потрібна авторизація" },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "Файл не додано" },
      { status: 400 },
    );
  }

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: RowError[] = parsed.errors.map((e) => ({
    row: (e.row ?? 0) + 2, // +1 header row, +1 to 1-index
    message: e.message,
  }));

  const validRows: {
    address: string;
    lat: number;
    lng: number;
    operatorName: string;
    isBulkWasteSite: boolean;
  }[] = [];

  parsed.data.forEach((row, index) => {
    const rowNumber = index + 2;
    const result = csvRowSchema.safeParse(row);
    if (!result.success) {
      errors.push({
        row: rowNumber,
        message: result.error.issues[0]?.message ?? "Некоректний рядок",
      });
      return;
    }
    validRows.push(result.data);
  });

  if (validRows.length > 0) {
    await prisma.collectionPoint.createMany({ data: validRows });
  }

  return NextResponse.json({
    success: true,
    data: { createdCount: validRows.length, errors },
  });
}
