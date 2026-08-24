"use client";

import { ChevronDownIcon, LightningIcon } from "@/components/icons";
import { COMPLAINT_PRIORITY_OPTIONS } from "@/lib/complaints/priorityBadge";
import { KANBAN_COLUMNS, type KanbanColumnId } from "@/lib/complaints/kanbanColumn";

export interface DispatcherFilters {
  district: string;
  priority: string;
  column: KanbanColumnId | "";
}

interface DispatcherToolbarProps {
  lastUpdatedAt: Date | null;
  districts: string[];
  filters: DispatcherFilters;
  onFilterChange: (filters: DispatcherFilters) => void;
  onQuickAssignClick: () => void;
}

function formatLastUpdated(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString("uk-UA", {
    timeZone: "Europe/Kyiv",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function DispatcherToolbar({
  lastUpdatedAt,
  districts,
  filters,
  onFilterChange,
  onQuickAssignClick,
}: DispatcherToolbarProps) {
  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Диспетчерська панель</h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
          Оновлено: {formatLastUpdated(lastUpdatedAt)}
          <span className="flex items-center gap-1 text-primary-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
            </span>
            Онлайн
          </span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <select
            value={filters.district}
            onChange={(e) =>
              onFilterChange({ ...filters, district: e.target.value })
            }
            className="appearance-none rounded-full border border-gray-300 py-2 pr-9 pl-3.5 text-sm text-gray-700 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
            aria-label="Фільтр за районом"
          >
            <option value="">Усі райони</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={filters.priority}
            onChange={(e) =>
              onFilterChange({ ...filters, priority: e.target.value })
            }
            className="appearance-none rounded-full border border-gray-300 py-2 pr-9 pl-3.5 text-sm text-gray-700 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
            aria-label="Фільтр за пріоритетом"
          >
            {COMPLAINT_PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={filters.column}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                column: e.target.value as KanbanColumnId | "",
              })
            }
            className="appearance-none rounded-full border border-gray-300 py-2 pr-9 pl-3.5 text-sm text-gray-700 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
            aria-label="Фільтр за статусом"
          >
            <option value="">Усі статуси</option>
            {KANBAN_COLUMNS.map((column) => (
              <option key={column.id} value={column.id}>
                {column.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <button
          type="button"
          onClick={onQuickAssignClick}
          className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <LightningIcon className="h-4 w-4" />
          Швидке призначення
        </button>
      </div>
    </div>
  );
}
