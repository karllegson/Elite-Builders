import { DEFAULT_FAQ_AUTHOR } from "@/lib/admin/faqsData";
import type { FaqCategory, FaqRecord } from "@/lib/admin/faqsData";

export type FaqListView = "all" | "mine" | "published" | "draft";

export type FaqListItem = {
  id: string;
  numericId: number;
  title: string;
  status: FaqRecord["status"];
  categoryId: string | null;
  categoryName: string | null;
  author: string;
  isMine: boolean;
  date: Date;
  dateType: "published" | "modified";
};

export type FaqListFilters = {
  view: FaqListView;
  search: string;
  categoryId: string | null;
  currentAuthor?: string;
};

export const FAQ_LIST_VIEWS: { value: FaqListView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export const FAQ_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "edit", label: "Edit" },
  { value: "trash", label: "Move to Trash" },
] as const;

export function toFaqListItem(
  faq: FaqRecord,
  categories: FaqCategory[],
  currentAuthor?: string,
): FaqListItem {
  const category = faq.categoryId
    ? categories.find((item) => item.id === faq.categoryId)
    : null;

  return {
    id: faq.id,
    numericId: faq.numericId,
    title: faq.title,
    status: faq.status,
    categoryId: faq.categoryId,
    categoryName: category?.name ?? null,
    author: faq.author,
    isMine: currentAuthor ? faq.author === currentAuthor : true,
    date: new Date(faq.publishedAt ?? faq.updatedAt),
    dateType: faq.status === "published" ? "published" : "modified",
  };
}

export function getFaqViewCounts(items: FaqListItem[]): Record<FaqListView, number> {
  return {
    all: items.length,
    mine: items.filter((item) => item.isMine).length,
    published: items.filter((item) => item.status === "published").length,
    draft: items.filter((item) => item.status === "draft").length,
  };
}

export function filterFaqListItems(
  items: FaqListItem[],
  filters: Pick<FaqListFilters, "view" | "search" | "categoryId">,
): FaqListItem[] {
  const query = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.categoryId && item.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.view === "mine" && !item.isMine) {
      return false;
    }

    if (filters.view === "published" && item.status !== "published") {
      return false;
    }

    if (filters.view === "draft" && item.status !== "draft") {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      item.title.toLowerCase().includes(query) ||
      (item.categoryName?.toLowerCase().includes(query) ?? false) ||
      String(item.numericId).includes(query)
    );
  });
}

export function paginateFaqListItems<T>(
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

export function formatFaqListDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;

  return `${year}/${month}/${day} at ${hour12}:${minutes} ${ampm}`;
}

export { DEFAULT_FAQ_AUTHOR };
