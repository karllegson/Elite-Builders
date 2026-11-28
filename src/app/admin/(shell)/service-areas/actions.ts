"use server";

import { mergeServiceAreasStores } from "@/lib/admin/serviceAreasMerge";
import {
  getPublishedPublicServiceAreaBySlug,
  getPublishedPublicServiceAreaSubPage,
  listPublishedPublicServiceAreas,
  loadServiceAreasStore,
  saveServiceAreasStore,
} from "@/lib/admin/serviceAreas.server";
import type { ServiceAreasStore } from "@/lib/admin/serviceAreasData";
import type {
  PublicServiceArea,
  PublicServiceAreaSubPage,
} from "@/lib/site/serviceAreasPublic";
import { revalidateServiceAreaPages } from "@/lib/site/revalidatePublicPages";

export async function syncServiceAreasStoreAction(
  store: ServiceAreasStore,
): Promise<{ ok: true; store: ServiceAreasStore }> {
  if (store.version !== 1 || !Array.isArray(store.areas)) {
    throw new Error("Invalid service areas store payload.");
  }

  // Merge page by page so a stale admin tab can't overwrite newer saves.
  const current = await loadServiceAreasStore().catch(() => null);
  const merged = current ? mergeServiceAreasStores(current, store) : store;
  await saveServiceAreasStore(merged);
  revalidateServiceAreaPages();
  return { ok: true, store: merged };
}

export async function fetchServiceAreasStoreAction(): Promise<ServiceAreasStore | null> {
  try {
    const store = await loadServiceAreasStore();
    return store.areas.length > 0 ? store : null;
  } catch {
    return null;
  }
}

export async function fetchPublicServiceAreasAction(): Promise<PublicServiceArea[]> {
  try {
    return await listPublishedPublicServiceAreas();
  } catch {
    return [];
  }
}

export async function fetchPublicServiceAreaBySlugAction(
  slug: string,
): Promise<PublicServiceArea | null> {
  try {
    return await getPublishedPublicServiceAreaBySlug(slug);
  } catch {
    return null;
  }
}

export async function fetchPublicServiceAreaSubPageAction(
  parentSlug: string,
  childSlug: string,
): Promise<PublicServiceAreaSubPage | null> {
  try {
    return await getPublishedPublicServiceAreaSubPage(parentSlug, childSlug);
  } catch {
    return null;
  }
}
