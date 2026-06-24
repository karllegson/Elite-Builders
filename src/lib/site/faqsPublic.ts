import type { FaqCategory, FaqRecord, FaqsStore } from "@/lib/admin/faqsData";
import { slugifyFaqCategoryName } from "@/lib/admin/faqsData";

export type PublicFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export function findFaqCategoryByRefInStore(
  categoryRef: string,
  store: FaqsStore,
): FaqCategory | null {
  const trimmed = categoryRef.trim();
  const normalizedSlug = slugifyFaqCategoryName(trimmed);

  return (
    store.categories.find((category) => category.slug === trimmed) ??
    store.categories.find((category) => category.slug === normalizedSlug) ??
    store.categories.find(
      (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
    ) ??
    null
  );
}

export function listPublishedFaqsForCategoryInStore(
  categoryId: string,
  store: FaqsStore,
): PublicFaqItem[] {
  return store.faqs
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
