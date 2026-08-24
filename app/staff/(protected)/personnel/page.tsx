import { redirect } from "next/navigation";
import { getAdminSession, getStaffSession } from "@/lib/auth/guard";
import { roleLandingPath } from "@/lib/staff/roleLanding";
import { computeDashboardStats } from "@/lib/staff/dashboardStats";
import { StatCard } from "@/components/staff/StatCard";
import { StaffTable } from "@/components/staff/StaffTable";
import { ComplaintsTrendChart } from "@/components/staff/ComplaintsTrendChart";
import {
  ComplaintIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
} from "@/components/icons";

export default async function StaffPersonnelPage() {
  const session = await getAdminSession();
  if (!session) {
    const staffSession = await getStaffSession();
    redirect(staffSession ? roleLandingPath(staffSession.role) : "/staff/login");
  }

  const stats = await computeDashboardStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Усього звернень"
          value={stats.totalComplaints.value}
          trend={stats.totalComplaints.trend}
          Icon={ComplaintIcon}
          iconBgClassName="bg-mint-100"
          iconColorClassName="text-primary-700"
        />
        <StatCard
          label="Активні співробітники"
          value={stats.activeStaff.value}
          trend={stats.activeStaff.trend}
          Icon={UsersIcon}
          iconBgClassName="bg-secondary-100"
          iconColorClassName="text-secondary-700"
        />
        <StatCard
          label="Активні майданчики"
          value={stats.activeCollectionPoints.value}
          trend={stats.activeCollectionPoints.trend}
          Icon={MapPinIcon}
          iconBgClassName="bg-amber-100"
          iconColorClassName="text-amber-700"
        />
        <StatCard
          label="Середній час відповіді"
          value={stats.avgResponseTime.value}
          trend={stats.avgResponseTime.trend}
          Icon={ClockIcon}
          iconBgClassName="bg-teal-100"
          iconColorClassName="text-teal-700"
        />
      </div>

      <StaffTable />

      <ComplaintsTrendChart />
    </div>
  );
}
