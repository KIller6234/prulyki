"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CollectionPointImportResult } from "@/app/api/maidanchyky/import/route";
import type { ApiResponse } from "@/types/api";

export default function MaidanchykyImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CollectionPointImportResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.set("file", file);

    try {
      const response = await fetch("/api/maidanchyky/import", {
        method: "POST",
        body: formData,
      });
      const body =
        (await response.json()) as ApiResponse<CollectionPointImportResult>;
      if (!body.success || !body.data) {
        setError(body.error ?? "Не вдалося імпортувати файл");
        return;
      }
      setResult(body.data);
      router.refresh();
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        Масовий імпорт майданчиків
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        CSV з колонками: <code>address, lat, lng, operatorName,
        isBulkWasteSite</code> (перший рядок — заголовки).
      </p>

      <form onSubmit={handleSubmit} className="card flex flex-wrap items-center gap-3 p-4">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block text-sm"
        />
        <button
          type="submit"
          disabled={!file || isSubmitting}
          className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting ? "Імпорт…" : "Завантажити"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 card p-4">
          <p className="text-sm font-medium text-primary-700">
            Успішно створено: {result.createdCount}
          </p>
          {result.errors.length > 0 ? (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-600">
                Помилки ({result.errors.length}):
              </p>
              <ul className="mt-1 space-y-1 text-xs text-red-600">
                {result.errors.map((err, index) => (
                  <li key={index}>
                    Рядок {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
