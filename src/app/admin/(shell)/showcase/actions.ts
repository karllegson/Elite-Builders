"use server";

import { isAuthBypassEnabled } from "@/lib/admin/auth";
import type { UpsertShowcaseProjectInput } from "@/lib/admin/showcaseData";
import {
  deleteShowcaseProjects,
  getShowcaseProjectById,
  getShowcaseSettings,
  listShowcaseProjects,
  updateShowcaseSettings,
  upsertShowcaseProject,
} from "@/lib/admin/showcase.server";
import { createClient } from "@/lib/supabase/server";

async function assertAdminAuth(): Promise<void> {
  if (isAuthBypassEnabled()) {
    return;
  }

  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Unauthorized");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }
}

export async function fetchShowcaseProjectsAction() {
  try {
    await assertAdminAuth();
    const [projects, settings] = await Promise.all([
      listShowcaseProjects(),
      getShowcaseSettings(),
    ]);
    return { projects, settings };
  } catch (error) {
    return {
      projects: [],
      settings: { slideDurationSeconds: 12, calendarSlideDurationSeconds: 16 },
      error: error instanceof Error ? error.message : "Could not load showcase projects.",
    };
  }
}

export async function fetchShowcaseProjectForEditAction(id: string) {
  try {
    await assertAdminAuth();
    const project = await getShowcaseProjectById(id);
    return { project };
  } catch (error) {
    return {
      project: null,
      error: error instanceof Error ? error.message : "Could not load project.",
    };
  }
}

export async function saveShowcaseProjectAction(input: UpsertShowcaseProjectInput) {
  try {
    await assertAdminAuth();

    if (!input.name.trim()) {
      return { error: "Project name is required." };
    }

    const project = await upsertShowcaseProject(input);
    return { project };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save project.",
    };
  }
}

export async function deleteShowcaseProjectsAction(ids: string[]) {
  try {
    await assertAdminAuth();
    await deleteShowcaseProjects(ids);
    return { ok: true as const };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not delete projects.",
    };
  }
}

export async function saveShowcaseSettingsAction(settings: {
  slideDurationSeconds: number;
  calendarSlideDurationSeconds: number;
}) {
  try {
    await assertAdminAuth();
    const saved = await updateShowcaseSettings(settings);
    return { settings: saved };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save settings.",
    };
  }
}
