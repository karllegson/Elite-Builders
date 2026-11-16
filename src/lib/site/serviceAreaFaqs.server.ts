import { listPublishedPublicFaqsForCategoryRef } from "@/lib/admin/faqs.server";
import type { PublicFaqItem } from "@/lib/site/faqsPublic";
import { parseServiceAreaContent } from "@/lib/site/serviceAreaContent";

/**
 * FAQs for a page's [faqs category="…"] shortcode, loaded on the server.
 * `undefined` (no shortcode, or the store can't be read) leaves loading to the browser.
 */
export async function loadFaqsForContent(content: string): Promise<PublicFaqItem[] | undefined> {
  const categoryRef = parseServiceAreaContent(content).faqCategoryRef;
  if (!categoryRef) {
    return undefined;
  }

  try {
    return await listPublishedPublicFaqsForCategoryRef(categoryRef);
  } catch {
    return undefined;
  }
}
