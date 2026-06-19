const FAQS_SHORTCODE_PATTERN =
  /\[faqs\s+category\s*=\s*["']?([^"'\]]+?)["']?\s*\]/i;

export type ParsedServiceAreaContent = {
  htmlBeforeFaqs: string;
  faqCategoryRef: string | null;
};

export function parseServiceAreaContent(html: string): ParsedServiceAreaContent {
  const match = html.match(FAQS_SHORTCODE_PATTERN);

  if (!match || match.index === undefined) {
    return {
      htmlBeforeFaqs: html,
      faqCategoryRef: null,
    };
  }

  const htmlBeforeFaqs = html.slice(0, match.index).trimEnd();
  const faqCategoryRef = match[1].trim();

  return {
    htmlBeforeFaqs,
    faqCategoryRef,
  };
}
