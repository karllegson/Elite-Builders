export type PublicReviewItem = {
  id: string;
  reviewerName: string;
  rating: number;
  excerpt: string;
  href: string;
};

export function findReviewCategoryByRef(_categoryRef: string): null {
  return null;
}

export function listPublishedReviewsForCategory(
  _categoryRef: string,
  _limit: number,
): PublicReviewItem[] {
  return [];
}
