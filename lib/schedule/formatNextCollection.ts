const KYIV_TIME_ZONE = "Europe/Kyiv";
const DAY_MS = 24 * 60 * 60 * 1000;

export interface NextCollectionInfo {
  /** "сьогодні" | "завтра" | назва дня тижня (напр. "вівторок") */
  label: string;
  /** true, якщо до вивезення лишилось менше 24 годин */
  isSoon: boolean;
}

function kyivDateKey(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KYIV_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function formatNextCollection(
  iso: string,
  now: Date = new Date(),
): NextCollectionInfo {
  const target = new Date(iso);
  const isSoon = target.getTime() - now.getTime() <= DAY_MS;

  const todayKey = kyivDateKey(now);
  const targetKey = kyivDateKey(target);
  const tomorrowKey = kyivDateKey(new Date(now.getTime() + DAY_MS));

  if (targetKey === todayKey) return { label: "сьогодні", isSoon: true };
  if (targetKey === tomorrowKey) return { label: "завтра", isSoon };

  const weekday = new Intl.DateTimeFormat("uk-UA", {
    timeZone: KYIV_TIME_ZONE,
    weekday: "long",
  }).format(target);

  return { label: weekday, isSoon };
}
