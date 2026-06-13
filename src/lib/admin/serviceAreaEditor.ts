import { serviceAreas } from "@/lib/site/config";

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
export function buildServiceAreaParentOptions(): ServiceAreaParentOption[] {
  return serviceAreas.map((area) => ({
    id: area.slug,
    label: `${area.city}, CA`,
  }));
}
