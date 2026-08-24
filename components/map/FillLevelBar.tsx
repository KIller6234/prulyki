interface FillLevelBarProps {
  percent: number;
}

/**
 * Горизонтальний індикатор наповненості: фіксований градієнт
 * зелений→жовтий→червоний під усією смужкою, і сірий оверлей, що
 * приховує невиконану частину справа — тому колір, який видно, залежить
 * від відсотка заповнення.
 */
export function FillLevelBar({ percent }: FillLevelBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2 w-full min-w-[80px] overflow-hidden rounded-full">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(to right, #16a34a, #eab308, #dc2626)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 rounded-r-full bg-gray-200"
          style={{ width: `${100 - clamped}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-medium text-gray-800">
        {clamped}%
      </span>
    </div>
  );
}
