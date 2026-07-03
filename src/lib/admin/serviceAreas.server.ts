import {
  createDefaultStore,
  normalizeServiceAreaRecord,
  type ServiceAreasStore,
} from "@/lib/admin/serviceAreasData";
import {
  readServiceAreasStoreFromDisk,
  writeServiceAreasStoreToDisk,
} from "@/lib/admin/serviceAreasLocalData";
import {
  findPublicServiceAreaBySlug,
  findPublicServiceAreaSubPage,
  getPublicServiceAreasFromStore,
  type PublicServiceArea,
  type PublicServiceAreaSubPage,
} from "@/lib/site/serviceAreasPublic";
import {
  MISSING_SERVICE_AREAS_TABLE_MESSAGE,
  SUPABASE_REQUIRED_MESSAGE,
  canUseLocalFileStore,
} from "@/lib/admin/localFileStore";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

const SERVICE_AREAS_STORE_ROW_ID = "default";

function normalizeStore(raw: ServiceAreasStore): ServiceAreasStore {
  if (raw.version !== 1 || !Array.isArray(raw.areas)) {
    return createDefaultStore();
  }

  return {
    version: 1,
    areas: raw.areas.map(normalizeServiceAreaRecord),
    sectionOrder: raw.sectionOrder ?? [],
    customSections: raw.customSections ?? [],
  };
}

function shouldUseLocalStore(): boolean {
  return !hasAdminClient() && canUseLocalFileStore();
}

function assertServiceAreasStorageConfigured(): void {
  if (!hasAdminClient() && !canUseLocalFileStore()) {
    throw new Error(SUPABASE_REQUIRED_MESSAGE);
  }
}

function isMissingServiceAreasStoreError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string };

  return (
    candidate.code === "PGRST205" ||
    Boolean(
      candidate.message?.includes("Could not find the table 'public.service_areas_store'"),
    )
  );
}

async function withServiceAreasStoreFallback<T>(
  supabaseFn: () => Promise<T>,
  localFn: () => Promise<T>,
): Promise<T> {
  assertServiceAreasStorageConfigured();

  if (shouldUseLocalStore()) {
    return localFn();
  }

  try {
    return await supabaseFn();
  } catch (error) {
    if (isMissingServiceAreasStoreError(error)) {
      throw new Error(MISSING_SERVICE_AREAS_TABLE_MESSAGE);
    }

    throw error;
  }
}

async function loadServiceAreasStoreFromSupabase(): Promise<ServiceAreasStore> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("service_areas_store")
    .select("payload")
    .eq("id", SERVICE_AREAS_STORE_ROW_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.payload || typeof data.payload !== "object") {
    return createDefaultStore();
  }

  return normalizeStore(data.payload as ServiceAreasStore);
}

async function saveServiceAreasStoreToSupabase(store: ServiceAreasStore): Promise<void> {
  const client = createAdminClient();
  const { error } = await client.from("service_areas_store").upsert({
    id: SERVICE_AREAS_STORE_ROW_ID,
    version: store.version,
    payload: store,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

async function loadServiceAreasStoreFromDisk(): Promise<ServiceAreasStore> {
  const store = await readServiceAreasStoreFromDisk();
  return normalizeStore(store);
}

export async function loadServiceAreasStore(): Promise<ServiceAreasStore> {
  return withServiceAreasStoreFallback(
    loadServiceAreasStoreFromSupabase,
    loadServiceAreasStoreFromDisk,
  );
}

export async function saveServiceAreasStore(store: ServiceAreasStore): Promise<void> {
  const normalized = normalizeStore(store);

  await withServiceAreasStoreFallback(
    () => saveServiceAreasStoreToSupabase(normalized),
    () => writeServiceAreasStoreToDisk(normalized),
  );
}

export async function listPublishedPublicServiceAreas(): Promise<PublicServiceArea[]> {
  const store = await loadServiceAreasStore();
  return getPublicServiceAreasFromStore(store);
}

export async function getPublishedPublicServiceAreaBySlug(
  slug: string,
): Promise<PublicServiceArea | null> {
  const store = await loadServiceAreasStore();
  return findPublicServiceAreaBySlug(slug, store);
}

export async function getPublishedPublicServiceAreaSubPage(
  parentSlug: string,
  childSlug: string,
): Promise<PublicServiceAreaSubPage | null> {
  const store = await loadServiceAreasStore();
  return findPublicServiceAreaSubPage(parentSlug, childSlug, store);
}
