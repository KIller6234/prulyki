"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  InspectorTaskDetail,
  InspectorTaskListItem,
} from "@/lib/staff/inspectorTasks";
import { TaskListPanel } from "./TaskListPanel";
import { TaskDetailPanel } from "./TaskDetailPanel";
import type { ApiResponse } from "@/types/api";

const POLL_INTERVAL_MS = 20000;

interface InspectorWorkspaceProps {
  initialTasks: InspectorTaskListItem[];
}

export function InspectorWorkspace({ initialTasks }: InspectorWorkspaceProps) {
  const [tasks, setTasks] = useState<InspectorTaskListItem[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] =
    useState<InspectorTaskDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const refreshTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    const response = await fetch(
      `/api/staff/inspector/tasks?${params.toString()}`,
    );
    const body = (await response.json()) as ApiResponse<
      InspectorTaskListItem[]
    >;
    if (body.success && body.data) setTasks(body.data);
  }, [statusFilter]);

  useEffect(() => {
    refreshTasks();
    const intervalId = setInterval(refreshTasks, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [refreshTasks]);

  const handleSelectTask = useCallback(async (id: string) => {
    setSelectedTaskId(id);
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/staff/inspector/tasks/${id}`);
      const body = (await response.json()) as ApiResponse<InspectorTaskDetail>;
      if (body.success && body.data) setSelectedTaskDetail(body.data);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedTaskId(null);
    setSelectedTaskDetail(null);
  }, []);

  const handleResolved = useCallback(
    async (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTaskId(null);
      setSelectedTaskDetail(null);
      await refreshTasks();
    },
    [refreshTasks],
  );

  return (
    <div className="grid min-h-[70vh] grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-5">
        <TaskListPanel
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          statusFilter={statusFilter}
          onSelectTask={handleSelectTask}
          onFilterChange={setStatusFilter}
        />
      </div>
      <div className="xl:col-span-7">
        {isLoadingDetail ? (
          <div className="card flex h-full items-center justify-center p-5 text-sm text-gray-400">
            Завантаження…
          </div>
        ) : selectedTaskDetail ? (
          <TaskDetailPanel
            task={selectedTaskDetail}
            onBack={handleBack}
            onResolved={handleResolved}
          />
        ) : (
          <div className="card flex h-full items-center justify-center p-5 text-center text-sm text-gray-400">
            Оберіть завдання зі списку, щоб переглянути деталі.
          </div>
        )}
      </div>
    </div>
  );
}
