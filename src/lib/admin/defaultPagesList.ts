import type { PageStatus } from "./pagesList";

export type DefaultPageListView =
  | "all"
  | "published"
  | "nested"
  | "pillar";

export type DefaultPageListItem = {
  id: number;
  title: string;
  depth: number;
  status: PageStatus;
  author: string;
  date: Date;
  dateType: "published" | "modified";
  seoKeyword: string | null;
  seoSchema: string;
  seoNoIndex: boolean;
  internalLinks: number;
  externalLinks: number;
  backlinks: number;
  isPillar: boolean;
};

export type DefaultPageListFilters = {
  view: DefaultPageListView;
  search: string;
  dateFilter: string;
  page: number;
  perPage: number;
};

export const DEFAULT_PAGE_LIST_VIEWS: {
  value: DefaultPageListView;
  label: string;
  showCount: boolean;
}[] = [
  { value: "all", label: "All", showCount: true },
  { value: "published", label: "Published", showCount: true },
  { value: "nested", label: "Nested View", showCount: false },
  { value: "pillar", label: "Pillar Content", showCount: true },
];

export const DEFAULT_PAGE_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "edit", label: "Edit" },
  { value: "trash", label: "Move to Trash" },
] as const;

export function getDefaultPageViewCounts(pages: DefaultPageListItem[]) {
  return {
    all: pages.length,
    published: pages.filter((page) => page.status === "published").length,
    nested: pages.length,
    pillar: pages.filter((page) => page.isPillar).length,
  };
}

export function getDefaultPageDateOptions(
  pages: DefaultPageListItem[],
): { value: string; label: string }[] {
  const months = new Map<string, string>();

  for (const page of pages) {
    const value = `${page.date.getFullYear()}-${page.date.getMonth()}`;
    const label = page.date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    months.set(value, label);
  }

  return Array.from(months.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => b.value.localeCompare(a.value));
}

export function filterDefaultPages(
  pages: DefaultPageListItem[],
  filters: Omit<DefaultPageListFilters, "page" | "perPage">,
): DefaultPageListItem[] {
  const query = filters.search.trim().toLowerCase();

  return pages.filter((page) => {
    if (filters.view === "published" && page.status !== "published") {
      return false;
    }

    if (filters.view === "pillar" && !page.isPillar) {
      return false;
    }

    if (filters.dateFilter !== "all") {
      const pageKey = `${page.date.getFullYear()}-${page.date.getMonth()}`;

      if (pageKey !== filters.dateFilter) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    return (
      page.title.toLowerCase().includes(query) ||
      page.author.toLowerCase().includes(query) ||
      String(page.id).includes(query)
    );
  });
}

export function paginateDefaultPages<T>(items: T[], page: number, perPage: number) {
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

export function formatDefaultPageListDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const hour12 = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  return `${year}/${month}/${day} at ${hour12}:${minutes} ${ampm}`;
}

export function getDefaultPageTitlePrefix(depth: number): string {
  if (depth <= 0) {
    return "";
  }

  return `${"— ".repeat(depth)}`;
}
