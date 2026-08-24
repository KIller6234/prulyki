"use client";

import { useCallback, useEffect, useState } from "react";
import type { DispatcherComplaintItem } from "@/lib/staff/dispatcherComplaints";
import type { DispatcherInspectorItem } from "@/lib/staff/dispatcherInspectors";
import type { DispatcherStats } from "@/lib/staff/dispatcherStats";
import type { KanbanColumnId } from "@/lib/complaints/kanbanColumn";
import { DispatcherToolbar, type DispatcherFilters } from "./DispatcherToolbar";
import { DispatcherMapPanel } from "./DispatcherMapPanel";
import { ComplaintsKanban } from "./ComplaintsKanban";
import { DispatcherStatsRow } from "./DispatcherStatsRow";
import { QuickAssignModal } from "./QuickAssignModal";
import type { ApiResponse } from "@/types/api";

const POLL_INTERVAL_MS = 20000;

interface DispatcherPanelProps {
  initialStats: DispatcherStats;
  initialComplaints: DispatcherComplaintItem[];
  initialInspectors: DispatcherInspectorItem[];
  districts: string[];
}

export function DispatcherPanel({
  initialStats,
  initialComplaints,
  initialInspectors,
  districts,
}: DispatcherPanelProps) {
  const [complaints, setComplaints] =
    useState<DispatcherComplaintItem[]>(initialComplaints);
  const [stats, setStats] = useState<DispatcherStats>(initialStats);
  const [inspectors, setInspectors] =
    useState<DispatcherInspectorItem[]>(initialInspectors);
  const [filters, setFilters] = useState<DispatcherFilters>({
    district: "",
    priority: "",
    column: "",
  });
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [modalState, setModalState] = useState<
    { open: false } | { open: true; preselectedComplaintId?: string }
  >({ open: false });

  const refresh = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.district) params.set("district", filters.district);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.column) params.set("column", filters.column);

    const [complaintsRes, statsRes, inspectorsRes] = await Promise.all([
      fetch(`/api/staff/dispatcher/complaints?${params.toString()}`),
      fetch("/api/staff/dispatcher/stats"),
      fetch("/api/staff/dispatcher/inspectors"),
    ]);

    const [complaintsBody, statsBody, inspectorsBody] = await Promise.all([
      complaintsRes.json() as Promise<ApiResponse<DispatcherComplaintItem[]>>,
      statsRes.json() as Promise<ApiResponse<DispatcherStats>>,
      inspectorsRes.json() as Promise<ApiResponse<DispatcherInspectorItem[]>>,
    ]);

    if (complaintsBody.success && complaintsBody.data) {
      setComplaints(complaintsBody.data);
    }
    if (statsBody.success && statsBody.data) {
      setStats(statsBody.data);
    }
    if (inspectorsBody.success && inspectorsBody.data) {
      setInspectors(inspectorsBody.data);
    }
    setLastUpdatedAt(new Date());
  }, [filters]);

  useEffect(() => {
    refresh();
    const intervalId = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [refresh]);

  const handleMove = useCallback(
    async (complaintId: string, column: KanbanColumnId) => {
      const response = await fetch(
        `/api/staff/dispatcher/complaints/${complaintId}/move`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ column }),
        },
      );
      const body = (await response.json()) as ApiResponse<{ status: string }>;
      if (body.success) {
        await refresh();
      }
    },
    [refresh],
  );

  return (
    <div className="space-y-4">
      <DispatcherToolbar
        lastUpdatedAt={lastUpdatedAt}
        districts={districts}
        filters={filters}
        onFilterChange={setFilters}
        onQuickAssignClick={() => setModalState({ open: true })}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <DispatcherMapPanel />
        </div>
        <div className="xl:col-span-7">
          <ComplaintsKanban
            complaints={complaints}
            onMove={handleMove}
            onAssignClick={(complaintId) =>
              setModalState({ open: true, preselectedComplaintId: complaintId })
            }
          />
        </div>
      </div>

      <DispatcherStatsRow stats={stats} />

      {modalState.open ? (
        <QuickAssignModal
          inspectors={inspectors}
          preselectedComplaintId={modalState.preselectedComplaintId}
          onClose={() => setModalState({ open: false })}
          onAssigned={refresh}
        />
      ) : null}
    </div>
  );
}
