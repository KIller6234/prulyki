"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoIcon, ChevronDownIcon } from "@/components/icons";
import type { ComplaintsTimeseriesPoint } from "@/app/api/staff/dashboard/complaints-timeseries/route";
import type { ApiResponse } from "@/types/api";

const PERIOD_OPTIONS = [
  { value: 7, label: "Останні 7 днів" },
  { value: 14, label: "Останні 14 днів" },
  { value: 30, label: "Останні 30 днів" },
  { value: 90, label: "Останні 90 днів" },
];

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "numeric",
    month: "short",
  });
}

interface ChartDatum {
  date: string;
  count: number;
  label: string;
}

export function ComplaintsTrendChart() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ComplaintsTimeseriesPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/staff/dashboard/complaints-timeseries?days=${days}`)
      .then(
        (res) =>
          res.json() as Promise<ApiResponse<ComplaintsTimeseriesPoint[]>>,
      )
      .then((body) => {
        if (body.success && body.data) setData(body.data);
      })
      .finally(() => setIsLoading(false));
  }, [days]);

  const chartData: ChartDatum[] = data.map((point) => ({
    ...point,
    label: formatShortDate(point.date),
  }));
  const hasData = chartData.some((point) => point.count > 0);

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex items-center gap-1.5">
          <h2 className="text-lg font-bold text-gray-800">Динаміка скарг</h2>
          <button
            type="button"
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
            onClick={() => setIsTooltipOpen((prev) => !prev)}
            aria-label="Пояснення графіка"
            className="text-gray-400 hover:text-gray-600"
          >
            <InfoIcon className="h-4 w-4" />
          </button>
          {isTooltipOpen ? (
            <div
              role="tooltip"
              className="absolute top-full left-0 z-10 mt-1 w-64 rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg"
            >
              Кількість зареєстрованих звернень за кожен день обраного
              періоду.
            </div>
          ) : null}
        </div>

        <div className="relative">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="appearance-none rounded-full border border-gray-300 py-1.5 pr-8 pl-3.5 text-sm text-gray-700 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Завантаження…
        </div>
      ) : !hasData ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Немає звернень за обраний період.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
          >
            <CartesianGrid vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                fontSize: 12,
              }}
              formatter={(value) => [value, "Кількість скарг"]}
            />
            <Legend
              formatter={() => "Кількість скарг"}
              wrapperStyle={{ fontSize: 12, color: "#6b7280" }}
            />
            <Bar
              dataKey="count"
              name="Кількість скарг"
              fill="#1b5e42"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
