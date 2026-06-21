import { serviceAreas as staticServiceAreas } from "@/lib/site/config";
import { siteConfig } from "@/lib/admin/config";
import { slugifyServiceAreaPermalink } from "@/lib/admin/postSeo";
import { createServiceAreaRecordId } from "@/lib/site/serviceAreaUrls";

export const SERVICE_AREAS_STORAGE_KEY = "elite-builders-service-areas-v1";
export const SERVICE_AREAS_CHANGED_EVENT = "elite-builders-service-areas-changed";
export const UNUSED_SECTION_ID = "unused";
export const DEFAULT_SERVICE_AREA_AUTHOR = siteConfig.defaultUserRole;

export type ServiceAreaStatus = "published" | "draft";

export type ServiceAreaFeaturedImage = {
  src: string;
  alt: string;
  title: string;
};

export type ServiceAreaRecord = {
  id: string;
  numericId: number;
  title: string;
  city: string;
  stateCode: string;
  slug: string;
  sortOrder: number;
  status: ServiceAreaStatus;
  unused: boolean;
  parentId: string | null;
  hidden: boolean;
  content: string;
  seoTitle: string;
  metaDescription: string;
  seoKeyword: string | null;
  seoSchema: string;
  hasFeaturedImage: boolean;
  featuredImage: ServiceAreaFeaturedImage | null;
  archiveOnly: boolean;
  mapEmbed: string;
  breadcrumbsLinkInactive: boolean;
  author: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ServiceAreaSortSection = {
  id: string;
  name: string;
  stateCode: string | null;
  isUnused: boolean;
};

export type ServiceAreasStore = {
  version: 1;
  areas: ServiceAreaRecord[];
  sectionOrder: string[];
  customSections: ServiceAreaSortSection[];
};

export const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

export function stateCodeToSectionId(stateCode: string): string {
  return `state-${stateCode.toUpperCase()}`;
}

export function sectionIdToStateCode(sectionId: string): string | null {
  if (sectionId === UNUSED_SECTION_ID) {
    return null;
  }

  if (sectionId.startsWith("state-")) {
    return sectionId.slice("state-".length).toUpperCase();
  }

  return null;
}

export function getStateDisplayName(stateCode: string): string {
  return US_STATE_NAMES[stateCode.toUpperCase()] ?? stateCode.toUpperCase();
}

export function formatServiceAreaLabel(city: string, stateCode: string): string {
  return `${city}, ${stateCode.toUpperCase()}`;
}

/** Top-level service area — no parentId means this record IS the parent page at /service-areas/{slug}. */
export function isTopLevelServiceArea(area: Pick<ServiceAreaRecord, "parentId">): boolean {
  return area.parentId === null;
}

export function isServiceAreaSubPage(area: Pick<ServiceAreaRecord, "parentId">): boolean {
  return area.parentId !== null;
}

export function listSortableServiceAreas(): ServiceAreaRecord[] {
  return readServiceAreasStore()
    .areas.filter((area) => isTopLevelServiceArea(area))
    .map(normalizeServiceAreaRecord);
}

export function normalizeServiceAreaRecord(
  area: Partial<ServiceAreaRecord> & Pick<ServiceAreaRecord, "id" | "title" | "slug">,
): ServiceAreaRecord {
  const { city, stateCode } = parseServiceAreaTitle(area.title ?? "", area.stateCode ?? "CA");

  return {
    id: area.id,
    numericId: area.numericId ?? hashStringToNumericId(area.id),
    title: area.title ?? formatServiceAreaLabel(city, stateCode),
    city: area.city ?? city,
    stateCode: (area.stateCode ?? stateCode).toUpperCase(),
    slug: area.slug,
    sortOrder: area.sortOrder ?? 0,
    status: area.status ?? "draft",
    unused: area.unused ?? false,
    parentId: area.parentId ?? null,
    hidden: area.hidden ?? false,
    content: area.content ?? "",
    seoTitle: area.seoTitle ?? area.title ?? formatServiceAreaLabel(city, stateCode),
    metaDescription: area.metaDescription ?? "",
    seoKeyword: area.seoKeyword ?? null,
    seoSchema: area.seoSchema ?? "WebPage",
    hasFeaturedImage: Boolean(area.featuredImage) || (area.hasFeaturedImage ?? false),
    featuredImage: area.featuredImage ?? null,
    archiveOnly: area.archiveOnly ?? false,
    mapEmbed: area.mapEmbed ?? "",
    breadcrumbsLinkInactive: area.breadcrumbsLinkInactive ?? false,
    author: area.author ?? DEFAULT_SERVICE_AREA_AUTHOR,
    publishedAt: area.publishedAt ?? null,
    createdAt: area.createdAt ?? new Date(0).toISOString(),
    updatedAt: area.updatedAt ?? new Date(0).toISOString(),
  };
}

function hashStringToNumericId(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) + 1000;
}

function nextNumericId(areas: ServiceAreaRecord[]): number {
  const highest = areas.reduce(
    (max, area) => Math.max(max, area.numericId ?? 0),
    1000,
  );

  return highest + 1;
}

export function parseServiceAreaTitle(title: string, fallbackStateCode = "CA"): {
  city: string;
  stateCode: string;
} {
  const trimmed = title.trim();

  if (!trimmed) {
    return { city: "", stateCode: fallbackStateCode.toUpperCase() };
  }

  const commaIndex = trimmed.lastIndexOf(",");

  if (commaIndex === -1) {
    return { city: trimmed, stateCode: fallbackStateCode.toUpperCase() };
  }

  const city = trimmed.slice(0, commaIndex).trim();
  const statePart = trimmed.slice(commaIndex + 1).trim().toUpperCase();

  if (!city) {
    return { city: trimmed, stateCode: fallbackStateCode.toUpperCase() };
  }

  if (statePart.length === 2) {
    return { city, stateCode: statePart };
  }

  const matchedEntry = Object.entries(US_STATE_NAMES).find(
    ([, name]) => name.toLowerCase() === statePart.toLowerCase(),
  );

  if (matchedEntry) {
    return { city, stateCode: matchedEntry[0] };
  }

  return { city, stateCode: fallbackStateCode.toUpperCase() };
}

function createUnusedSection(): ServiceAreaSortSection {
  return {
    id: UNUSED_SECTION_ID,
    name: "Unused",
    stateCode: null,
    isUnused: true,
  };
}

function createStateSection(stateCode: string): ServiceAreaSortSection {
  const normalized = stateCode.toUpperCase();

  return {
    id: stateCodeToSectionId(normalized),
    name: getStateDisplayName(normalized),
    stateCode: normalized,
    isUnused: false,
  };
}

export function createDefaultStore(): ServiceAreasStore {
  const areas = staticServiceAreas.map((area, index) => {
    const stateCode = "CA";
    const city = area.city;

    return {
      id: area.slug,
      numericId: 1616 + index,
      title: formatServiceAreaLabel(city, stateCode),
      city,
      stateCode,
      slug: area.slug,
      sortOrder: index,
      status: "published" as const,
      unused: false,
      parentId: null,
      hidden: false,
      content: "",
      seoTitle: formatServiceAreaLabel(city, stateCode),
      metaDescription: "",
      seoKeyword: null,
      seoSchema: "WebPage",
      hasFeaturedImage: false,
      featuredImage: null,
      archiveOnly: false,
      mapEmbed: "",
      breadcrumbsLinkInactive: false,
      author: DEFAULT_SERVICE_AREA_AUTHOR,
      publishedAt: new Date(0).toISOString(),
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    };
  });

  return {
    version: 1,
    areas,
    sectionOrder: [stateCodeToSectionId("CA"), UNUSED_SECTION_ID],
    customSections: [],
  };
}

export function readServiceAreasStore(): ServiceAreasStore {
  if (typeof window === "undefined") {
    return createDefaultStore();
  }

  try {
    const raw = window.localStorage.getItem(SERVICE_AREAS_STORAGE_KEY);

    if (!raw) {
      const seeded = createDefaultStore();
      writeServiceAreasStore(seeded);
      return seeded;
    }

    const parsed = JSON.parse(raw) as ServiceAreasStore;

    if (parsed.version !== 1 || !Array.isArray(parsed.areas)) {
      return createDefaultStore();
    }

    return {
      version: 1,
      areas: parsed.areas.map(normalizeServiceAreaRecord),
      sectionOrder: parsed.sectionOrder ?? [],
      customSections: parsed.customSections ?? [],
    };
  } catch {
    return createDefaultStore();
  }
}

export function writeServiceAreasStore(
  store: ServiceAreasStore,
  options?: { skipSync?: boolean },
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SERVICE_AREAS_STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new CustomEvent(SERVICE_AREAS_CHANGED_EVENT));

  if (options?.skipSync) {
    return;
  }

  void import("@/lib/admin/serviceAreasSync.client").then(({ syncServiceAreasStoreToServer }) => {
    syncServiceAreasStoreToServer(store);
  });
}

export function resetServiceAreasStore(): ServiceAreasStore {
  const seeded = createDefaultStore();
  writeServiceAreasStore(seeded);
  return seeded;
}

export type UpsertServiceAreaInput = {
  id?: string;
  title: string;
  slug: string;
  sortOrder?: number;
  status?: ServiceAreaStatus;
  unused?: boolean;
  parentId?: string | null;
  hidden?: boolean;
  content?: string;
  seoTitle?: string;
  metaDescription?: string;
  seoKeyword?: string | null;
  seoSchema?: string;
  hasFeaturedImage?: boolean;
  featuredImage?: ServiceAreaFeaturedImage | null;
  archiveOnly?: boolean;
  mapEmbed?: string;
  breadcrumbsLinkInactive?: boolean;
  author?: string;
  publishedAt?: string | null;
};

export function getServiceAreaById(id: string): ServiceAreaRecord | null {
  const area = readServiceAreasStore().areas.find((item) => item.id === id);
  return area ? normalizeServiceAreaRecord(area) : null;
}

export function getServiceAreaBySlug(slug: string): ServiceAreaRecord | null {
  const area = readServiceAreasStore().areas.find((item) => item.slug === slug);
  return area ? normalizeServiceAreaRecord(area) : null;
}

export function listAllServiceAreas(): ServiceAreaRecord[] {
  return readServiceAreasStore()
    .areas.map(normalizeServiceAreaRecord)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
}

export function upsertServiceArea(input: UpsertServiceAreaInput): ServiceAreaRecord {
  const store = readServiceAreasStore();
  const now = new Date().toISOString();
  const preliminaryExisting = input.id
    ? store.areas.find((area) => area.id === input.id)
    : null;
  const resolvedParentId =
    input.parentId !== undefined ? input.parentId : (preliminaryExisting?.parentId ?? null);
  const parent = resolvedParentId
    ? store.areas.find((area) => area.id === resolvedParentId)
    : null;
  const isSubPage = Boolean(resolvedParentId);

  if (isSubPage && !parent) {
    throw new Error("Selected parent service area was not found.");
  }

  if (isSubPage && parent && !isTopLevelServiceArea(parent)) {
    throw new Error("Sub-pages can only be assigned to a top-level service area.");
  }

  const trimmedTitle = input.title.trim();
  const parsed = parseServiceAreaTitle(trimmedTitle, parent?.stateCode ?? "CA");
  const city = isSubPage ? trimmedTitle : parsed.city;
  const stateCode = isSubPage ? (parent?.stateCode ?? parsed.stateCode) : parsed.stateCode;
  const displayTitle = isSubPage ? trimmedTitle : formatServiceAreaLabel(parsed.city, stateCode);
  const slug = slugifyServiceAreaPermalink(input.slug.trim() || trimmedTitle);
  const id = input.id ?? createServiceAreaRecordId(slug, resolvedParentId, parent);
  const existingIndex = store.areas.findIndex((area) => area.id === id);
  const existing = existingIndex >= 0 ? store.areas[existingIndex] : preliminaryExisting;

  const duplicateSlug = store.areas.find((area) => {
    if (area.id === id) {
      return false;
    }

    if (area.slug !== slug) {
      return false;
    }

    if (isSubPage) {
      return area.parentId === resolvedParentId;
    }

    return isTopLevelServiceArea(area);
  });

  if (duplicateSlug) {
    throw new Error(
      isSubPage
        ? `Slug "${slug}" is already used under this parent service area.`
        : `Slug "${slug}" is already in use.`,
    );
  }

  const sectionId = stateCodeToSectionId(stateCode);
  const isPublished = (input.status ?? existing?.status ?? "draft") === "published";
  const resolvedFeaturedImage =
    input.featuredImage !== undefined
      ? input.featuredImage
      : (existing?.featuredImage ?? null);

  const nextRecord: ServiceAreaRecord = normalizeServiceAreaRecord({
    id,
    numericId: existing?.numericId ?? nextNumericId(store.areas),
    title: displayTitle,
    city,
    stateCode,
    slug,
    sortOrder:
      input.sortOrder ??
      (existingIndex >= 0
        ? store.areas[existingIndex].sortOrder
        : store.areas.filter(
            (area) =>
              area.parentId === resolvedParentId &&
              !area.unused,
          ).length),
    status: input.status ?? "draft",
    unused: input.unused ?? input.archiveOnly ?? false,
    parentId: resolvedParentId,
    hidden:
      input.hidden ??
      (existingIndex >= 0 ? store.areas[existingIndex].hidden : false),
    content: input.content ?? existing?.content ?? "",
    seoTitle: input.seoTitle ?? existing?.seoTitle ?? displayTitle,
    metaDescription: input.metaDescription ?? existing?.metaDescription ?? "",
    seoKeyword:
      input.seoKeyword !== undefined ? input.seoKeyword : (existing?.seoKeyword ?? null),
    seoSchema: input.seoSchema ?? existing?.seoSchema ?? "WebPage",
    hasFeaturedImage: resolvedFeaturedImage !== null,
    featuredImage: resolvedFeaturedImage,
    archiveOnly: input.archiveOnly ?? existing?.archiveOnly ?? false,
    mapEmbed: input.mapEmbed ?? existing?.mapEmbed ?? "",
    breadcrumbsLinkInactive:
      input.breadcrumbsLinkInactive ?? existing?.breadcrumbsLinkInactive ?? false,
    author: input.author ?? existing?.author ?? DEFAULT_SERVICE_AREA_AUTHOR,
    publishedAt:
      input.publishedAt !== undefined
        ? input.publishedAt
        : isPublished
          ? (existing?.publishedAt ?? now)
          : existing?.publishedAt ?? null,
    createdAt: existingIndex >= 0 ? store.areas[existingIndex].createdAt : now,
    updatedAt: now,
  });

  if (existingIndex >= 0) {
    store.areas[existingIndex] = nextRecord;
  } else {
    store.areas.push(nextRecord);
  }

  if (!isSubPage && !store.sectionOrder.includes(sectionId)) {
    store.sectionOrder = [...store.sectionOrder.filter((id) => id !== UNUSED_SECTION_ID), sectionId, UNUSED_SECTION_ID];
  }

  if (!store.sectionOrder.includes(UNUSED_SECTION_ID)) {
    store.sectionOrder.push(UNUSED_SECTION_ID);
  }

  writeServiceAreasStore(store);
  return nextRecord;
}

export function deleteServiceArea(id: string): boolean {
  const store = readServiceAreasStore();
  const exists = store.areas.some((area) => area.id === id);

  if (!exists) {
    return false;
  }

  store.areas = store.areas
    .filter((area) => area.id !== id)
    .map((area) =>
      area.parentId === id ? { ...area, parentId: null, updatedAt: new Date().toISOString() } : area,
    );

  writeServiceAreasStore(store);
  return true;
}

export function listNestedServiceAreas(): ServiceAreaRecord[] {
  return readServiceAreasStore()
    .areas.filter((area) => !area.unused)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function saveSortingLayout(
  sectionOrder: string[],
  areasBySection: Record<string, ServiceAreaRecord[]>,
): void {
  const store = readServiceAreasStore();
  const subPages = store.areas.filter((area) => isServiceAreaSubPage(area));
  const nextAreas: ServiceAreaRecord[] = [];

  for (const sectionId of sectionOrder) {
    const sectionAreas = areasBySection[sectionId] ?? [];

    sectionAreas.forEach((area, index) => {
      if (isServiceAreaSubPage(area)) {
        return;
      }

      const stateCode = sectionIdToStateCode(sectionId);
      const isUnused = sectionId === UNUSED_SECTION_ID;

      nextAreas.push({
        ...area,
        parentId: null,
        sortOrder: index,
        unused: isUnused,
        stateCode: isUnused ? area.stateCode : (stateCode ?? area.stateCode),
        title: isUnused
          ? area.title
          : formatServiceAreaLabel(area.city, stateCode ?? area.stateCode),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  store.areas = [...nextAreas, ...subPages];
  store.sectionOrder = sectionOrder;
  writeServiceAreasStore(store);
}

export function addCustomSection(name: string, stateCode: string): ServiceAreaSortSection {
  const store = readServiceAreasStore();
  const section = createStateSection(stateCode);

  section.name = name.trim() || section.name;

  if (!store.customSections.some((item) => item.id === section.id)) {
    store.customSections.push(section);
  }

  if (!store.sectionOrder.includes(section.id)) {
    store.sectionOrder = [
      ...store.sectionOrder.filter((id) => id !== UNUSED_SECTION_ID),
      section.id,
      UNUSED_SECTION_ID,
    ];
  }

  writeServiceAreasStore(store);
  return section;
}

export function removeCustomSection(sectionId: string): void {
  if (sectionId === UNUSED_SECTION_ID || sectionId === stateCodeToSectionId("CA")) {
    return;
  }

  const store = readServiceAreasStore();
  const stateCode = sectionIdToStateCode(sectionId);

  store.sectionOrder = store.sectionOrder.filter((id) => id !== sectionId);
  store.customSections = store.customSections.filter((section) => section.id !== sectionId);

  if (stateCode) {
    store.areas = store.areas.map((area) =>
      area.stateCode === stateCode && !area.unused && isTopLevelServiceArea(area)
        ? { ...area, unused: true, updatedAt: new Date().toISOString() }
        : area,
    );
  }

  writeServiceAreasStore(store);
}

export type SortingColumn = {
  section: ServiceAreaSortSection;
  areas: ServiceAreaRecord[];
};

export function buildSortingColumns(store: ServiceAreasStore): SortingColumn[] {
  const sectionMap = new Map<string, ServiceAreaSortSection>();
  sectionMap.set(UNUSED_SECTION_ID, createUnusedSection());

  for (const area of store.areas) {
    if (area.unused || isServiceAreaSubPage(area)) {
      continue;
    }

    const sectionId = stateCodeToSectionId(area.stateCode);
    sectionMap.set(sectionId, createStateSection(area.stateCode));
  }

  for (const section of store.customSections) {
    sectionMap.set(section.id, section);
  }

  const orderedSectionIds = [
    ...store.sectionOrder.filter((id) => sectionMap.has(id)),
    ...[...sectionMap.keys()].filter((id) => !store.sectionOrder.includes(id)),
  ];

  const uniqueSectionIds = [...new Set(orderedSectionIds)];

  if (!uniqueSectionIds.includes(UNUSED_SECTION_ID)) {
    uniqueSectionIds.push(UNUSED_SECTION_ID);
  }

  return uniqueSectionIds.map((sectionId) => {
    const section = sectionMap.get(sectionId) ?? createUnusedSection();
    const areas = store.areas
      .filter((area) => {
        if (sectionId === UNUSED_SECTION_ID) {
          return area.unused && isTopLevelServiceArea(area);
        }

        return (
          !area.unused &&
          isTopLevelServiceArea(area) &&
          stateCodeToSectionId(area.stateCode) === sectionId
        );
      })
      .sort((left, right) => left.sortOrder - right.sortOrder);

    return { section, areas };
  });
}
