export interface TrendInfo {
  direction: "up" | "down" | "flat";
  label: string;
}

/**
 * Порівнює поточний період із попереднім і формує підпис тренду.
 * Якщо попередній період порожній (типово для щойно засіяних демо-даних),
 * повертає абсолютний приріст замість оманливого "∞%" чи вигаданого числа.
 */
export function computeTrend(
  currentPeriodCount: number,
  previousPeriodCount: number,
  periodLabel: string,
): TrendInfo | null {
  if (currentPeriodCount === 0 && previousPeriodCount === 0) return null;

  if (previousPeriodCount === 0) {
    return {
      direction: currentPeriodCount > 0 ? "up" : "flat",
      label: `+${currentPeriodCount} ${periodLabel}`,
    };
  }

  const changePercent = Math.round(
    ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100,
  );

  if (changePercent === 0) {
    return { direction: "flat", label: `0% ${periodLabel}` };
  }

  return {
    direction: changePercent > 0 ? "up" : "down",
    label: `${changePercent > 0 ? "+" : ""}${changePercent}% ${periodLabel}`,
  };
}
