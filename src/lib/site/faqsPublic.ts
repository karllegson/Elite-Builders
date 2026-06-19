import {
  listFaqCategories,
  listFaqs,
  slugifyFaqCategoryName,
  type FaqCategory,
  type FaqRecord,
} from "@/lib/admin/faqsData";

export type PublicFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export function findFaqCategoryByRef(categoryRef: string): FaqCategory | null {
  const trimmed = categoryRef.trim();
  const categories = listFaqCategories();
  const normalizedSlug = slugifyFaqCategoryName(trimmed);

  return (
    categories.find((category) => category.slug === trimmed) ??
    categories.find((category) => category.slug === normalizedSlug) ??
    categories.find(
      (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
    ) ??
    null
  );
}

export function listPublishedFaqsForCategory(categoryId: string): PublicFaqItem[] {
  return listFaqs()
    .filter(
      (faq) =>
        faq.status === "published" &&
        faq.visibility === "public" &&
        faq.categoryId === categoryId,
    )
    .sort(
      (left, right) =>
        left.menuOrder - right.menuOrder || left.title.localeCompare(right.title),
    )
    .map((faq) => toPublicFaqItem(faq));
}

function toPublicFaqItem(faq: FaqRecord): PublicFaqItem {
  return {
    id: faq.id,
    question: faq.title,
    answer: faq.content.trim() || "Answer coming soon.",
  };
}
