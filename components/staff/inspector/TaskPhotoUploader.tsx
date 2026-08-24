"use client";

import { useId, useRef, useState } from "react";
import { CameraIcon, CloseIcon, PlusIcon } from "@/components/icons";
import {
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_COMPLAINT_ATTACHMENTS,
} from "@/lib/validation/complaint";
import type { InspectorTaskAttachment } from "@/lib/staff/inspectorTasks";
import type { ApiResponse } from "@/types/api";

interface TaskPhotoUploaderProps {
  complaintId: string;
  photos: InspectorTaskAttachment[];
  onPhotosChange: (photos: InspectorTaskAttachment[]) => void;
}

function validateFiles(files: File[]): string | null {
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return `Файл «${file.name}» має бути зображенням (JPG, PNG)`;
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return `Файл «${file.name}» перевищує 10 МБ`;
    }
  }
  return null;
}

export function TaskPhotoUploader({
  complaintId,
  photos,
  onPhotosChange,
}: TaskPhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAddMore = photos.length < MAX_COMPLAINT_ATTACHMENTS;

  const uploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (photos.length + files.length > MAX_COMPLAINT_ATTACHMENTS) {
      setError(`Максимум ${MAX_COMPLAINT_ATTACHMENTS} фотографій на завдання`);
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      for (const file of files) formData.append("photos", file);

      const response = await fetch(
        `/api/staff/inspector/tasks/${complaintId}/attachments`,
        { method: "POST", body: formData },
      );
      const body = (await response.json()) as ApiResponse<
        InspectorTaskAttachment[]
      >;
      if (!body.success || !body.data) {
        setError(body.error ?? "Не вдалося завантажити фото");
        return;
      }
      onPhotosChange(body.data);
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (attachmentId: string) => {
    const response = await fetch(
      `/api/staff/inspector/tasks/${complaintId}/attachments/${attachmentId}`,
      { method: "DELETE" },
    );
    const body = (await response.json()) as ApiResponse<{ id: string }>;
    if (body.success) {
      onPhotosChange(photos.filter((p) => p.id !== attachmentId));
    }
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        Фотографії <span className="text-red-600">*</span>
      </label>

      {photos.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragActive(false);
            uploadFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            isDragActive
              ? "border-primary-500 bg-mint-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <CameraIcon className="h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            Перетягніть файли сюди або натисніть для вибору
          </p>
          <p className="text-xs text-gray-400">
            JPG, PNG до 10 МБ, максимум {MAX_COMPLAINT_ATTACHMENTS} фото
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.originalFileName}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                aria-label={`Видалити фото ${photo.originalFileName}`}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/70 text-white hover:bg-red-600"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
          {canAddMore ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="text-[11px] font-medium">Додати ще</span>
            </button>
          ) : null}
        </div>
      )}

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        className="hidden"
      />

      {isUploading ? (
        <p className="mt-1.5 text-xs text-gray-500">Завантаження…</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
