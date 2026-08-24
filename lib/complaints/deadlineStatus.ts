export type DeadlineUrgency = "overdue" | "soon" | "normal";

const SOON_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;
const TERMINAL_STATUSES = new Set(["DONE", "REJECTED", "ANNULLED"]);

/** ФВ-5.8: візуальна індикація звернень, строк яких спливає (≤3 дні) або прострочено. */
export function getDeadlineUrgency(
  dueDate: Date,
  status: string,
  now: Date = new Date(),
): DeadlineUrgency {
  if (TERMINAL_STATUSES.has(status)) return "normal";

  const msRemaining = dueDate.getTime() - now.getTime();
  if (msRemaining < 0) return "overdue";
  if (msRemaining <= SOON_THRESHOLD_MS) return "soon";
  return "normal";
}
