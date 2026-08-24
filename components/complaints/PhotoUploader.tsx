"use client";

import { useId } from "react";
import {
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_COMPLAINT_ATTACHMENTS,
} from "@/lib/validation/complaint";

interface PhotoUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function PhotoUploader({ files, onChange, error }: PhotoUploaderProps) {
  const inputId = useId();

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const combined = [...files, ...Array.from(fileList)].slice(
      0,
      MAX_COMPLAINT_ATTACHMENTS,
    );
    onChange(combined);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        Фото (до {MAX_COMPLAINT_ATTACHMENTS}, до 10 МБ кожне)
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
        disabled={files.length >= MAX_COMPLAINT_ATTACHMENTS}
        className="block w-full text-sm text-gray-600"
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}

      {files.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {files.map((file, index) => {
            const isTooLarge = file.size > MAX_ATTACHMENT_SIZE_BYTES;
            return (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs"
              >
                <span className={isTooLarge ? "text-red-600" : "text-gray-700"}>
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} МБ)
                  {isTooLarge ? " — перевищує 10 МБ" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600"
                  aria-label={`Видалити файл ${file.name}`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
