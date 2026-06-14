import { listAllServiceAreas, isTopLevelServiceArea } from "@/lib/admin/serviceAreasData";

export type ServiceAreaParentOption = {
  id: string;
  label: string;
};

export type ServiceAreaPageAttributes = {
  parentId: string | null;
  order: number;
};

export type ServiceAreaExtraFields = {
  mapEmbed: string;
  archiveOnly: boolean;
  breadcrumbsLinkInactive: boolean;
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

/** Existing service area pages available as parent options in Page Attributes. */
export function buildServiceAreaParentOptions(excludeId?: string): ServiceAreaParentOption[] {
  if (typeof window === "undefined") {
    return [];
  }

  return listAllServiceAreas()
    .filter((area) => !area.unused && isTopLevelServiceArea(area) && area.id !== excludeId)
    .map((area) => ({
      id: area.id,
      label: area.title,
    }));
}
