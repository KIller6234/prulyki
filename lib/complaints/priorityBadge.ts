export const COMPLAINT_PRIORITY_LABELS: Record<string, string> = {
  HIGH: "Високий",
  MEDIUM: "Середній",
  LOW: "Низький",
};

export const COMPLAINT_PRIORITY_BADGE_CLASSES: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-gray-100 text-gray-600",
};

export const COMPLAINT_PRIORITY_OPTIONS = [
  { value: "", label: "Усі пріоритети" },
  { value: "HIGH", label: "Високий" },
  { value: "MEDIUM", label: "Середній" },
  { value: "LOW", label: "Низький" },
] as const;
