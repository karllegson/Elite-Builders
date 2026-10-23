import { redirect } from "next/navigation";
import JobsBoard from "@/components/dashboard/JobsBoard";
import { getShowcaseSettings, listShowcaseProjects } from "@/lib/admin/showcase.server";
import { listContactSubmissions } from "@/lib/contact/submissions.server";
import { hasDashboardSession } from "@/lib/dashboard/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!(await hasDashboardSession())) {
    redirect("/dashboard/login");
  }

  const [jobs, settings, messages] = await Promise.all([
    listShowcaseProjects(),
    getShowcaseSettings(),
    listContactSubmissions(),
  ]);

  return (
    <JobsBoard
      initialJobs={jobs}
      initialStages={settings.jobStages}
      initialMessages={messages.submissions}
      messagesUnavailable={messages.available ? null : (messages.message ?? "Messages are unavailable.")}
    />
  );
}
