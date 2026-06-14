import { serviceAreas as staticServiceAreas } from "@/lib/site/config";

export const SERVICE_AREAS_STORAGE_KEY = "elite-builders-service-areas-v1";
export const UNUSED_SECTION_ID = "unused";

export type ServiceAreaStatus = "published" | "draft";

export type ServiceAreaRecord = {
  id: string;
  title: string;
  city: string;
  stateCode: string;
  slug: string;
  sortOrder: number;
  status: ServiceAreaStatus;
  unused: boolean;
  parentId: string | null;
  hidden: boolean;
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

export function normalizeServiceAreaRecord(
  area: Partial<ServiceAreaRecord> & Pick<ServiceAreaRecord, "id" | "title" | "slug">,
): ServiceAreaRecord {
  const { city, stateCode } = parseServiceAreaTitle(area.title ?? "", area.stateCode ?? "CA");

  return {
    id: area.id,
    title: area.title ?? formatServiceAreaLabel(city, stateCode),
    city: area.city ?? city,
    stateCode: (area.stateCode ?? stateCode).toUpperCase(),
    slug: area.slug,
    sortOrder: area.sortOrder ?? 0,
    status: area.status ?? "draft",
    unused: area.unused ?? false,
    parentId: area.parentId ?? null,
    hidden: area.hidden ?? false,
    createdAt: area.createdAt ?? new Date(0).toISOString(),
    updatedAt: area.updatedAt ?? new Date(0).toISOString(),
  };
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
      title: formatServiceAreaLabel(city, stateCode),
      city,
      stateCode,
      slug: area.slug,
      sortOrder: index,
      status: "published" as const,
      unused: false,
      parentId: null,
      hidden: false,
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

export function writeServiceAreasStore(store: ServiceAreasStore): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SERVICE_AREAS_STORAGE_KEY, JSON.stringify(store));
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
};

export function upsertServiceArea(input: UpsertServiceAreaInput): ServiceAreaRecord {
  const store = readServiceAreasStore();
  const now = new Date().toISOString();
  const { city, stateCode } = parseServiceAreaTitle(input.title);
  const slug = input.slug.trim() || city.toLowerCase().replace(/\s+/g, "-");
  const id = input.id ?? slug;
  const sectionId = stateCodeToSectionId(stateCode);
  const existingIndex = store.areas.findIndex((area) => area.id === id);

  const nextRecord: ServiceAreaRecord = normalizeServiceAreaRecord({
    id,
    title: formatServiceAreaLabel(city, stateCode),
    city,
    stateCode,
    slug,
    sortOrder:
      input.sortOrder ??
      (existingIndex >= 0
        ? store.areas[existingIndex].sortOrder
        : store.areas.filter(
            (area) =>
              area.parentId === (input.parentId ?? null) &&
              !area.unused,
          ).length),
    status: input.status ?? "draft",
    unused: input.unused ?? false,
    parentId:
      input.parentId ??
      (existingIndex >= 0 ? store.areas[existingIndex].parentId : null),
    hidden:
      input.hidden ??
      (existingIndex >= 0 ? store.areas[existingIndex].hidden : false),
    createdAt: existingIndex >= 0 ? store.areas[existingIndex].createdAt : now,
    updatedAt: now,
  });

  if (existingIndex >= 0) {
    store.areas[existingIndex] = nextRecord;
  } else {
    store.areas.push(nextRecord);
  }

  if (!store.sectionOrder.includes(sectionId)) {
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
  const nextAreas: ServiceAreaRecord[] = [];

  for (const sectionId of sectionOrder) {
    const sectionAreas = areasBySection[sectionId] ?? [];

    sectionAreas.forEach((area, index) => {
      const stateCode = sectionIdToStateCode(sectionId);
      const isUnused = sectionId === UNUSED_SECTION_ID;

      nextAreas.push({
        ...area,
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

  store.areas = nextAreas;
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
      area.stateCode === stateCode && !area.unused
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
    if (area.unused) {
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
          return area.unused;
        }

        return !area.unused && stateCodeToSectionId(area.stateCode) === sectionId;
      })
      .sort((left, right) => left.sortOrder - right.sortOrder);

    return { section, areas };
  });
}
