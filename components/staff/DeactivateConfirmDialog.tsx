"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { AlertTriangleIcon } from "@/components/icons";
import type { StaffUserListItem } from "@/app/api/staff/users/route";
import type { ApiResponse } from "@/types/api";

interface DeactivateConfirmDialogProps {
  staff: StaffUserListItem;
  onClose: () => void;
  onConfirmed: () => void;
}

export function DeactivateConfirmDialog({
  staff,
  onClose,
  onConfirmed,
}: DeactivateConfirmDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReactivating = !staff.isActive;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/staff/users/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: isReactivating }),
      });
      const body = (await response.json()) as ApiResponse<{ id: string }>;
      if (!body.success) {
        setError(body.error ?? "Не вдалося змінити статус");
        return;
      }
      onConfirmed();
      onClose();
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isReactivating ? "Активувати співробітника" : "Деактивувати співробітника"}
      onClose={onClose}
    >
      <div className="flex items-start gap-3">
        {!isReactivating ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangleIcon className="h-5 w-5" />
          </span>
        ) : null}
        <p className="text-sm text-gray-600">
          {isReactivating ? (
            <>
              Активувати обліковий запис <strong>{staff.fullName}</strong>?
              Співробітник знову зможе увійти в кабінет.
            </>
          ) : (
            <>
              Деактивувати обліковий запис <strong>{staff.fullName}</strong>?
              Співробітник втратить доступ до кабінету — цю дію можна
              скасувати пізніше.
            </>
          )}
        </p>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Скасувати
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-60 ${
            isReactivating
              ? "bg-primary-600 hover:bg-primary-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isSubmitting
            ? "Збереження…"
            : isReactivating
              ? "Активувати"
              : "Деактивувати"}
        </button>
      </div>
    </Modal>
  );
}
