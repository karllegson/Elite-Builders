import {
  getServiceAreaById,
  isTopLevelServiceArea,
  normalizeServiceAreaRecord,
  readServiceAreasStore,
  type ServiceAreaRecord,
} from "@/lib/admin/serviceAreasData";
import { slugifyServiceAreaPermalink } from "@/lib/admin/postSeo";

export type ServiceAreaPublicPath = {
  parentSlug: string;
  childSlug?: string;
};

export function parseServiceAreaPublicPath(pathname: string): ServiceAreaPublicPath | null {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const nestedMatch = normalized.match(/^\/service-areas\/([^/]+)\/([^/]+)$/);

  if (nestedMatch) {
    return {
      parentSlug: decodeURIComponent(nestedMatch[1]),
      childSlug: decodeURIComponent(nestedMatch[2]),
    };
  }

  const topLevelMatch = normalized.match(/^\/service-areas\/([^/]+)$/);

  if (topLevelMatch) {
    return {
      parentSlug: decodeURIComponent(topLevelMatch[1]),
    };
  }

  return null;
}

export function getServiceAreaPublicHref(
  record: Pick<ServiceAreaRecord, "slug" | "parentId">,
  areas: ServiceAreaRecord[] = readServiceAreasStore().areas,
): string {
  if (!record.parentId) {
    return `/service-areas/${record.slug}`;
  }

  const parent = areas.find((area) => area.id === record.parentId);

  if (!parent) {
    return `/service-areas/${record.slug}`;
  }

  return `/service-areas/${parent.slug}/${record.slug}`;
}

export function buildServiceAreaPermalinkUrl(
  siteDomain: string,
  slug: string,
  parentSlug?: string | null,
): string {
  const base = siteDomain.replace(/\/$/, "");
  const cleanSlug = slugifyServiceAreaPermalink(slug) || "sample-service-area";

  if (parentSlug) {
    const cleanParentSlug = slugifyServiceAreaPermalink(parentSlug) || "parent";
    return `${base}/service-areas/${cleanParentSlug}/${cleanSlug}/`;
  }

  return `${base}/service-areas/${cleanSlug}/`;
}

export function findServiceAreaByPublicPath(
  parentSlug: string,
  childSlug?: string,
): ServiceAreaRecord | null {
  const store = readServiceAreasStore();

  if (!childSlug) {
    const area = store.areas.find(
      (item) =>
        item.slug === parentSlug &&
        isTopLevelServiceArea(item) &&
        !item.unused,
    );

    return area ? normalizeServiceAreaRecord(area) : null;
  }

  const parent = store.areas.find(
    (item) =>
      item.slug === parentSlug &&
      isTopLevelServiceArea(item) &&
      !item.unused,
  );

  if (!parent) {
    return null;
  }

  const child = store.areas.find(
    (item) =>
      item.parentId === parent.id &&
      item.slug === childSlug &&
      !item.unused,
  );

  return child ? normalizeServiceAreaRecord(child) : null;
}

export function getParentSlugForServiceArea(
  parentId: string | null | undefined,
): string | null {
  if (!parentId) {
    return null;
  }

  const parent = getServiceAreaById(parentId);

  return parent?.slug ?? null;
}

export function isSlugAvailableForServiceArea(
  slug: string,
  parentId: string | null,
  excludeId?: string,
): boolean {
  const store = readServiceAreasStore();
  const normalizedSlug = slugifyServiceAreaPermalink(slug);

  return !store.areas.some((area) => {
    if (area.id === excludeId) {
      return false;
    }

    if (area.slug !== normalizedSlug) {
      return false;
    }

    if (parentId) {
      return area.parentId === parentId;
    }

    return isTopLevelServiceArea(area);
  });
}

export function createServiceAreaRecordId(
  slug: string,
  parentId: string | null,
  parentRecord?: ServiceAreaRecord | null,
): string {
  const normalizedSlug = slugifyServiceAreaPermalink(slug);

  if (!parentId) {
    return normalizedSlug;
  }

  const parent = parentRecord ?? getServiceAreaById(parentId);

  if (!parent) {
    return normalizedSlug;
  }

  return `${parent.id}__${normalizedSlug}`;
}

export function resolveServiceAreaAdminIdFromPath(pathname: string): string | null {
  const parsed = parseServiceAreaPublicPath(pathname);

  if (!parsed) {
    return null;
  }

  const record = findServiceAreaByPublicPath(parsed.parentSlug, parsed.childSlug);

  return record?.id ?? null;
}
