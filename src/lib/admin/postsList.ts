import type { PostStatus } from "./postPublish";

export type PostListView =
  | "all"
  | "mine"
  | "published"
  | "draft"
  | "trash"
  | "pillar";

export type PostListItem = {
  id: string;
  numericId: number;
  title: string;
  status: PostStatus | "scheduled" | "trash";
  author: string;
  isMine: boolean;
  categories: string[];
  tags: string[];
  date: Date;
  dateType: "published" | "modified";
  seoKeyword: string | null;
  seoSchema: string;
  internalLinks: number;
  externalLinks: number;
  backlinks: number;
  isPillar: boolean;
};

export type PostListFilters = {
  view: PostListView;
  search: string;
  dateFilter: string;
  categoryFilter: string;
  page: number;
  perPage: number;
};

export const POST_LIST_VIEWS: { value: PostListView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "trash", label: "Trash" },
  { value: "pillar", label: "Pillar Content" },
];

export const BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "edit", label: "Edit" },
  { value: "trash", label: "Move to Trash" },
  { value: "restore", label: "Restore" },
  { value: "delete", label: "Delete Permanently" },
] as const;

export function getPostViewCounts(posts: PostListItem[]) {
  const nonTrash = posts.filter((post) => post.status !== "trash");

  return {
    all: nonTrash.length,
    mine: nonTrash.filter((post) => post.isMine).length,
    published: posts.filter(
      (post) => post.status === "published" || post.status === "scheduled",
    ).length,
    draft: posts.filter((post) => post.status === "draft").length,
    trash: posts.filter((post) => post.status === "trash").length,
    pillar: posts.filter((post) => post.isPillar).length,
  };
}

export function getPostDateOptions(posts: PostListItem[]): { value: string; label: string }[] {
  const months = new Map<string, string>();

  for (const post of posts) {
    const value = `${post.date.getFullYear()}-${post.date.getMonth()}`;
    const label = post.date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    months.set(value, label);
  }

  return Array.from(months.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => b.value.localeCompare(a.value));
}

export function getPostCategoryOptions(posts: PostListItem[]): string[] {
  const categories = new Set<string>();

  for (const post of posts) {
    for (const category of post.categories) {
      categories.add(category);
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b));
}

export function filterPosts(
  posts: PostListItem[],
  filters: Omit<PostListFilters, "page" | "perPage">,
): PostListItem[] {
  const query = filters.search.trim().toLowerCase();

  return posts.filter((post) => {
    if (filters.view === "mine" && !post.isMine) {
      return false;
    }

    if (filters.view === "published" && post.status !== "published" && post.status !== "scheduled") {
      return false;
    }

    if (filters.view === "draft" && post.status !== "draft") {
      return false;
    }

    if (filters.view === "trash" && post.status !== "trash") {
      return false;
    }

    if (filters.view === "pillar" && !post.isPillar) {
      return false;
    }

    if (filters.view !== "trash" && post.status === "trash") {
      return false;
    }

    if (filters.dateFilter !== "all") {
      const postKey = `${post.date.getFullYear()}-${post.date.getMonth()}`;

      if (postKey !== filters.dateFilter) {
        return false;
      }
    }

    if (
      filters.categoryFilter !== "all" &&
      !post.categories.includes(filters.categoryFilter)
    ) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      post.title.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query) ||
      post.categories.some((category) => category.toLowerCase().includes(query)) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      String(post.id).includes(query)
    );
  });
}

export function paginatePosts<T>(items: T[], page: number, perPage: number) {
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

export function formatPostListDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const hour12 = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  return `${year}/${month}/${day} at ${hour12}:${minutes} ${ampm}`;
}
