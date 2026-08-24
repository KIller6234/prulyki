import type { ComplaintStatus } from "@/app/generated/prisma/client";

export type KanbanColumnId = "new" | "assigned" | "in_progress" | "resolved";

export const KANBAN_COLUMNS: { id: KanbanColumnId; label: string }[] = [
  { id: "new", label: "Нові" },
  { id: "assigned", label: "Призначені" },
  { id: "in_progress", label: "В роботі" },
  { id: "resolved", label: "Вирішені" },
];

/** Статус, у який переходить звернення при переміщенні картки в колонку. */
export const COLUMN_TO_STATUS: Record<KanbanColumnId, ComplaintStatus> = {
  new: "REGISTERED",
  assigned: "UNDER_REVIEW",
  in_progress: "FORWARDED",
  resolved: "DONE",
};

/** Усі статуси, що відображаються в колонці (для фільтрації списку). */
export const COLUMN_TO_STATUSES: Record<KanbanColumnId, ComplaintStatus[]> = {
  new: ["REGISTERED"],
  assigned: ["UNDER_REVIEW"],
  in_progress: ["FORWARDED", "EXTENDED"],
  resolved: ["DONE", "REJECTED", "ANNULLED"],
};

/** Колонка канбану, у якій відображається звернення з цим статусом. */
export function statusToColumn(status: string): KanbanColumnId {
  switch (status) {
    case "REGISTERED":
      return "new";
    case "UNDER_REVIEW":
      return "assigned";
    case "FORWARDED":
    case "EXTENDED":
      return "in_progress";
    case "DONE":
    case "REJECTED":
    case "ANNULLED":
      return "resolved";
    default:
      return "new";
  }
}

export const KANBAN_NEXT_COLUMN: Record<KanbanColumnId, KanbanColumnId | null> = {
  new: "assigned",
  assigned: "in_progress",
  in_progress: "resolved",
  resolved: null,
};
