import { TrendDownIcon, TrendUpIcon } from "@/components/icons";
import type { TrendInfo } from "@/lib/staff/trend";

interface StatCardProps {
  label: string;
  value: string;
  trend: TrendInfo | null;
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  iconBgClassName: string;
  iconColorClassName: string;
}

export function StatCard({
  label,
  value,
  trend,
  Icon,
  iconBgClassName,
  iconColorClassName,
}: StatCardProps) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBgClassName} ${iconColorClassName}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
        {trend ? (
          <p
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${
              trend.direction === "up"
                ? "text-primary-600"
                : trend.direction === "down"
                  ? "text-red-600"
                  : "text-gray-400"
            }`}
          >
            {trend.direction === "up" ? (
              <TrendUpIcon className="h-3.5 w-3.5" />
            ) : trend.direction === "down" ? (
              <TrendDownIcon className="h-3.5 w-3.5" />
            ) : null}
            {trend.label}
          </p>
        ) : (
          <p className="mt-1 text-xs text-gray-400">Немає даних для порівняння</p>
        )}
      </div>
    </div>
  );
}
