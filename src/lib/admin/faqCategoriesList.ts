import { buildCategoryOptions } from "@/lib/admin/postCategories";
import type { FaqCategory, FaqRecord } from "@/lib/admin/faqsData";
import {
  countFaqsInCategory,
  slugifyFaqCategoryName,
} from "@/lib/admin/faqsData";

export type FaqCategoryListItem = FaqCategory & {
  faqCount: number;
};

export const FAQ_CATEGORY_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "delete", label: "Delete" },
] as const;

export type FaqCategorySortKey = "name" | "description" | "slug" | "count";
export type FaqCategorySortDirection = "asc" | "desc";

export function toFaqCategoryListItem(
  category: FaqCategory,
  faqs: FaqRecord[],
): FaqCategoryListItem {
  return {
    ...category,
    faqCount: countFaqsInCategory(category.id, faqs),
  };
}

export function filterFaqCategories(
  categories: FaqCategoryListItem[],
  search: string,
): FaqCategoryListItem[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return categories;
  }

  return categories.filter(
    (category) =>
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query),
  );
}

export function sortFaqCategories(
  categories: FaqCategoryListItem[],
  sortKey: FaqCategorySortKey,
  direction: FaqCategorySortDirection,
): FaqCategoryListItem[] {
  const sorted = [...categories].sort((left, right) => {
    if (sortKey === "count") {
      return left.faqCount - right.faqCount;
    }

    const leftValue = left[sortKey].toLowerCase();
    const rightValue = right[sortKey].toLowerCase();

    return leftValue.localeCompare(rightValue);
  });

  return direction === "asc" ? sorted : sorted.reverse();
}

export function buildFaqCategoryParentOptions(categories: FaqCategory[]) {
  return buildCategoryOptions(
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      parentId: category.parentId,
    })),
  );
}

export function buildFaqCategoryEditorOptions(
  categories: FaqCategory[],
  faqs: FaqRecord[],
  tab: "all" | "most-used",
): { id: string; label: string }[] {
  const options = buildCategoryOptions(
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      parentId: category.parentId,
    })),
  );

  if (tab === "all") {
    return options;
  }

  const rankedIds = categories
    .map((category) => ({
      id: category.id,
      count: countFaqsInCategory(category.id, faqs),
    }))
    .sort((left, right) => right.count - left.count || left.id.localeCompare(right.id))
    .slice(0, 10)
    .map((item) => item.id);

  return options.filter((option) => rankedIds.includes(option.id));
}

export { slugifyFaqCategoryName };
