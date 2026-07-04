import { siteConfig } from "@/lib/admin/config";
import {
  serviceDetails,
  serviceOrder,
  type ServiceDetail,
} from "@/lib/site/scope";

export const SERVICE_PAGES_STORAGE_KEY = "elite-builders-service-pages-v3";
export const SERVICE_PAGES_CHANGED_EVENT = "elite-builders-service-pages-changed";

export type ServicePageStatus = "published" | "draft";

export type ServicePageRecord = ServiceDetail & {
  id: string;
  title: string;
  sortOrder: number;
  status: ServicePageStatus;
  updatedAt: string;
};

export type ServicePagesStore = {
  version: 3;
  pages: ServicePageRecord[];
};

const PAGE_ID_BY_SLUG: Record<string, string> = {
  "home-builder": "services-home-builder",
  "general-contractor": "services-general-contractor",
  remodeler: "services-remodeler",
  "deck-builder": "services-deck-builder",
  "siding-contractor": "services-siding-contractor",
};

export function servicePageIdForSlug(slug: string): string {
  return PAGE_ID_BY_SLUG[slug] ?? `services-${slug}`;
}

export function normalizeServicePageRecord(
  page: Partial<ServicePageRecord> & Pick<ServicePageRecord, "slug" | "name">,
): ServicePageRecord {
  const seed = serviceDetails[page.slug];

  return {
    slug: page.slug,
    name: page.name,
    h1: page.h1 ?? seed?.h1 ?? page.name,
    metaTitle: page.metaTitle ?? seed?.metaTitle ?? page.name,
    metaDescription: page.metaDescription ?? seed?.metaDescription ?? "",
    heroImage: page.heroImage ?? seed?.heroImage ?? "residentialRoofFraming",
    intro: page.intro ?? seed?.intro ?? [],
    scopeHeading: page.scopeHeading ?? seed?.scopeHeading ?? "Scope of Work",
    scope: page.scope ?? seed?.scope ?? [],
    residential: page.residential ?? seed?.residential ?? { heading: "", body: "" },
    commercial: page.commercial ?? seed?.commercial ?? { heading: "", body: "" },
    faqs: page.faqs ?? seed?.faqs ?? [],
    relatedServices: page.relatedServices ?? seed?.relatedServices ?? [],
    featured: page.featured ?? seed?.featured,
    id: page.id ?? servicePageIdForSlug(page.slug),
    title: page.title ?? page.name,
    sortOrder: page.sortOrder ?? 0,
    status: page.status ?? "draft",
    updatedAt: page.updatedAt ?? new Date(0).toISOString(),
  };
}

function seedPageFromDetail(slug: string, detail: ServiceDetail, index: number): ServicePageRecord {
  return normalizeServicePageRecord({
    ...detail,
    id: servicePageIdForSlug(slug),
    title: detail.name,
    sortOrder: index,
    status: "published",
    updatedAt: new Date(0).toISOString(),
  });
}

export function createDefaultServicePagesStore(): ServicePagesStore {
  const pages = serviceOrder.map((slug, index) =>
    seedPageFromDetail(slug, serviceDetails[slug], index),
  );

  return { version: 3, pages };
}

function mergeMissingDefaultPages(pages: ServicePageRecord[]): ServicePageRecord[] {
  const defaults = createDefaultServicePagesStore().pages;
  const existingSlugs = new Set(pages.map((page) => page.slug));
  const missing = defaults.filter((page) => !existingSlugs.has(page.slug));

  if (missing.length === 0) {
    return pages;
  }

  return [...pages, ...missing].map((page, index) =>
    normalizeServicePageRecord({ ...page, sortOrder: page.sortOrder ?? index }),
  );
}

export function readServicePagesStore(): ServicePagesStore {
  if (typeof window === "undefined") {
    return createDefaultServicePagesStore();
  }

  try {
    const raw = window.localStorage.getItem(SERVICE_PAGES_STORAGE_KEY);

    if (!raw) {
      const seeded = createDefaultServicePagesStore();
      writeServicePagesStore(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as ServicePagesStore;

    if (parsed.version !== 3 || !Array.isArray(parsed.pages)) {
      return createDefaultServicePagesStore();
    }

    const pages = mergeMissingDefaultPages(
      parsed.pages.map((page) => normalizeServicePageRecord(page)),
    );

    if (pages.length !== parsed.pages.length) {
      writeServicePagesStore({ version: 3, pages }, { skipSync: false });
    }

    return { version: 3, pages };
  } catch {
    return createDefaultServicePagesStore();
  }
}

export function writeServicePagesStore(
  store: ServicePagesStore,
  options?: { skipSync?: boolean },
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SERVICE_PAGES_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(SERVICE_PAGES_CHANGED_EVENT));

  if (options?.skipSync) {
    return;
  }

  void import("@/lib/admin/servicesSync.client").then(({ syncServicePagesStoreToServer }) => {
    syncServicePagesStoreToServer(store);
  });
}

export function listAllServicePages(): ServicePageRecord[] {
  return readServicePagesStore()
    .pages.slice()
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
}

export function getServicePageBySlug(slug: string): ServicePageRecord | null {
  const page = readServicePagesStore().pages.find((item) => item.slug === slug);
  return page ? normalizeServicePageRecord(page) : null;
}

export function getServicePageById(id: string): ServicePageRecord | null {
  const page = readServicePagesStore().pages.find((item) => item.id === id);
  return page ? normalizeServicePageRecord(page) : null;
}

export type UpsertServicePageInput = Partial<ServicePageRecord> &
  Pick<ServicePageRecord, "slug" | "name">;

export function upsertServicePage(input: UpsertServicePageInput): ServicePageRecord {
  const store = readServicePagesStore();
  const now = new Date().toISOString();
  const existingIndex = store.pages.findIndex(
    (item) => item.slug === input.slug || item.id === input.id,
  );

  const nextRecord = normalizeServicePageRecord({
    ...(existingIndex >= 0 ? store.pages[existingIndex] : {}),
    ...input,
    id: input.id ?? servicePageIdForSlug(input.slug),
    title: input.title ?? input.name,
    updatedAt: now,
  });

  const pages =
    existingIndex >= 0
      ? store.pages.map((page, index) => (index === existingIndex ? nextRecord : page))
      : [...store.pages, nextRecord];

  writeServicePagesStore({ version: 3, pages });
  return nextRecord;
}

export function updateServicePageQuickEdit(
  id: string,
  patch: { title?: string; status?: ServicePageStatus },
): ServicePageRecord | null {
  const store = readServicePagesStore();
  const index = store.pages.findIndex((item) => item.id === id);

  if (index < 0) {
    return null;
  }

  const current = store.pages[index];
  const nextRecord = normalizeServicePageRecord({
    ...current,
    title: patch.title?.trim() || current.title,
    name: patch.title?.trim() || current.name,
    status: patch.status ?? current.status,
    updatedAt: new Date().toISOString(),
  });

  const pages = store.pages.map((page, pageIndex) =>
    pageIndex === index ? nextRecord : page,
  );

  writeServicePagesStore({ version: 3, pages });
  return nextRecord;
}

export const DEFAULT_SERVICE_PAGE_AUTHOR = siteConfig.defaultUserRole;
