import { StatCard } from "@/components/staff/StatCard";
import { ComplaintIcon, TruckIcon, CheckCircleIcon, ClockIcon } from "@/components/icons";
import type { DispatcherStats } from "@/lib/staff/dispatcherStats";

interface DispatcherStatsRowProps {
  stats: DispatcherStats;
}

export function DispatcherStatsRow({ stats }: DispatcherStatsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Звернень сьогодні"
        value={stats.complaintsToday.value}
        trend={stats.complaintsToday.trend}
        Icon={ComplaintIcon}
        iconBgClassName="bg-mint-100"
        iconColorClassName="text-primary-700"
      />
      <StatCard
        label="В роботі"
        value={stats.inProgress.value}
        trend={stats.inProgress.trend}
        Icon={TruckIcon}
        iconBgClassName="bg-amber-100"
        iconColorClassName="text-amber-700"
      />
      <StatCard
        label="Вирішено сьогодні"
        value={stats.resolvedToday.value}
        trend={stats.resolvedToday.trend}
        Icon={CheckCircleIcon}
        iconBgClassName="bg-secondary-100"
        iconColorClassName="text-secondary-700"
      />
      <StatCard
        label="Середній час вирішення"
        value={stats.avgResolutionTime.value}
        trend={stats.avgResolutionTime.trend}
        Icon={ClockIcon}
        iconBgClassName="bg-teal-100"
        iconColorClassName="text-teal-700"
      />
    </div>
  );
}
