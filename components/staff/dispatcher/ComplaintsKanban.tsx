"use client";

import { useState } from "react";
import type { DispatcherComplaintItem } from "@/lib/staff/dispatcherComplaints";
import {
  KANBAN_COLUMNS,
  KANBAN_NEXT_COLUMN,
  type KanbanColumnId,
} from "@/lib/complaints/kanbanColumn";
import { ComplaintCard } from "./ComplaintCard";

interface ComplaintsKanbanProps {
  complaints: DispatcherComplaintItem[];
  onMove: (complaintId: string, column: KanbanColumnId) => void;
  onAssignClick: (complaintId: string) => void;
}

export function ComplaintsKanban({
  complaints,
  onMove,
  onAssignClick,
}: ComplaintsKanbanProps) {
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumnId | null>(
    null,
  );

  const byColumn = new Map<KanbanColumnId, DispatcherComplaintItem[]>(
    KANBAN_COLUMNS.map((c) => [c.id, []]),
  );
  for (const complaint of complaints) {
    byColumn.get(complaint.column)?.push(complaint);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {KANBAN_COLUMNS.map((column) => {
        const columnComplaints = byColumn.get(column.id) ?? [];
        return (
          <div
            key={column.id}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverColumn(column.id);
            }}
            onDragLeave={() =>
              setDragOverColumn((prev) => (prev === column.id ? null : prev))
            }
            onDrop={(event) => {
              event.preventDefault();
              setDragOverColumn(null);
              const complaintId = event.dataTransfer.getData("text/plain");
              if (complaintId) onMove(complaintId, column.id);
            }}
            className={`flex min-h-[200px] flex-col gap-2 rounded-2xl p-2 transition-colors ${
              dragOverColumn === column.id
                ? "bg-primary-50 ring-2 ring-primary-300"
                : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between px-1.5 pt-1">
              <h3 className="text-sm font-semibold text-gray-700">
                {column.label}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
                {columnComplaints.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {columnComplaints.length === 0 ? (
                <p className="px-1.5 py-4 text-center text-xs text-gray-400">
                  Немає звернень
                </p>
              ) : (
                columnComplaints.map((complaint) => {
                  const nextColumn = KANBAN_NEXT_COLUMN[column.id];
                  const canAdvance =
                    nextColumn !== null &&
                    (nextColumn !== "assigned" || Boolean(complaint.assignedTo));
                  return (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onDragStart={(event) =>
                        event.dataTransfer.setData("text/plain", complaint.id)
                      }
                      onAssignClick={() => onAssignClick(complaint.id)}
                      onAdvanceClick={
                        canAdvance && nextColumn
                          ? () => onMove(complaint.id, nextColumn)
                          : null
                      }
                    />
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
