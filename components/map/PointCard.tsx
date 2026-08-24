import type { PublicCollectionPoint } from "@/app/api/maidanchyky/route";
import { FillLevelBar } from "./FillLevelBar";
import { ScheduleIcon } from "@/components/icons";
import { formatNextCollection } from "@/lib/schedule/formatNextCollection";

const WASTE_CATEGORY_LABELS: Record<string, string> = {
  MIXED: "Змішані",
  PLASTIC: "Пластик",
  GLASS: "Скло",
  PAPER: "Папір",
  BULK: "ВГВ",
};

interface PointCardProps {
  point: PublicCollectionPoint;
  distanceMeters?: number;
  onClose: () => void;
}

export function PointCard({ point, distanceMeters, onClose }: PointCardProps) {
  const nextCollection = point.nextCollectionAt
    ? formatNextCollection(point.nextCollectionAt)
    : null;

  return (
    <div className="absolute right-3 top-3 z-[1000] w-80 max-w-[calc(100%-1.5rem)] card p-4 shadow-lg">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">
          {point.address}
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити картку майданчика"
          className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <dl className="space-y-1 text-sm text-gray-700">
        <div className="flex justify-between">
          <dt>Оператор</dt>
          <dd>{point.operatorName}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="shrink-0">Наповненість</dt>
          <dd className="flex w-36 items-center justify-end gap-1">
            {point.fillLevelPercent === null ? (
              <span className="text-gray-500">невідомо</span>
            ) : (
              <FillLevelBar percent={point.fillLevelPercent} />
            )}
            {point.isProblem ? (
              <span aria-label="Потребує уваги">⚠️</span>
            ) : null}
          </dd>
        </div>
        {nextCollection ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5">
              <ScheduleIcon className="h-4 w-4 text-gray-400" />
              Наступне вивезення
            </dt>
            <dd
              className={
                nextCollection.isSoon
                  ? "flex items-center gap-1.5 font-semibold text-primary-600"
                  : "text-gray-800"
              }
            >
              {nextCollection.label}
              {nextCollection.isSoon ? (
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  {nextCollection.label === "сьогодні" ? "Сьогодні" : "Завтра"}
                </span>
              ) : null}
            </dd>
          </div>
        ) : null}
        {point.lastMeasuredAt ? (
          <div className="flex justify-between">
            <dt>Дата виміру</dt>
            <dd>
              {new Date(point.lastMeasuredAt).toLocaleDateString("uk-UA", {
                timeZone: "Europe/Kyiv",
              })}
            </dd>
          </div>
        ) : null}
        {distanceMeters !== undefined ? (
          <div className="flex justify-between">
            <dt>Відстань</dt>
            <dd>
              {distanceMeters < 1000
                ? `${Math.round(distanceMeters)} м`
                : `${(distanceMeters / 1000).toFixed(1)} км`}
            </dd>
          </div>
        ) : null}
        {point.isBulkWasteSite ? (
          <p className="rounded bg-violet-50 px-2 py-1 text-xs text-violet-700">
            Приймає великогабаритні відходи (ВГВ)
          </p>
        ) : null}
      </dl>

      <div className="mt-3">
        <p className="mb-1 text-xs font-medium text-gray-500">
          Контейнери
        </p>
        <ul className="space-y-1 text-sm">
          {point.containers.map((container, index) => (
            <li
              key={`${container.wasteCategory}-${index}`}
              className="flex justify-between"
            >
              <span>
                {WASTE_CATEGORY_LABELS[container.wasteCategory] ??
                  container.wasteCategory}
              </span>
              <span className="text-gray-500">
                {container.quantity} × {container.volumeLiters} л
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
