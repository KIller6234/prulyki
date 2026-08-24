import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { computeDashboardStats } from "@/lib/staff/dashboardStats";
import { AdminSidebar } from "@/components/staff/AdminSidebar";
import { AdminHeader } from "@/components/staff/AdminHeader";

export default async function StaffProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Захист рівня сторінки — на додачу до proxy.ts (захист рівня маршруту),
  // а не замість нього: proxy виконує "оптимістичну" перевірку сесії
  // (https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional).
  const session = await getStaffSession();
  if (!session) {
    redirect("/staff/login");
  }

  const [staffUser, stats] = await Promise.all([
    prisma.staffUser.findUnique({
      where: { id: session.staffId },
      select: { fullName: true },
    }),
    computeDashboardStats(),
  ]);

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar role={session.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          fullName={staffUser?.fullName ?? session.email}
          role={session.role}
          urgentCount={stats.urgentComplaintsCount}
        />
        <main className="flex-1 overflow-y-auto bg-secondary-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
