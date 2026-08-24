import type { ScheduleSearchResult } from "@/app/api/grafik/search/route";

function formatKyivDateTime(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    timeZone: "Europe/Kyiv",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ScheduleResultCardProps {
  result: ScheduleSearchResult;
}

export function ScheduleResultCard({ result }: ScheduleResultCardProps) {
  if (result.collectionMethod === "CONTAINER") {
    return (
      <div className="card p-4">
        <p className="text-sm text-gray-500">
          {result.streetName} — контейнерний метод
        </p>
        <p className="mt-1 text-lg font-semibold text-gray-900">
          Найближче вивезення: {formatKyivDateTime(result.nextCollectionAt)}
        </p>
        {result.collectionPoint ? (
          <p className="mt-2 text-sm text-gray-700">
            Майданчик: {result.collectionPoint.address}
          </p>
        ) : null}
        <a
          href="/mapa"
          className="mt-3 inline-block text-sm font-medium text-primary-700 hover:underline"
        >
          Показати на мапі →
        </a>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <p className="text-sm text-gray-500">
        {result.streetName} — пакетний (безконтейнерний) метод
      </p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        Час виставлення тари: {formatKyivDateTime(result.nextCollectionAt)}
      </p>
      {result.earliestSetOutAt ? (
        <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-sm text-amber-800">
          Не виставляйте тару раніше{" "}
          {formatKyivDateTime(result.earliestSetOutAt)} (не раніше ніж за 1
          годину до вивезення).
        </p>
      ) : null}
    </div>
  );
}
