const KYIV_TIME_ZONE = "Europe/Kyiv";
const DAY_MS = 24 * 60 * 60 * 1000;

// ISO weekday: 1=Пн ... 7=Нд
const ISO_WEEKDAY_BY_SHORT_NAME: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function getKyivIsoWeekday(instant: Date): number {
  const shortName = new Intl.DateTimeFormat("en-US", {
    timeZone: KYIV_TIME_ZONE,
    weekday: "short",
  }).format(instant);
  return ISO_WEEKDAY_BY_SHORT_NAME[shortName];
}

interface KyivDateParts {
  year: number;
  month: number;
  day: number;
}

export function getKyivDateParts(instant: Date): KyivDateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KYIV_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day),
  };
}

/** Resolves a Europe/Kyiv wall-clock date+time to the corresponding UTC instant. */
export function kyivWallClockToUtc(
  { year, month, day }: KyivDateParts,
  hour: number,
  minute: number,
): Date {
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const shownParts = new Intl.DateTimeFormat("en-US", {
    timeZone: KYIV_TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(guessUtc);
  const byType = Object.fromEntries(shownParts.map((p) => [p.type, p.value]));
  const shownHour = byType.hour === "24" ? 0 : Number(byType.hour);
  const shownAsUtc = Date.UTC(
    Number(byType.year),
    Number(byType.month) - 1,
    Number(byType.day),
    shownHour,
    Number(byType.minute),
  );
  const driftMs = shownAsUtc - guessUtc.getTime();
  return new Date(guessUtc.getTime() - driftMs);
}

/**
 * Returns the next UTC instant (at or after `from`) on which one of
 * `daysOfWeek` (1=Пн..7=Нд, Europe/Kyiv calendar) occurs at `timeFrom`
 * ("HH:MM", Europe/Kyiv wall-clock time).
 */
export function nextOccurrence(
  daysOfWeek: readonly number[],
  timeFrom: string,
  from: Date = new Date(),
): Date {
  const [targetHour, targetMinute] = timeFrom.split(":").map(Number);

  for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
    const candidateInstant = new Date(from.getTime() + dayOffset * DAY_MS);
    const kyivWeekday = getKyivIsoWeekday(candidateInstant);
    if (!daysOfWeek.includes(kyivWeekday)) continue;

    const candidateAtTime = kyivWallClockToUtc(
      getKyivDateParts(candidateInstant),
      targetHour,
      targetMinute,
    );
    if (candidateAtTime.getTime() >= from.getTime()) {
      return candidateAtTime;
    }
  }

  throw new Error(
    "Не вдалося обчислити наступну дату — daysOfWeek порожній або некоректний",
  );
}
