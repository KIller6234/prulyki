import type { InspectorTaskListItem } from "@/lib/staff/inspectorTasks";
import { INSPECTOR_STATUS_FILTER_OPTIONS } from "@/lib/complaints/inspectorTaskStatus";
import { ChevronDownIcon } from "@/components/icons";
import { TaskCard } from "./TaskCard";

interface TaskListPanelProps {
  tasks: InspectorTaskListItem[];
  selectedTaskId: string | null;
  statusFilter: string;
  onSelectTask: (id: string) => void;
  onFilterChange: (value: string) => void;
}

export function TaskListPanel({
  tasks,
  selectedTaskId,
  statusFilter,
  onSelectTask,
  onFilterChange,
}: TaskListPanelProps) {
  return (
    <div className="card flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">Мої завдання</h2>
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
            {tasks.length}
          </span>
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="appearance-none rounded-full border border-gray-300 py-1.5 pr-8 pl-3 text-xs font-medium text-gray-600 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
            aria-label="Фільтр завдань за статусом"
          >
            {INSPECTOR_STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Немає завдань за обраним фільтром.
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={task.id === selectedTaskId}
              onClick={() => onSelectTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
