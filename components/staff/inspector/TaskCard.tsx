import type { InspectorTaskListItem } from "@/lib/staff/inspectorTasks";
import { problemTypeVisualFor } from "@/lib/complaints/problemTypeVisual";
import {
  COMPLAINT_PRIORITY_LABELS,
  COMPLAINT_PRIORITY_BADGE_CLASSES,
} from "@/lib/complaints/priorityBadge";
import {
  INSPECTOR_STATUS_LABELS,
  INSPECTOR_STATUS_BADGE_CLASSES,
} from "@/lib/complaints/inspectorTaskStatus";
import { StaticTileThumbnail } from "@/components/map/StaticTileThumbnail";

interface TaskCardProps {
  task: InspectorTaskListItem;
  isSelected: boolean;
  onClick: () => void;
}

export function TaskCard({ task, isSelected, onClick }: TaskCardProps) {
  const visual = problemTypeVisualFor(task.subject);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-3 text-left transition-colors ${
        isSelected
          ? "border-primary-500 bg-mint-50 ring-1 ring-primary-500"
          : "border-transparent bg-white hover:border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${visual.bgClassName} ${visual.colorClassName}`}
        >
          <visual.Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {task.addressText ?? "Адреса не вказана"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
            {task.subject}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${COMPLAINT_PRIORITY_BADGE_CLASSES[task.priority] ?? "bg-gray-100 text-gray-600"}`}
            >
              {COMPLAINT_PRIORITY_LABELS[task.priority] ?? task.priority}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${INSPECTOR_STATUS_BADGE_CLASSES[task.status] ?? "bg-gray-100 text-gray-600"}`}
            >
              {INSPECTOR_STATUS_LABELS[task.status] ?? task.status}
            </span>
          </div>
        </div>

        {task.lat !== null && task.lng !== null ? (
          <StaticTileThumbnail
            lat={task.lat}
            lng={task.lng}
            sizeClassName="h-14 w-14"
          />
        ) : null}
      </div>
    </button>
  );
}
