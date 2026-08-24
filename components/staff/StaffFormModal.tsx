"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { STAFF_ROLE_LABELS } from "@/lib/staff/roleBadge";
import type {
  StaffUserListItem,
  StaffUserCreateResult,
} from "@/app/api/staff/users/route";
import type { ApiResponse } from "@/types/api";

type StaffRoleValue = "ADMIN" | "DISPATCHER" | "INSPECTOR";
const ROLE_OPTIONS: StaffRoleValue[] = ["ADMIN", "DISPATCHER", "INSPECTOR"];

interface StaffFormModalProps {
  staff?: StaffUserListItem;
  onClose: () => void;
  onSaved: () => void;
}

export function StaffFormModal({
  staff,
  onClose,
  onSaved,
}: StaffFormModalProps) {
  const isEditMode = Boolean(staff);
  const [fullName, setFullName] = useState(staff?.fullName ?? "");
  const [email, setEmail] = useState(staff?.email ?? "");
  const [phone, setPhone] = useState(staff?.phone ?? "");
  const [role, setRole] = useState<StaffRoleValue>(
    (staff?.role as StaffRoleValue) ?? "DISPATCHER",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTempPassword, setCreatedTempPassword] = useState<
    string | null
  >(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode && staff) {
        const response = await fetch(`/api/staff/users/${staff.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, phone, role }),
        });
        const body = (await response.json()) as ApiResponse<{ id: string }>;
        if (!body.success) {
          setError(body.error ?? "Не вдалося зберегти зміни");
          return;
        }
        onSaved();
        onClose();
      } else {
        const response = await fetch("/api/staff/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, phone, role }),
        });
        const body =
          (await response.json()) as ApiResponse<StaffUserCreateResult>;
        if (!body.success || !body.data) {
          setError(body.error ?? "Не вдалося створити співробітника");
          return;
        }
        setCreatedTempPassword(body.data.tempPassword);
        onSaved();
      }
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdTempPassword) {
    return (
      <Modal title="Співробітника створено" onClose={onClose}>
        <p className="text-sm text-gray-600">
          Тимчасовий пароль для входу (показується лише зараз — попередьте
          співробітника змінити його при першому вході):
        </p>
        <p className="mt-3 rounded-lg bg-mint-100 px-4 py-3 text-center font-mono text-lg font-bold text-primary-800">
          {createdTempPassword}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Готово
        </button>
      </Modal>
    );
  }

  return (
    <Modal
      title={isEditMode ? "Редагувати співробітника" : "Додати співробітника"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ПІБ
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Телефон
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Роль
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRoleValue)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {STAFF_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting
            ? "Збереження…"
            : isEditMode
              ? "Зберегти зміни"
              : "Створити"}
        </button>
      </form>
    </Modal>
  );
}
