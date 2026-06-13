export type TagListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
};

export const TAG_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "delete", label: "Delete" },
] as const;

export type TagSortKey = "name" | "description" | "slug" | "count";
export type TagSortDirection = "asc" | "desc";

export function createTagId(): string {
  return `tag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function slugifyTagName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createTagListItem(
  name: string,
  options: { slug?: string; description?: string } = {},
): TagListItem {
  const trimmedName = name.trim();

  return {
    id: createTagId(),
    name: trimmedName,
    slug: options.slug?.trim() || slugifyTagName(trimmedName),
    description: options.description?.trim() ?? "",
    postCount: 0,
  };
}

export function filterTags(tags: TagListItem[], search: string): TagListItem[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return tags;
  }

  return tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(query) ||
      tag.slug.toLowerCase().includes(query) ||
      tag.description.toLowerCase().includes(query),
  );
}

export function sortTags(
  tags: TagListItem[],
  sortKey: TagSortKey,
  direction: TagSortDirection,
): TagListItem[] {
  const sorted = [...tags].sort((a, b) => {
    if (sortKey === "count") {
      return a.postCount - b.postCount;
    }

    const left = a[sortKey].toLowerCase();
    const right = b[sortKey].toLowerCase();

    return left.localeCompare(right);
  });

  return direction === "asc" ? sorted : sorted.reverse();
}
