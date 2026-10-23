import { redirect } from "next/navigation";
import JobsBoard from "@/components/dashboard/JobsBoard";
import { listShowcaseProjects } from "@/lib/admin/showcase.server";
import { hasDashboardSession } from "@/lib/dashboard/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!(await hasDashboardSession())) {
    redirect("/dashboard/login");
  }

  const jobs = await listShowcaseProjects();

  return <JobsBoard initialJobs={jobs} />;
}
