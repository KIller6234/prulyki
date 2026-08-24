"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { DispatcherComplaintItem } from "@/lib/staff/dispatcherComplaints";
import type { DispatcherInspectorItem } from "@/lib/staff/dispatcherInspectors";
import type { ApiResponse } from "@/types/api";

interface QuickAssignModalProps {
  inspectors: DispatcherInspectorItem[];
  preselectedComplaintId?: string;
  onClose: () => void;
  onAssigned: () => void;
}

export function QuickAssignModal({
  inspectors,
  preselectedComplaintId,
  onClose,
  onAssigned,
}: QuickAssignModalProps) {
  const [candidates, setCandidates] = useState<DispatcherComplaintItem[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [complaintId, setComplaintId] = useState(preselectedComplaintId ?? "");
  const [staffId, setStaffId] = useState(inspectors[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/staff/dispatcher/complaints?column=new")
      .then(
        (res) => res.json() as Promise<ApiResponse<DispatcherComplaintItem[]>>,
      )
      .then((body) => {
        if (body.success && body.data) {
          setCandidates(body.data);
          setComplaintId((prev) => prev || body.data?.[0]?.id || "");
        }
      })
      .finally(() => setIsLoadingCandidates(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!complaintId || !staffId) {
      setError("Оберіть звернення та інспектора");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/staff/dispatcher/complaints/${complaintId}/assign`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId }),
        },
      );
      const body = (await response.json()) as ApiResponse<{ status: string }>;
      if (!body.success) {
        setError(body.error ?? "Не вдалося призначити звернення");
        return;
      }
      onAssigned();
      onClose();
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Швидке призначення" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Звернення
          </label>
          {isLoadingCandidates ? (
            <p className="text-sm text-gray-400">Завантаження…</p>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-gray-500">
              Немає нових звернень для призначення.
            </p>
          ) : (
            <select
              value={complaintId}
              onChange={(e) => setComplaintId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.subject} — {c.addressText ?? "адреса не вказана"}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Інспектор
          </label>
          {inspectors.length === 0 ? (
            <p className="text-sm text-gray-500">Немає активних інспекторів.</p>
          ) : (
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
            >
              {inspectors.map((inspector) => (
                <option key={inspector.id} value={inspector.id}>
                  {inspector.fullName} — навантаження: {inspector.activeComplaintsCount}
                </option>
              ))}
            </select>
          )}
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            candidates.length === 0 ||
            inspectors.length === 0
          }
          className="w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isSubmitting ? "Призначення…" : "Призначити"}
        </button>
      </form>
    </Modal>
  );
}
