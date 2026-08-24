import type { ComplaintType, DeadlineType } from "@/app/generated/prisma/client";

const GENERAL_DEADLINE_DAYS = 30;
const REDUCED_DEADLINE_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Закон «Про звернення громадян»: загальний строк розгляду — 30 днів,
 * скорочений — 15 днів для звернень, що не потребують додаткового вивчення.
 * MVP-спрощення: чи потребує звернення додаткового вивчення в реальності
 * визначає розгляд, не сам тип — тут це наближено типом "пропозиція/
 * зауваження" як єдиним типом, що типово не потребує вивчення.
 */
export function computeComplaintDeadline(
  type: ComplaintType,
  registeredAt: Date,
): { dueDate: Date; deadlineType: DeadlineType } {
  const deadlineType: DeadlineType =
    type === "PROPOSAL" ? "REDUCED_15" : "GENERAL_30";
  const days =
    deadlineType === "REDUCED_15"
      ? REDUCED_DEADLINE_DAYS
      : GENERAL_DEADLINE_DAYS;

  return {
    dueDate: new Date(registeredAt.getTime() + days * DAY_MS),
    deadlineType,
  };
}
