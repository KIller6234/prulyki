const STATUS_LABELS: Record<string, string> = {
  REGISTERED: "Зареєстровано",
  UNDER_REVIEW: "На розгляді",
  FORWARDED: "Направлено виконавцю",
  DONE: "Виконано",
  REJECTED: "Відмовлено",
  EXTENDED: "Продовжено строк",
  ANNULLED: "Анульовано",
};

const STATUS_COLORS: Record<string, string> = {
  REGISTERED: "bg-blue-100 text-blue-800",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  FORWARDED: "bg-violet-100 text-violet-800",
  DONE: "bg-primary-100 text-primary-800",
  REJECTED: "bg-red-100 text-red-800",
  EXTENDED: "bg-orange-100 text-orange-800",
  ANNULLED: "bg-gray-200 text-gray-600",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
