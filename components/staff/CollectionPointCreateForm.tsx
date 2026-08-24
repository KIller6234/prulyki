"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types/api";

export function CollectionPointCreateForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      address: formData.get("address"),
      lat: formData.get("lat"),
      lng: formData.get("lng"),
      operatorName: formData.get("operatorName"),
      isBulkWasteSite: formData.get("isBulkWasteSite") === "on",
    };

    try {
      const response = await fetch("/api/maidanchyky", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as ApiResponse<{ id: string }>;
      if (!body.success) {
        setError(body.error ?? "Не вдалося створити майданчик");
        return;
      }
      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        + Новий майданчик
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 space-y-2 card p-4"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          name="address"
          required
          placeholder="Адреса"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        />
        <input
          name="operatorName"
          required
          placeholder="Оператор"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        />
        <input
          name="lat"
          type="number"
          step="any"
          required
          placeholder="Широта (lat)"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        />
        <input
          name="lng"
          type="number"
          step="any"
          required
          placeholder="Довгота (lng)"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="isBulkWasteSite" />
        Приймає ВГВ
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting ? "Збереження…" : "Створити"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-full px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
}
