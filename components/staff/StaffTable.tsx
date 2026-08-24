"use client";

import { useEffect, useMemo, useState } from "react";
import { PlusIcon, SearchIcon, EditIcon, ChevronDownIcon } from "@/components/icons";
import {
  STAFF_ROLE_LABELS,
  STAFF_ROLE_BADGE_CLASSES,
} from "@/lib/staff/roleBadge";
import { StaffFormModal } from "./StaffFormModal";
import { DeactivateConfirmDialog } from "./DeactivateConfirmDialog";
import type { StaffUserListItem } from "@/app/api/staff/users/route";
import type { ApiResponse } from "@/types/api";

const ROLE_FILTER_OPTIONS = [
  { value: "", label: "Усі ролі" },
  { value: "ADMIN", label: "Адміністратор" },
  { value: "DISPATCHER", label: "Диспетчер" },
  { value: "INSPECTOR", label: "Інспектор" },
];

const TABLE_COLUMN_COUNT = 7;

function formatJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", {
    timeZone: "Europe/Kyiv",
  });
}

type FormModalState =
  | { mode: "create" }
  | { mode: "edit"; staff: StaffUserListItem }
  | null;

export function StaffTable() {
  const [staff, setStaff] = useState<StaffUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formModalState, setFormModalState] = useState<FormModalState>(null);
  const [deactivateTarget, setDeactivateTarget] =
    useState<StaffUserListItem | null>(null);

  const loadStaff = () => {
    setIsLoading(true);
    setError(null);
    fetch("/api/staff/users")
      .then((res) => res.json() as Promise<ApiResponse<StaffUserListItem[]>>)
      .then((body) => {
        if (!body.success || !body.data) {
          setError(body.error ?? "Не вдалося завантажити персонал");
          return;
        }
        setStaff(body.data);
      })
      .catch(() => setError("Помилка мережі. Спробуйте ще раз."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filteredStaff = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return staff.filter((member) => {
      const matchesQuery =
        !normalizedQuery ||
        member.fullName.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery);
      const matchesRole = !roleFilter || member.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [staff, query, roleFilter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-800">
          Управління персоналом
        </h2>
        <button
          type="button"
          onClick={() => setFormModalState({ mode: "create" })}
          className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4" />
          Додати співробітника
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 shadow-sm focus-within:border-primary-400">
          <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук за ім'ям або поштою…"
            className="w-full border-0 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="appearance-none rounded-full border border-gray-300 py-2 pr-9 pl-3.5 text-sm text-gray-700 focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
          >
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">ПІБ</th>
              <th className="px-4 py-3">Роль</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Дата приєднання</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={TABLE_COLUMN_COUNT}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  Завантаження…
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td
                  colSpan={TABLE_COLUMN_COUNT}
                  className="px-4 py-6 text-center text-gray-400"
                >
                  Нічого не знайдено.
                </td>
              </tr>
            ) : (
              filteredStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {member.fullName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STAFF_ROLE_BADGE_CLASSES[member.role] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STAFF_ROLE_LABELS[member.role] ?? member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {member.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{member.email}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          member.isActive ? "bg-primary-500" : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={
                          member.isActive ? "text-gray-700" : "text-gray-400"
                        }
                      >
                        {member.isActive ? "Активний" : "Неактивний"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatJoinDate(member.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormModalState({ mode: "edit", staff: member })
                        }
                        className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        Редагувати
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeactivateTarget(member)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                          member.isActive
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-primary-200 text-primary-700 hover:bg-primary-50"
                        }`}
                      >
                        {member.isActive ? "Деактивувати" : "Активувати"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {formModalState ? (
        <StaffFormModal
          staff={
            formModalState.mode === "edit" ? formModalState.staff : undefined
          }
          onClose={() => setFormModalState(null)}
          onSaved={loadStaff}
        />
      ) : null}

      {deactivateTarget ? (
        <DeactivateConfirmDialog
          staff={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirmed={loadStaff}
        />
      ) : null}
    </div>
  );
}
