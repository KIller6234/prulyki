/** Пороги наповненості контейнерів для 3-рівневого кольорового кодування на мапі. */
export const NEAR_FULL_THRESHOLD_PERCENT = 70;
export const OVERFULL_THRESHOLD_PERCENT = 90;

export type FillLevelState = "normal" | "near_full" | "overfull" | "unknown";

export function fillLevelStateFor(
  fillLevelPercent: number | null,
): FillLevelState {
  if (fillLevelPercent === null) return "unknown";
  if (fillLevelPercent >= OVERFULL_THRESHOLD_PERCENT) return "overfull";
  if (fillLevelPercent >= NEAR_FULL_THRESHOLD_PERCENT) return "near_full";
  return "normal";
}
