"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types/api";

const STATUS_OPTIONS = [
  { value: "REGISTERED", label: "Зареєстровано" },
  { value: "UNDER_REVIEW", label: "На розгляді" },
  { value: "FORWARDED", label: "Направлено виконавцю" },
  { value: "DONE", label: "Виконано" },
  { value: "REJECTED", label: "Відмовлено" },
  { value: "EXTENDED", label: "Продовжено строк (+15 днів)" },
  { value: "ANNULLED", label: "Анулювати" },
] as const;

interface StatusUpdateFormProps {
  complaintId: string;
  currentStatus: string;
}

export function StatusUpdateForm({
  complaintId,
  currentStatus,
}: StatusUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [resolutionText, setResolutionText] = useState("");
  const [annulReason, setAnnulReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/zvernennya/${complaintId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolutionText: resolutionText || undefined,
          annulReason: status === "ANNULLED" ? annulReason : undefined,
        }),
      });
      const body = (await response.json()) as ApiResponse<{ status: string }>;
      if (!body.success) {
        setError(body.error ?? "Не вдалося оновити статус");
        return;
      }
      setResolutionText("");
      setAnnulReason("");
      router.refresh();
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 card p-4"
    >
      <h3 className="text-sm font-medium text-gray-700">Змінити статус</h3>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <textarea
        value={resolutionText}
        onChange={(e) => setResolutionText(e.target.value)}
        rows={3}
        placeholder="Текст відповіді / коментар (буде видно заявнику)"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
      />

      {status === "ANNULLED" ? (
        <input
          value={annulReason}
          onChange={(e) => setAnnulReason(e.target.value)}
          placeholder="Причина анулювання (обов'язково)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        />
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
      >
        {isSubmitting ? "Збереження…" : "Зберегти нову версію"}
      </button>
    </form>
  );
}
