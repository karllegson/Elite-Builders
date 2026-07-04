import {
  createDefaultServicePagesStore,
  normalizeServicePageRecord,
  type ServicePagesStore,
} from "@/lib/admin/servicesData";
import {
  readServicePagesStoreFromDisk,
  writeServicePagesStoreToDisk,
} from "@/lib/admin/servicesLocalData";
import {
  findPublicServicePageBySlug,
  getPublicServicePagesFromStore,
  type PublicServicePage,
} from "@/lib/site/servicesPublic";

function normalizeStore(raw: ServicePagesStore): ServicePagesStore {
  if (raw.version !== 3 || !Array.isArray(raw.pages)) {
    return createDefaultServicePagesStore();
  }

  return {
    version: 3,
    pages: raw.pages.map((page) => normalizeServicePageRecord(page)),
  };
}

export async function loadServicePagesStore(): Promise<ServicePagesStore> {
  const store = await readServicePagesStoreFromDisk();
  return normalizeStore(store);
}

export async function saveServicePagesStore(store: ServicePagesStore): Promise<void> {
  const normalized = normalizeStore(store);
  await writeServicePagesStoreToDisk(normalized);
}

export async function listPublishedPublicServicePages(): Promise<PublicServicePage[]> {
  const store = await loadServicePagesStore();
  return getPublicServicePagesFromStore(store);
}

export async function getPublishedPublicServicePageBySlug(
  slug: string,
): Promise<PublicServicePage | null> {
  const store = await loadServicePagesStore();
  return findPublicServicePageBySlug(slug, store);
}
