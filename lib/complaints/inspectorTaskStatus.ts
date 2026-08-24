export const INSPECTOR_STATUS_LABELS: Record<string, string> = {
  UNDER_REVIEW: "Очікує",
  FORWARDED: "В роботі",
  EXTENDED: "В роботі",
  DONE: "Виконано",
};

export const INSPECTOR_STATUS_BADGE_CLASSES: Record<string, string> = {
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  FORWARDED: "bg-amber-100 text-amber-800",
  EXTENDED: "bg-amber-100 text-amber-800",
  DONE: "bg-primary-100 text-primary-800",
};

export const INSPECTOR_STATUS_FILTER_OPTIONS = [
  { value: "", label: "Усі завдання" },
  { value: "pending", label: "Очікує" },
  { value: "in_progress", label: "В роботі" },
  { value: "done", label: "Виконано" },
] as const;
