const LEGEND_ITEMS = [
  { label: "Норма", colorClassName: "bg-primary-600" },
  { label: "Близько до заповнення", colorClassName: "bg-amber-500" },
  { label: "Переповнений", colorClassName: "bg-red-600" },
] as const;

export function MapLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
      {LEGEND_ITEMS.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.colorClassName}`}
            aria-hidden="true"
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
