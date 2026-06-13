import {
  buildCategoryOptions,
  createCategoryId,
  type PostCategory,
} from "./postCategories";

export type CategoryListItem = PostCategory & {
  slug: string;
  description: string;
  icon: string | null;
  postCount: number;
};

export const CATEGORY_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "delete", label: "Delete" },
] as const;

export type CategorySortKey = "name" | "description" | "slug" | "count";
export type CategorySortDirection = "asc" | "desc";

export function slugifyCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createCategoryListItem(
  name: string,
  parentId: string | null,
  options: {
    slug?: string;
    description?: string;
    icon?: string | null;
  } = {},
): CategoryListItem {
  const trimmedName = name.trim();

  return {
    id: createCategoryId(),
    name: trimmedName,
    parentId: parentId || null,
    slug: options.slug?.trim() || slugifyCategoryName(trimmedName),
    description: options.description?.trim() ?? "",
    icon: options.icon ?? null,
    postCount: 0,
  };
}

export function filterCategories(
  categories: CategoryListItem[],
  search: string,
): CategoryListItem[] {
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

export function sortCategories(
  categories: CategoryListItem[],
  sortKey: CategorySortKey,
  direction: CategorySortDirection,
): CategoryListItem[] {
  const sorted = [...categories].sort((a, b) => {
    if (sortKey === "count") {
      return a.postCount - b.postCount;
    }

    const left = a[sortKey].toLowerCase();
    const right = b[sortKey].toLowerCase();

    return left.localeCompare(right);
  });

  return direction === "asc" ? sorted : sorted.reverse();
}

export function buildCategoryParentOptions(categories: CategoryListItem[]) {
  return buildCategoryOptions(categories);
}
