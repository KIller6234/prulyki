import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/auth/guard";
import { roleLandingPath } from "@/lib/staff/roleLanding";
import { fetchInspectorTasks } from "@/lib/staff/inspectorTasks";
import { InspectorWorkspace } from "@/components/staff/inspector/InspectorWorkspace";

export default async function StaffTasksPage() {
  const session = await getStaffSession();
  if (!session) {
    redirect("/staff/login");
  }
  if (session.role === "DISPATCHER") {
    redirect(roleLandingPath(session.role));
  }

  const tasks = await fetchInspectorTasks(session.staffId);

  return <InspectorWorkspace initialTasks={tasks} />;
}
