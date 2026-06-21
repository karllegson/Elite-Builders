import { calculateSeoScore } from "@/lib/admin/postPublish";
import type { ServiceAreaRecord, ServiceAreaStatus } from "@/lib/admin/serviceAreasData";
import {
  buildServiceAreaTree,
  collectExpandableIds,
  type NestedServiceAreaNode,
} from "@/lib/admin/serviceAreasNested";

export type ServiceAreaListView = "all" | "mine" | "published" | "draft" | "pillar";

export type ServiceAreaListItem = {
  id: string;
  numericId: number;
  title: string;
  listTitle: string;
  status: ServiceAreaStatus;
  author: string;
  isMine: boolean;
  date: Date;
  dateType: "published" | "modified";
  hasFeaturedImage: boolean;
  archiveOnly: boolean;
  seoScore: number | null;
  seoKeyword: string | null;
  seoSchema: string;
  internalLinks: number;
  externalLinks: number;
  parentId: string | null;
  isPillar: boolean;
};

export type ServiceAreaListRow = ServiceAreaListItem & {
  depth: number;
  hasChildren: boolean;
};

export type ServiceAreaListFilters = {
  view: ServiceAreaListView;
  search: string;
  dateFilter: string;
  page: number;
  perPage: number;
  currentAuthor?: string;
};

export const SERVICE_AREA_LIST_VIEWS: { value: ServiceAreaListView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pillar", label: "Pillar Content" },
];

export const SERVICE_AREA_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "edit", label: "Edit" },
  { value: "trash", label: "Move to Trash" },
] as const;

export function toServiceAreaListItem(
  area: ServiceAreaRecord,
  currentAuthor?: string,
): ServiceAreaListItem {
  const seoScore =
    area.content.trim().length > 0 || area.metaDescription.trim().length > 0
      ? calculateSeoScore({
          postTitle: area.title,
          postContent: area.content,
          seoTitle: area.seoTitle,
          permalink: area.slug,
          metaDescription: area.metaDescription,
          hasFeaturedImage: area.hasFeaturedImage,
        })
      : null;

  const internalLinks = (area.content.match(/href=["']\/(?!\/)/g) ?? []).length;
  const externalLinks = (area.content.match(/href=["']https?:\/\//g) ?? []).length;

  return {
    id: area.id,
    numericId: area.numericId,
    title: area.title,
    listTitle: area.title,
    status: area.status,
    author: area.author,
    isMine: currentAuthor ? area.author === currentAuthor : true,
    date: new Date(area.publishedAt ?? area.updatedAt),
    dateType: area.status === "published" ? "published" : "modified",
    hasFeaturedImage: area.hasFeaturedImage,
    archiveOnly: area.archiveOnly,
    seoScore,
    seoKeyword: area.seoKeyword,
    seoSchema: area.seoSchema,
    internalLinks,
    externalLinks,
    parentId: area.parentId,
    isPillar: false,
  };
}

export function getServiceAreaViewCounts(
  items: ServiceAreaListItem[],
): Record<ServiceAreaListView, number> {
  return {
    all: items.length,
    mine: items.filter((item) => item.isMine).length,
    published: items.filter((item) => item.status === "published").length,
    draft: items.filter((item) => item.status === "draft").length,
    pillar: items.filter((item) => item.isPillar).length,
  };
}

export function getServiceAreaDateOptions(
  items: ServiceAreaListItem[],
): { value: string; label: string }[] {
  const months = new Map<string, string>();

  for (const item of items) {
    const value = `${item.date.getFullYear()}-${item.date.getMonth()}`;
    const label = item.date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    months.set(value, label);
  }

  return Array.from(months.entries())
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([value, label]) => ({ value, label }));
}

export function filterServiceAreaListItems(
  items: ServiceAreaListItem[],
  filters: Pick<ServiceAreaListFilters, "view" | "search" | "dateFilter">,
): ServiceAreaListItem[] {
  const query = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.view === "mine" && !item.isMine) {
      return false;
    }

    if (filters.view === "published" && item.status !== "published") {
      return false;
    }

    if (filters.view === "draft" && item.status !== "draft") {
      return false;
    }

    if (filters.view === "pillar" && !item.isPillar) {
      return false;
    }

    if (filters.dateFilter !== "all") {
      const monthKey = `${item.date.getFullYear()}-${item.date.getMonth()}`;

      if (monthKey !== filters.dateFilter) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    return (
      item.title.toLowerCase().includes(query) ||
      item.author.toLowerCase().includes(query) ||
      String(item.numericId).includes(query)
    );
  });
}

export function paginateServiceAreaListItems<T>(
  items: T[],
  page: number,
  perPage: number,
): {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
} {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    totalItems,
    totalPages,
    currentPage,
  };
}

export function paginateServiceAreaTreeRoots(
  tree: NestedServiceAreaNode[],
  page: number,
  perPage: number,
): {
  treeSlice: NestedServiceAreaNode[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
} {
  const totalItems = tree.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * perPage;

  return {
    treeSlice: tree.slice(start, start + perPage),
    totalItems,
    totalPages,
    currentPage,
  };
}

export function getDefaultExpandedServiceAreaIds(areas: ServiceAreaRecord[]): string[] {
  return collectExpandableIds(buildServiceAreaTree(areas.filter((area) => !area.unused)));
}

export function formatServiceAreaListDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;

  return `${year}/${month}/${day} at ${hour12}:${minutes} ${ampm}`;
}

export function getSeoScoreClass(score: number | null): string {
  if (score === null) {
    return "is-na";
  }

  if (score >= 70) {
    return "is-good";
  }

  if (score >= 40) {
    return "is-ok";
  }

  return "is-bad";
}
