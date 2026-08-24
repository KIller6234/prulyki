"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/complaints/StatusBadge";
import { ComplaintIcon } from "@/components/icons";
import type { ComplaintStatusResult } from "@/app/api/zvernennya/status/route";
import type { ApiResponse } from "@/types/api";

function formatKyivDate(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ZvernennyaStatusPage() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState<ComplaintStatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSearching(true);
    setError(null);
    setResult(null);

    const params = new URLSearchParams({ registrationNumber, contact });
    try {
      const response = await fetch(`/api/zvernennya/status?${params}`);
      const body = (await response.json()) as ApiResponse<ComplaintStatusResult>;
      if (!body.success || !body.data) {
        setError(body.error ?? "Звернення не знайдено");
        return;
      }
      setResult(body.data);
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-200 text-primary-600">
          <ComplaintIcon className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Перевірка статусу звернення
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Введіть реєстраційний номер та контактні дані, вказані під час
          подання звернення.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card space-y-3 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Номер звернення
          </label>
          <input
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            placeholder="ЗВ-2026-000123"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Телефон або e-mail
          </label>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSearching ? "Пошук…" : "Перевірити"}
        </button>
      </form>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-6 card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-sm text-gray-500">
              {result.registrationNumber}
            </span>
            <StatusBadge status={result.status} />
          </div>
          <h2 className="font-medium text-gray-900">{result.subject}</h2>
          <p className="mt-1 text-xs text-gray-500">
            Зареєстровано: {formatKyivDate(result.createdAt)} · Строк
            розгляду до: {formatKyivDate(result.dueDate)}
          </p>
          {result.isAnnulled ? (
            <p className="mt-2 rounded-lg bg-gray-100 px-2 py-1 text-sm text-gray-600">
              Звернення анульовано. {result.annulReason ?? ""}
            </p>
          ) : null}

          <h3 className="mt-4 mb-2 text-sm font-medium text-gray-700">
            Історія розгляду
          </h3>
          <ol className="space-y-2 border-l border-gray-200 pl-4">
            {result.versions.map((version, index) => (
              <li key={index}>
                <div className="flex items-center gap-2">
                  <StatusBadge status={version.status} />
                  <span className="text-xs text-gray-400">
                    {formatKyivDate(version.changedAt)}
                  </span>
                </div>
                {version.resolutionText ? (
                  <p className="mt-1 text-sm text-gray-700">
                    {version.resolutionText}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </main>
  );
}
