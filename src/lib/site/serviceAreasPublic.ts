import {
  isServiceAreaSubPage,
  isTopLevelServiceArea,
  readServiceAreasStore,
  SERVICE_AREAS_CHANGED_EVENT,
  type ServiceAreaRecord,
  type ServiceAreasStore,
} from "@/lib/admin/serviceAreasData";
import type { ServiceAreaFeaturedImage } from "@/lib/admin/serviceAreaEditor";
import { serviceAreas as staticServiceAreas, type ServiceArea } from "@/lib/site/config";

export { SERVICE_AREAS_CHANGED_EVENT };

export type ServiceAreaRegion = ServiceArea["region"];

export const SERVICE_AREA_REGION_ORDER: ServiceAreaRegion[] = [
  "Bay Area",
  "Central Valley",
  "Southern California",
  "Eastern Sierra",
];

export type PublicServiceArea = ServiceArea & {
  id: string;
  seoTitle: string;
  archiveOnly: boolean;
  content: string;
  featuredImage: ServiceAreaFeaturedImage | null;
  mapEmbed: string;
  breadcrumbsLinkInactive: boolean;
  sortOrder: number;
  /** Stable key for project lookups when the public slug changes. */
  projectSlug: string;
};

function resolveStaticMeta(record: ServiceAreaRecord): ServiceArea | undefined {
  return (
    staticServiceAreas.find((area) => area.slug === record.id) ??
    staticServiceAreas.find((area) => area.slug === record.slug) ??
    staticServiceAreas.find(
      (area) => area.city.toLowerCase() === record.city.toLowerCase(),
    )
  );
}

export function toPublicServiceArea(
  record: ServiceAreaRecord,
): PublicServiceArea | null {
  if (record.status !== "published") {
    return null;
  }

  if (record.hidden || record.unused) {
    return null;
  }

  if (!isTopLevelServiceArea(record) || isServiceAreaSubPage(record)) {
    return null;
  }

  const staticMeta = resolveStaticMeta(record);
  const region = staticMeta?.region ?? "Central Valley";
  const blurb =
    record.metaDescription.trim() ||
    staticMeta?.blurb ||
    `Framing contractor services for ${record.city} new builds, additions, and remodels.`;

  return {
    id: record.id,
    city: record.city,
    slug: record.slug,
    href: `/service-areas/${record.slug}`,
    blurb,
    region,
    seoTitle: record.seoTitle || record.title,
    archiveOnly: record.archiveOnly,
    content: record.content,
    featuredImage: record.featuredImage,
    mapEmbed: record.mapEmbed ?? "",
    breadcrumbsLinkInactive: record.breadcrumbsLinkInactive,
    sortOrder: record.sortOrder,
    projectSlug: staticMeta?.slug ?? record.id,
  };
}

export function getPublicServiceAreasFromStore(
  store: ServiceAreasStore = readServiceAreasStore(),
): PublicServiceArea[] {
  return store.areas
    .map(toPublicServiceArea)
    .filter((area): area is PublicServiceArea => area !== null)
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder || left.city.localeCompare(right.city),
    );
}

function getStaticPublicServiceAreas(): PublicServiceArea[] {
  return staticServiceAreas.map((area, index) => ({
    ...area,
    id: area.slug,
    seoTitle: `${area.city}, CA`,
    archiveOnly: false,
    content: "",
    featuredImage: null,
    mapEmbed: "",
    breadcrumbsLinkInactive: false,
    projectSlug: area.slug,
    sortOrder: index,
  }));
}

export function getPublicServiceAreasFallback(): PublicServiceArea[] {
  return getStaticPublicServiceAreas();
}

export function findPublicServiceAreaBySlug(
  slug: string,
  store: ServiceAreasStore = readServiceAreasStore(),
): PublicServiceArea | null {
  const published = getPublicServiceAreasFromStore(store);
  return published.find((area) => area.slug === slug) ?? null;
}

export function groupPublicServiceAreasByRegion(areas: PublicServiceArea[]) {
  return SERVICE_AREA_REGION_ORDER.map((region) => ({
    region,
    areas: areas
      .filter((area) => area.region === region && area.slug !== "bay-area")
      .sort(
        (left, right) =>
          left.sortOrder - right.sortOrder || left.city.localeCompare(right.city),
      ),
  })).filter((group) => group.areas.length > 0);
}
