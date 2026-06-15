export type ReviewListView = "all" | "published";

export type ReviewStatus = "published" | "draft";

export type ReviewSortKey = "title" | "date";
export type ReviewSortDirection = "asc" | "desc";

export type ReviewListItem = {
  id: number;
  title: string;
  reviewerName: string;
  categories: string[];
  status: ReviewStatus;
  date: Date;
  dateType: "published" | "modified";
};

export type ReviewListFilters = {
  view: ReviewListView;
  search: string;
  dateFilter: string;
  sortKey: ReviewSortKey;
  sortDirection: ReviewSortDirection;
  page: number;
  perPage: number;
};

export const REVIEW_LIST_VIEWS: { value: ReviewListView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
];

export const REVIEW_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "edit", label: "Edit" },
  { value: "trash", label: "Move to Trash" },
] as const;

export function getReviewViewCounts(reviews: ReviewListItem[]) {
  return {
    all: reviews.length,
    published: reviews.filter((review) => review.status === "published").length,
  };
}

export function getReviewDateOptions(
  reviews: ReviewListItem[],
): { value: string; label: string }[] {
  const months = new Map<string, string>();

  for (const review of reviews) {
    const value = `${review.date.getFullYear()}-${review.date.getMonth()}`;
    const label = review.date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    months.set(value, label);
  }

  return Array.from(months.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => b.value.localeCompare(a.value));
}

export function filterReviews(
  reviews: ReviewListItem[],
  filters: Omit<ReviewListFilters, "page" | "perPage" | "sortKey" | "sortDirection">,
): ReviewListItem[] {
  const query = filters.search.trim().toLowerCase();

  return reviews.filter((review) => {
    if (filters.view === "published" && review.status !== "published") {
      return false;
    }

    if (filters.dateFilter !== "all") {
      const reviewKey = `${review.date.getFullYear()}-${review.date.getMonth()}`;

      if (reviewKey !== filters.dateFilter) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    return (
      review.title.toLowerCase().includes(query) ||
      review.reviewerName.toLowerCase().includes(query) ||
      review.categories.some((category) => category.toLowerCase().includes(query)) ||
      String(review.id).includes(query)
    );
  });
}

export function sortReviews(
  reviews: ReviewListItem[],
  sortKey: ReviewSortKey,
  sortDirection: ReviewSortDirection,
): ReviewListItem[] {
  const sorted = [...reviews].sort((a, b) => {
    if (sortKey === "title") {
      return a.title.localeCompare(b.title);
    }

    return a.date.getTime() - b.date.getTime();
  });

  return sortDirection === "asc" ? sorted : sorted.reverse();
}

export function paginateReviews<T>(items: T[], page: number, perPage: number) {
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

export function formatReviewListDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours();
  const hour12 = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  return `${year}/${month}/${day} at ${hour12}:${minutes} ${ampm}`;
}
