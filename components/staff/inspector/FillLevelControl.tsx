import { MinusIcon, PlusIcon } from "@/components/icons";

interface FillLevelControlProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const STEP = 5;

export function FillLevelControl({
  value,
  onChange,
  disabled,
}: FillLevelControlProps) {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        step={STEP}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        className="h-2 flex-1 cursor-pointer accent-primary-600 disabled:cursor-not-allowed"
        aria-label="Заповненість контейнера, відсотків"
      />
      <div className="flex shrink-0 items-center gap-1 rounded-full border border-gray-300 px-1.5 py-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(clamp(value - STEP))}
          aria-label="Зменшити"
          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
        >
          <MinusIcon className="h-3.5 w-3.5" />
        </button>
        <span className="w-10 text-center text-sm font-semibold text-gray-800">
          {value}%
        </span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(clamp(value + STEP))}
          aria-label="Збільшити"
          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
