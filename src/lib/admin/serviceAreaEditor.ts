import {
  getServiceAreaById,
  getServiceAreaBySlug,
  isTopLevelServiceArea,
  listAllServiceAreas,
  type ServiceAreaRecord,
} from "@/lib/admin/serviceAreasData";
import {
  createDefaultPublishSettings,
  type PublishSettings,
} from "@/lib/admin/postPublish";

export type ServiceAreaParentOption = {
  id: string;
  label: string;
};

export type ServiceAreaPageAttributes = {
  parentId: string | null;
  order: number;
};

/** Dropdown value when this service area is the top-level parent page (not a sub-page). */
export const SERVICE_AREA_SELF_PARENT_OPTION = "";

export type ServiceAreaExtraFields = {
  mapEmbed: string;
  archiveOnly: boolean;
  breadcrumbsLinkInactive: boolean;
};

export type ServiceAreaFeaturedImage = {
  src: string;
  alt: string;
  title: string;
};

export function createDefaultPageAttributes(): ServiceAreaPageAttributes {
  return {
    parentId: null,
    order: 0,
  };
}

export function createDefaultExtraFields(): ServiceAreaExtraFields {
  return {
    mapEmbed: "",
    archiveOnly: false,
    breadcrumbsLinkInactive: false,
  };
}

export function serviceAreaToPublishSettings(
  record: Pick<ServiceAreaRecord, "status" | "publishedAt" | "updatedAt">,
): PublishSettings {
  const publishDate = record.publishedAt
    ? new Date(record.publishedAt)
    : new Date(record.updatedAt);

  return {
    ...createDefaultPublishSettings(publishDate),
    status: record.status === "published" ? "published" : "draft",
    publishDate,
  };
}

/** Resolve a parent reference from an id or slug to a stored service area id. */
export function resolveServiceAreaParentId(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.trim();
  const byId = getServiceAreaById(normalized);

  if (byId && !byId.unused && isTopLevelServiceArea(byId)) {
    return byId.id;
  }

  const bySlug = getServiceAreaBySlug(normalized);

  if (bySlug && !bySlug.unused && isTopLevelServiceArea(bySlug)) {
    return bySlug.id;
  }

  return null;
}

/** Existing service area pages available as parent options in Page Attributes. */
export function buildServiceAreaParentOptions(excludeId?: string): ServiceAreaParentOption[] {
  return listAllServiceAreas()
    .filter((area) => !area.unused && isTopLevelServiceArea(area) && area.id !== excludeId)
    .map((area) => ({
      id: area.id,
      label: area.title,
    }));
}
