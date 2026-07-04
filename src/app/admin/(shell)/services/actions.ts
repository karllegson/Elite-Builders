"use server";

import {
  getPublishedPublicServicePageBySlug,
  listPublishedPublicServicePages,
  loadServicePagesStore,
  saveServicePagesStore,
} from "@/lib/admin/services.server";
import type { ServicePagesStore } from "@/lib/admin/servicesData";
import type { PublicServicePage } from "@/lib/site/servicesPublic";

export async function syncServicePagesStoreAction(
  store: ServicePagesStore,
): Promise<{ ok: true }> {
  if (store.version !== 3 || !Array.isArray(store.pages)) {
    throw new Error("Invalid service pages store payload.");
  }

  await saveServicePagesStore(store);
  return { ok: true };
}

export async function fetchServicePagesStoreAction(): Promise<ServicePagesStore | null> {
  try {
    const store = await loadServicePagesStore();
    return store.pages.length > 0 ? store : null;
  } catch {
    return null;
  }
}

export async function fetchPublicServicePagesAction(): Promise<PublicServicePage[]> {
  try {
    return await listPublishedPublicServicePages();
  } catch {
    return [];
  }
}

export async function fetchPublicServicePageBySlugAction(
  slug: string,
): Promise<PublicServicePage | null> {
  try {
    return await getPublishedPublicServicePageBySlug(slug);
  } catch {
    return null;
  }
}
