"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { PublicCollectionPoint } from "@/app/api/maidanchyky/route";
import { PointCard } from "@/components/map/PointCard";
import { FilterChip } from "@/components/map/FilterChip";
import { haversineDistanceMeters } from "@/lib/geo/haversine";
import { ChevronDownIcon, LocationIcon } from "@/components/icons";
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

const WASTE_CATEGORY_OPTIONS = [
  { value: "", label: "Усі типи відходів" },
  { value: "MIXED", label: "Змішані" },
  { value: "PLASTIC", label: "Пластик" },
  { value: "GLASS", label: "Скло" },
  { value: "PAPER", label: "Папір" },
  { value: "BULK", label: "ВГВ" },
] as const;

interface Filters {
  wasteCategory: string;
  onlyBulk: boolean;
  onlyProblem: boolean;
}

export default function MapaPage() {
  const [points, setPoints] = useState<PublicCollectionPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    wasteCategory: "",
    onlyBulk: false,
    onlyProblem: false,
  });
  const [selectedPoint, setSelectedPoint] =
    useState<PublicCollectionPoint | null>(null);
  const [userLocation, setUserLocation] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.wasteCategory) params.set("wasteCategory", filters.wasteCategory);
    if (filters.onlyBulk) params.set("onlyBulk", "true");
    if (filters.onlyProblem) params.set("onlyProblem", "true");

    setIsLoading(true);
    setLoadError(null);

    fetch(`/api/maidanchyky?${params.toString()}`)
      .then((res) => res.json() as Promise<ApiResponse<PublicCollectionPoint[]>>)
      .then((body) => {
        if (!body.success || !body.data) {
          throw new Error(body.error ?? "Не вдалося завантажити майданчики");
        }
        setPoints(body.data);
      })
      .catch((error: unknown) => {
        setLoadError(
          error instanceof Error ? error.message : "Невідома помилка",
        );
      })
      .finally(() => setIsLoading(false));
  }, [filters]);

  const handleLocateMe = useCallback(() => {
    setLocationError(null);
    if (!("geolocation" in navigator)) {
      setLocationError("Геолокація не підтримується цим браузером");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocationError("Не вдалося визначити місцезнаходження");
      },
    );
  }, []);

  const nearestPoints = useMemo(() => {
    if (!userLocation) return [];
    return [...points]
      .map((point) => ({
        point,
        distanceMeters: haversineDistanceMeters(userLocation, point),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 5);
  }, [points, userLocation]);

  const selectedDistanceMeters =
    selectedPoint && userLocation
      ? haversineDistanceMeters(userLocation, selectedPoint)
      : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Мапа контейнерних майданчиків
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Знайдіть найближчий контейнерний майданчик та перевірте його стан.
        </p>
      </header>

      <section
        aria-label="Фільтри мапи"
        className="card mb-4 overflow-x-auto p-4 sm:p-5"
      >
        <div className="flex min-w-max flex-nowrap items-center gap-2 sm:min-w-0 sm:flex-wrap">
          <div className="relative">
            <select
              value={filters.wasteCategory}
              onChange={(e) =>
                setFilters((f) => ({ ...f, wasteCategory: e.target.value }))
              }
              className="appearance-none rounded-full border border-gray-300 py-2 pr-9 pl-3.5 text-sm text-gray-700 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
              aria-label="Фільтр за типом відходів"
            >
              {WASTE_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          <FilterChip
            label="Лише ВГВ"
            active={filters.onlyBulk}
            onToggle={() =>
              setFilters((f) => ({ ...f, onlyBulk: !f.onlyBulk }))
            }
          />
          <FilterChip
            label="Лише проблемні (≥90%)"
            active={filters.onlyProblem}
            onToggle={() =>
              setFilters((f) => ({ ...f, onlyProblem: !f.onlyProblem }))
            }
          />

          <button
            type="button"
            onClick={handleLocateMe}
            className="ml-0 flex shrink-0 items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 sm:ml-auto"
          >
            <LocationIcon className="h-4 w-4" />
            Знайти найближчі до мене
          </button>
        </div>
        {locationError ? (
          <p className="mt-2 text-xs text-red-600">{locationError}</p>
        ) : null}
        {isLoading ? (
          <p className="mt-2 text-xs text-gray-500">Завантаження…</p>
        ) : null}
        {loadError ? (
          <p className="mt-2 text-xs text-red-600">{loadError}</p>
        ) : null}
      </section>

      <div className="relative h-[70vh] min-h-[480px] overflow-hidden rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <MapView points={points} onSelectPoint={setSelectedPoint} />

        {selectedPoint ? (
          <PointCard
            point={selectedPoint}
            distanceMeters={selectedDistanceMeters}
            onClose={() => setSelectedPoint(null)}
          />
        ) : null}

        {!selectedPoint && nearestPoints.length > 0 ? (
          <div className="absolute right-3 top-3 z-[1000] w-72 max-w-[calc(100%-1.5rem)] card p-3 shadow-lg">
            <h2 className="mb-2 text-sm font-semibold text-gray-900">
              Найближчі майданчики
            </h2>
            <ul className="space-y-2">
              {nearestPoints.map(({ point, distanceMeters }) => (
                <li key={point.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedPoint(point)}
                    className="w-full rounded p-2 text-left text-sm hover:bg-gray-50"
                  >
                    <span className="block font-medium text-gray-800">
                      {point.address}
                    </span>
                    <span className="text-gray-500">
                      {distanceMeters < 1000
                        ? `${Math.round(distanceMeters)} м`
                        : `${(distanceMeters / 1000).toFixed(1)} км`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  );
}
