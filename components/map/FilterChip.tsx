interface FilterChipProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

/** Pill-чипс: сіра рамка неактивний → суцільний зелений з білим текстом активний. */
export function FilterChip({ label, active, onToggle }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-primary-600 bg-primary-600 text-white"
          : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
      }`}
    >
      {label}
    </button>
  );
}
