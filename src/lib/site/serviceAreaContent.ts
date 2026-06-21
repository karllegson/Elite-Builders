import { transformQuickSummaryBlocks } from "@/lib/site/postContent";

const FAQS_SHORTCODE_PATTERN =
  /\[faqs\s+category\s*=\s*["']?([^"'\]]+?)["']?\s*\]/i;

export type ParsedServiceAreaContent = {
  htmlBeforeFaqs: string;
  faqCategoryRef: string | null;
};

export function parseServiceAreaContent(html: string): ParsedServiceAreaContent {
  const normalizedHtml = transformQuickSummaryBlocks(html);
  const match = normalizedHtml.match(FAQS_SHORTCODE_PATTERN);

  if (!match || match.index === undefined) {
    return {
      htmlBeforeFaqs: normalizedHtml,
      faqCategoryRef: null,
    };
  }

  const htmlBeforeFaqs = normalizedHtml.slice(0, match.index).trimEnd();
  const faqCategoryRef = match[1].trim();

  return {
    htmlBeforeFaqs,
    faqCategoryRef,
  };
}
