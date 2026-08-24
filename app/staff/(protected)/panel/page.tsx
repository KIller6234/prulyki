import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/guard";
import { computeDispatcherStats } from "@/lib/staff/dispatcherStats";
import { fetchDispatcherComplaints } from "@/lib/staff/dispatcherComplaints";
import { fetchDispatcherInspectors } from "@/lib/staff/dispatcherInspectors";
import { fetchDispatcherDistricts } from "@/lib/staff/dispatcherDistricts";
import { DispatcherPanel } from "@/components/staff/dispatcher/DispatcherPanel";

export default async function StaffPanelPage() {
  const session = await getStaffSession();
  if (!session) {
    redirect("/staff/login");
  }
  if (session.role === "INSPECTOR") {
    redirect("/staff/zvernennya");
  }

  const [stats, complaints, inspectors, districts] = await Promise.all([
    computeDispatcherStats(),
    fetchDispatcherComplaints(),
    fetchDispatcherInspectors(),
    fetchDispatcherDistricts(),
  ]);

  return (
    <DispatcherPanel
      initialStats={stats}
      initialComplaints={complaints}
      initialInspectors={inspectors}
      districts={districts}
    />
  );
}
