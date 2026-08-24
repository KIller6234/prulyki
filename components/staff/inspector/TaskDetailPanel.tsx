"use client";

import { useEffect, useState } from "react";
import type {
  InspectorTaskAttachment,
  InspectorTaskDetail,
} from "@/lib/staff/inspectorTasks";
import {
  COMPLAINT_PRIORITY_LABELS,
  COMPLAINT_PRIORITY_BADGE_CLASSES,
} from "@/lib/complaints/priorityBadge";
import {
  INSPECTOR_STATUS_LABELS,
  INSPECTOR_STATUS_BADGE_CLASSES,
} from "@/lib/complaints/inspectorTaskStatus";
import { problemTypeVisualFor } from "@/lib/complaints/problemTypeVisual";
import { StaticTileThumbnail } from "@/components/map/StaticTileThumbnail";
import { TaskPhotoUploader } from "./TaskPhotoUploader";
import { FillLevelControl } from "./FillLevelControl";
import { ArrowLeftIcon, CopyIcon, CheckCircleIcon } from "@/components/icons";
import type { ApiResponse } from "@/types/api";

const NOTES_MAX_LENGTH = 500;
const DEFAULT_FILL_LEVEL = 50;

interface TaskDetailPanelProps {
  task: InspectorTaskDetail;
  onBack: () => void;
  onResolved: (taskId: string) => void;
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    timeZone: "Europe/Kyiv",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TaskDetailPanel({
  task,
  onBack,
  onResolved,
}: TaskDetailPanelProps) {
  const [photos, setPhotos] = useState<InspectorTaskAttachment[]>(
    task.attachments,
  );
  const [fillLevelPercent, setFillLevelPercent] = useState(
    task.reportedFillLevelPercent ??
      task.collectionPoint?.fillLevelPercent ??
      DEFAULT_FILL_LEVEL,
  );
  const [notes, setNotes] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPhotos(task.attachments);
    setFillLevelPercent(
      task.reportedFillLevelPercent ??
        task.collectionPoint?.fillLevelPercent ??
        DEFAULT_FILL_LEVEL,
    );
    setNotes("");
    setError(null);
  }, [task]);

  const isDone = task.status === "DONE";
  const visual = problemTypeVisualFor(task.subject);

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(task.registrationNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleResolve = async () => {
    if (photos.length === 0) {
      setError("Додайте хоча б одне фото перед тим, як позначити вирішеним");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/staff/inspector/tasks/${task.id}/resolve`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolutionText: notes || undefined,
            fillLevelPercent,
          }),
        },
      );
      const body = (await response.json()) as ApiResponse<{ status: string }>;
      if (!body.success) {
        setError(body.error ?? "Не вдалося зберегти зміни");
        return;
      }
      onResolved(task.id);
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card flex h-full flex-col overflow-y-auto p-5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Назад до списку
        </button>
        <button
          type="button"
          onClick={handleCopyId}
          className="flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-gray-600"
          title="Копіювати ID"
        >
          <CopyIcon className="h-3.5 w-3.5" />
          {isCopied ? "Скопійовано" : task.registrationNumber}
        </button>
      </div>

      <div className="mb-4 flex items-start gap-3 rounded-xl bg-gray-50 p-3">
        {task.lat !== null && task.lng !== null ? (
          <StaticTileThumbnail lat={task.lat} lng={task.lng} sizeClassName="h-16 w-16" />
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${visual.bgClassName} ${visual.colorClassName}`}
            >
              <visual.Icon className="h-4 w-4" />
            </span>
            <h1 className="min-w-0 truncate text-lg font-bold text-gray-800">
              {task.addressText ?? "Адреса не вказана"}
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">{task.subject}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${COMPLAINT_PRIORITY_BADGE_CLASSES[task.priority] ?? "bg-gray-100 text-gray-600"}`}
            >
              {COMPLAINT_PRIORITY_LABELS[task.priority] ?? task.priority}
            </span>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${INSPECTOR_STATUS_BADGE_CLASSES[task.status] ?? "bg-gray-100 text-gray-600"}`}
            >
              {INSPECTOR_STATUS_LABELS[task.status] ?? task.status}
            </span>
          </div>
        </div>
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
        <div>
          <dt className="font-medium text-gray-400">Дата створення</dt>
          <dd className="mt-0.5 text-gray-700">{formatCreatedAt(task.createdAt)}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-400">Відповідальний</dt>
          <dd className="mt-0.5 text-gray-700">{task.assignedToFullName ?? "—"}</dd>
        </div>
      </dl>

      <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700">
        {task.description}
      </p>

      <div className="mb-5">
        <TaskPhotoUploader
          complaintId={task.id}
          photos={photos}
          onPhotosChange={setPhotos}
        />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Заповненість контейнера (%)
        </label>
        <FillLevelControl
          value={fillLevelPercent}
          onChange={setFillLevelPercent}
          disabled={isDone}
        />
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Примітки інспектора
          </label>
          <span className="text-xs text-gray-400">
            {notes.length}/{NOTES_MAX_LENGTH}
          </span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX_LENGTH))}
          disabled={isDone}
          rows={4}
          placeholder="Опишіть виконані дії, стан майданчика тощо"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none disabled:bg-gray-50"
        />
      </div>

      {error ? (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isDone ? (
        <p className="mb-3 rounded-lg bg-mint-100 px-3 py-2 text-sm text-primary-800">
          Це завдання вже позначено виконаним.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleResolve}
          disabled={isSubmitting}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          <CheckCircleIcon className="h-5 w-5" />
          {isSubmitting ? "Збереження…" : "Позначити вирішеним"}
        </button>
      )}
    </div>
  );
}
