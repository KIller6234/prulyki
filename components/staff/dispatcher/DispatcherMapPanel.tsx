"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { PublicCollectionPoint } from "@/app/api/maidanchyky/route";
import { MapLegend } from "@/components/map/MapLegend";
import { FillLevelBar } from "@/components/map/FillLevelBar";
import { FilterIcon, CloseIcon } from "@/components/icons";
import type { ApiResponse } from "@/types/api";

const MapView = dynamic(
  () => import("@/components/map/MapView").then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">
        Завантаження мапи…
      </div>
    ),
  },
);

export function DispatcherMapPanel() {
  const [points, setPoints] = useState<PublicCollectionPoint[]>([]);
  const [selectedPoint, setSelectedPoint] =
    useState<PublicCollectionPoint | null>(null);
  const [onlyProblem, setOnlyProblem] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (onlyProblem) params.set("onlyProblem", "true");
    fetch(`/api/maidanchyky?${params.toString()}`)
      .then((res) => res.json() as Promise<ApiResponse<PublicCollectionPoint[]>>)
      .then((body) => {
        if (body.success && body.data) setPoints(body.data);
      });
  }, [onlyProblem]);

  return (
    <div className="card flex h-full flex-col p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-800">
          Карта контейнерів
        </h2>
        <MapLegend />
        <button
          type="button"
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-400"
        >
          <FilterIcon className="h-3.5 w-3.5" />
          Фільтри
        </button>
      </div>

      {isFiltersOpen ? (
        <label className="mb-3 flex items-center gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={onlyProblem}
            onChange={(e) => setOnlyProblem(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
          />
          Лише проблемні (≥90% наповненості)
        </label>
      ) : null}

      <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-xl">
        <MapView points={points} onSelectPoint={setSelectedPoint} />
      </div>

      {selectedPoint ? (
        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-800">
              {selectedPoint.address}
            </p>
            <button
              type="button"
              onClick={() => setSelectedPoint(null)}
              aria-label="Закрити"
              className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          {selectedPoint.fillLevelPercent !== null ? (
            <FillLevelBar percent={selectedPoint.fillLevelPercent} />
          ) : (
            <p className="text-xs text-gray-500">Наповненість невідома</p>
          )}
          <Link
            href={`/staff/zvernennya?q=${encodeURIComponent(selectedPoint.address)}`}
            className="mt-2 inline-block text-xs font-medium text-primary-700 hover:underline"
          >
            Перейти до звернень цього майданчика
          </Link>
        </div>
      ) : null}
    </div>
  );
}
