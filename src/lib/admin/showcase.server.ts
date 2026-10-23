import {
  createDefaultShowcaseStore,
  createShowcaseProjectId,
  normalizeShowcaseStore,
  sortShowcaseProjectsForDisplay,
  type ShowcaseProject,
  type ShowcaseSettings,
  type ShowcaseStore,
  type UpsertShowcaseProjectInput,
} from "@/lib/admin/showcaseData";
import {
  readShowcaseStoreFromDisk,
  writeShowcaseStoreToDisk,
} from "@/lib/admin/showcaseLocalData";
import {
  MISSING_SHOWCASE_TABLE_MESSAGE,
  SUPABASE_REQUIRED_MESSAGE,
  canUseLocalFileStore,
} from "@/lib/admin/localFileStore";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

const SHOWCASE_STORE_ROW_ID = "default";

function shouldUseLocalStore(): boolean {
  return !hasAdminClient() && canUseLocalFileStore();
}

function assertShowcaseStorageConfigured(): void {
  if (!hasAdminClient() && !canUseLocalFileStore()) {
    throw new Error(SUPABASE_REQUIRED_MESSAGE);
  }
}

function isMissingShowcaseStoreError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string };

  return (
    candidate.code === "PGRST205" ||
    Boolean(candidate.message?.includes("Could not find the table 'public.showcase_store'"))
  );
}

async function withShowcaseStoreFallback<T>(
  supabaseFn: () => Promise<T>,
  localFn: () => Promise<T>,
): Promise<T> {
  assertShowcaseStorageConfigured();

  if (shouldUseLocalStore()) {
    return localFn();
  }

  try {
    return await supabaseFn();
  } catch (error) {
    if (isMissingShowcaseStoreError(error)) {
      throw new Error(MISSING_SHOWCASE_TABLE_MESSAGE);
    }

    throw error;
  }
}

async function loadShowcaseStoreFromSupabase(): Promise<ShowcaseStore> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("showcase_store")
    .select("payload")
    .eq("id", SHOWCASE_STORE_ROW_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.payload || typeof data.payload !== "object") {
    return createDefaultShowcaseStore();
  }

  return normalizeShowcaseStore(data.payload as ShowcaseStore);
}

async function saveShowcaseStoreToSupabase(store: ShowcaseStore): Promise<void> {
  const normalized = normalizeShowcaseStore(store);
  const client = createAdminClient();
  const { error } = await client.from("showcase_store").upsert({
    id: SHOWCASE_STORE_ROW_ID,
    version: normalized.version,
    payload: normalized,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

function isShowcaseStoreUnavailable(error: unknown): boolean {
  if (isMissingShowcaseStoreError(error)) {
    return true;
  }

  return error instanceof Error && error.message === MISSING_SHOWCASE_TABLE_MESSAGE;
}

async function loadShowcaseStore(): Promise<ShowcaseStore> {
  if (shouldUseLocalStore()) {
    return readShowcaseStoreFromDisk();
  }

  assertShowcaseStorageConfigured();

  try {
    return await loadShowcaseStoreFromSupabase();
  } catch (error) {
    if (!isShowcaseStoreUnavailable(error)) {
      throw error;
    }

    if (canUseLocalFileStore()) {
      return readShowcaseStoreFromDisk();
    }

    return createDefaultShowcaseStore();
  }
}

async function saveShowcaseStore(store: ShowcaseStore): Promise<ShowcaseStore> {
  const normalized = normalizeShowcaseStore(store);

  await withShowcaseStoreFallback(
    async () => {
      await saveShowcaseStoreToSupabase(normalized);
    },
    async () => {
      await writeShowcaseStoreToDisk(normalized);
    },
  );

  return normalized;
}

export async function getShowcaseSettings(): Promise<ShowcaseSettings> {
  const store = await loadShowcaseStore();
  return store.settings;
}

export async function updateShowcaseSettings(
  settings: Partial<ShowcaseSettings>,
): Promise<ShowcaseSettings> {
  const store = await loadShowcaseStore();
  const next = await saveShowcaseStore({
    ...store,
    settings: {
      ...store.settings,
      ...settings,
    },
  });

  return next.settings;
}

export async function listShowcaseProjects(): Promise<ShowcaseProject[]> {
  const store = await loadShowcaseStore();
  return sortShowcaseProjectsForDisplay(store.projects);
}

export async function listPublishedShowcaseProjects(): Promise<ShowcaseProject[]> {
  const projects = await listShowcaseProjects();
  return projects.filter((project) => project.published);
}

export async function getShowcaseProjectById(id: string): Promise<ShowcaseProject | null> {
  const store = await loadShowcaseStore();
  return store.projects.find((project) => project.id === id) ?? null;
}

export async function upsertShowcaseProject(
  input: UpsertShowcaseProjectInput,
): Promise<ShowcaseProject> {
  const store = await loadShowcaseStore();
  const now = new Date().toISOString();
  const existing = input.id
    ? store.projects.find((project) => project.id === input.id)
    : undefined;

  const project: ShowcaseProject = {
    id: existing?.id ?? input.id ?? createShowcaseProjectId(),
    name: input.name.trim(),
    location: input.location.trim(),
    builder: input.builder.trim(),
    type: input.type,
    status: input.status,
    dueDate: input.dueDate,
    bidDueDate: input.bidDueDate !== undefined ? input.bidDueDate : (existing?.bidDueDate ?? null),
    takeoffDone: input.takeoffDone ?? existing?.takeoffDone ?? false,
    bidSent: input.bidSent ?? existing?.bidSent ?? false,
    bidResultAt:
      input.bidResultAt !== undefined ? input.bidResultAt : (existing?.bidResultAt ?? null),
    stage: (input.stage ?? existing?.stage ?? "").trim(),
    blurb: input.blurb.trim(),
    details: input.details.trim() || input.blurb.trim(),
    featuredImage: input.featuredImage ?? null,
    displayOrder: input.displayOrder,
    published: input.published,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const projects = existing
    ? store.projects.map((item) => (item.id === project.id ? project : item))
    : [...store.projects, project];

  await saveShowcaseStore({ ...store, projects });
  return project;
}

export type ShowcaseJobPatch = Partial<
  Pick<
    ShowcaseProject,
    | "name"
    | "location"
    | "builder"
    | "type"
    | "status"
    | "dueDate"
    | "bidDueDate"
    | "takeoffDone"
    | "bidSent"
    | "stage"
    | "published"
  >
>;

/**
 * Applies a small edit from the office dashboard. Moving a bid to awarded (current)
 * or declined (lost) stamps bidResultAt so the TV can show the result for a while.
 */
export async function patchShowcaseProject(
  id: string,
  patch: ShowcaseJobPatch,
): Promise<ShowcaseProject> {
  const store = await loadShowcaseStore();
  const existing = store.projects.find((project) => project.id === id);

  if (!existing) {
    throw new Error("That job no longer exists.");
  }

  const now = new Date().toISOString();
  const next: ShowcaseProject = { ...existing, ...patch, updatedAt: now };

  if (patch.status && patch.status !== existing.status) {
    if (existing.status === "bidding" && (patch.status === "current" || patch.status === "lost")) {
      next.bidResultAt = now;
    } else if (patch.status === "bidding") {
      next.bidResultAt = null;
    }

    if (patch.status === "current" && !next.stage) {
      next.stage = store.settings.jobStages[0] ?? "";
    }
  }

  const projects = store.projects.map((project) => (project.id === id ? next : project));
  const saved = await saveShowcaseStore({ ...store, projects });
  return saved.projects.find((project) => project.id === id) ?? next;
}

export async function deleteShowcaseProjects(ids: string[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const store = await loadShowcaseStore();
  const idSet = new Set(ids);
  const projects = store.projects.filter((project) => !idSet.has(project.id));
  await saveShowcaseStore({ ...store, projects });
}

export async function getShowcaseStoreForDisplay(): Promise<{
  settings: ShowcaseSettings;
  projects: ShowcaseProject[];
}> {
  const store = await loadShowcaseStore();
  return {
    settings: store.settings,
    projects: sortShowcaseProjectsForDisplay(
      store.projects.filter((project) => project.published),
    ),
  };
}
