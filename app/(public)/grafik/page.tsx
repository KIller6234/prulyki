"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AddressSearch } from "@/components/schedule/AddressSearch";
import { ScheduleResultCard } from "@/components/schedule/ScheduleResultCard";
import { ScheduleIcon } from "@/components/icons";
import type { ScheduleSearchResult } from "@/app/api/grafik/search/route";
import type { ApiResponse } from "@/types/api";

function GrafikPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const streetFromUrl = searchParams.get("street") ?? "";

  const [result, setResult] = useState<ScheduleSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const runSearch = useCallback((streetName: string) => {
    setIsSearching(true);
    setError(null);
    setResult(null);

    fetch(`/api/grafik/search?street=${encodeURIComponent(streetName)}`)
      .then((res) => res.json() as Promise<ApiResponse<ScheduleSearchResult>>)
      .then((body) => {
        if (!body.success || !body.data) {
          setError(body.error ?? "Графік не знайдено");
          return;
        }
        setResult(body.data);
      })
      .catch(() => setError("Не вдалося виконати пошук. Спробуйте ще раз."))
      .finally(() => setIsSearching(false));
  }, []);

  const handleSearch = useCallback(
    (streetName: string) => {
      router.replace(`/grafik?street=${encodeURIComponent(streetName)}`);
      runSearch(streetName);
    },
    [router, runSearch],
  );

  useEffect(() => {
    if (streetFromUrl) runSearch(streetFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streetFromUrl]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-200 text-primary-600">
          <ScheduleIcon className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Графік вивезення відходів
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Введіть назву вулиці, щоб дізнатися спосіб збирання та найближчу
          дату вивезення.
        </p>
      </header>

      <AddressSearch
        initialStreet={streetFromUrl}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      <div className="mt-6">
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {result ? <ScheduleResultCard result={result} /> : null}
      </div>
    </main>
  );
}

export default function GrafikPage() {
  return (
    <Suspense fallback={null}>
      <GrafikPageContent />
    </Suspense>
  );
}
