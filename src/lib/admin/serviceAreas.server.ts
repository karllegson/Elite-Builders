import {
  createDefaultStore,
  isServiceAreaSubPage,
  isTopLevelServiceArea,
  normalizeServiceAreaRecord,
  type ServiceAreasStore,
} from "@/lib/admin/serviceAreasData";
import { getServiceAreaPublicHref } from "@/lib/site/serviceAreaUrls";
import {
  MOVED_SERVICE_AREA_PATHS,
  serviceLandingSlugForRoute,
} from "@/lib/site/serviceLandingPages";
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

/**
 * Published /service-areas URLs split into path segments (["modesto-ca"],
 * ["modesto-ca", "residential-framing"]) for prerendering. Same filter as the sitemap.
 * Empty when the store can't be read, so the build never fails (pages render on demand).
 */
export async function listPublishedServiceAreaPathSegments(): Promise<string[][]> {
  try {
    const store = await loadServiceAreasStore();

    return store.areas
      .filter(
        (area) =>
          area.status === "published" &&
          !area.hidden &&
          !area.unused &&
          (isTopLevelServiceArea(area) || isServiceAreaSubPage(area)),
      )
      .map((area) => getServiceAreaPublicHref(area, store.areas))
      .filter((href) => href.startsWith("/service-areas/") && !(href in MOVED_SERVICE_AREA_PATHS))
      .map((href) => href.slice("/service-areas/".length).split("/"));
  } catch {
    return [];
  }
}

/**
 * Dashboard-built page shown at a built-in /services route, or null when none is
 * published or the store can't be read (the built-in template page is used instead).
 */
export async function getPublishedServiceLandingArea(
  route: string,
): Promise<PublicServiceArea | null> {
  const slug = serviceLandingSlugForRoute(route);
  if (!slug) return null;

  try {
    return await getPublishedPublicServiceAreaBySlug(slug);
  } catch {
    return null;
  }
}
