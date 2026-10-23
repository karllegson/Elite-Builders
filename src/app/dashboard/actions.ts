"use server";

import { redirect } from "next/navigation";
import {
  deleteShowcaseProjects,
  patchShowcaseProject,
  upsertShowcaseProject,
  type ShowcaseJobPatch,
} from "@/lib/admin/showcase.server";
import {
  getShowcaseSettings,
  updateShowcaseSettings,
} from "@/lib/admin/showcase.server";
import {
  normalizeJobStages,
  type ShowcaseProject,
  type ShowcaseStatus,
} from "@/lib/admin/showcaseData";
import { markContactSubmissionRead } from "@/lib/contact/submissions.server";
import {
  assertDashboardSession,
  checkDashboardPassword,
  endDashboardSession,
  startDashboardSession,
} from "@/lib/dashboard/session";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!checkDashboardPassword(password)) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "Wrong password." };
  }

  await startDashboardSession();
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await endDashboardSession();
  redirect("/dashboard/login");
}

type JobResult = { job?: ShowcaseProject; error?: string };

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export type NewJobInput = {
  status: Extract<ShowcaseStatus, "bidding" | "current">;
  name: string;
  location: string;
  builder: string;
  bidDueDate: string | null;
  dueDate: string | null;
};

export async function addJobAction(input: NewJobInput): Promise<JobResult> {
  try {
    await assertDashboardSession();

    if (!input.name.trim()) {
      return { error: "Job name is required." };
    }

    const { jobStages } = await getShowcaseSettings();
    const job = await upsertShowcaseProject({
      name: input.name,
      location: input.location,
      builder: input.builder,
      type: "Framing",
      status: input.status,
      dueDate: input.dueDate,
      bidDueDate: input.bidDueDate,
      stage: input.status === "current" ? (jobStages[0] ?? "") : "",
      blurb: "",
      details: "",
      featuredImage: null,
      displayOrder: 0,
      published: true,
    });

    return { job };
  } catch (error) {
    return { error: errorMessage(error, "Could not add the job.") };
  }
}

export async function updateJobAction(id: string, patch: ShowcaseJobPatch): Promise<JobResult> {
  try {
    await assertDashboardSession();

    if (patch.name !== undefined && !patch.name.trim()) {
      return { error: "Job name can't be empty." };
    }

    const job = await patchShowcaseProject(id, patch);
    return { job };
  } catch (error) {
    return { error: errorMessage(error, "Could not save the change.") };
  }
}

export async function saveStagesAction(
  stages: string[],
): Promise<{ stages?: string[]; error?: string }> {
  try {
    await assertDashboardSession();
    const saved = await updateShowcaseSettings({ jobStages: normalizeJobStages(stages) });
    return { stages: saved.jobStages };
  } catch (error) {
    return { error: errorMessage(error, "Could not save the stages.") };
  }
}

export async function deleteJobAction(id: string): Promise<{ ok?: true; error?: string }> {
  try {
    await assertDashboardSession();
    await deleteShowcaseProjects([id]);
    return { ok: true };
  } catch (error) {
    return { error: errorMessage(error, "Could not delete the job.") };
  }
}

export async function markMessageReadAction(
  id: string,
  isRead: boolean,
): Promise<{ ok?: true; error?: string }> {
  try {
    await assertDashboardSession();
    return (await markContactSubmissionRead(id, isRead))
      ? { ok: true }
      : { error: "Could not update the message." };
  } catch (error) {
    return { error: errorMessage(error, "Could not update the message.") };
  }
}
