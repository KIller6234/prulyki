"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LeafDropletIcon } from "@/components/icons";
import { ROLE_LANDING_PATH } from "@/lib/staff/roleLanding";
import type { StaffLoginResult } from "@/app/api/staff/auth/login/route";
import type { ApiResponse } from "@/types/api";

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitNextPath = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/staff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as ApiResponse<StaffLoginResult>;

      if (!body.success) {
        setError(body.error ?? "Не вдалося увійти");
        return;
      }

      const nextPath =
        explicitNextPath ?? ROLE_LANDING_PATH[body.data?.role ?? ""] ?? "/staff/personnel";
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white">
          <LeafDropletIcon className="h-6 w-6" />
        </span>
        <h1 className="text-2xl font-bold text-gray-800">
          Вхід для співробітників
        </h1>
        <p className="mt-1 text-sm text-gray-500">Чисті Прилуки · Кабінет</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Пароль
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          />
        </div>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting ? "Вхід…" : "Увійти"}
        </button>
      </form>
    </main>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={null}>
      <StaffLoginForm />
    </Suspense>
  );
}
