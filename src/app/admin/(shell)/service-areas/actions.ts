"use server";

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

export async function syncServiceAreasStoreAction(
  store: ServiceAreasStore,
): Promise<{ ok: true }> {
  if (store.version !== 1 || !Array.isArray(store.areas)) {
    throw new Error("Invalid service areas store payload.");
  }

  await saveServiceAreasStore(store);
  return { ok: true };
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
