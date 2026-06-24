import { escapeHtmlAttr } from "@/lib/admin/postEditor";
import { createDefaultSiteConfigValues } from "@/lib/admin/siteConfigSettings";
import {
  getCtaButtonConfig,
  normalizeCtaButtonHref,
} from "@/lib/site/runtimeSiteConfig";

const FAQS_SHORTCODE_PATTERN =  /\[faqs\s+category\s*=\s*["']?([^"'\]]+?)["']?\s*\]/i;

const REVIEWS_SHORTCODE_PATTERN = /\[reviews(?:\s+[^\]]*)?\]/i;

const QUICK_SUMMARY_SHORTCODE_PATTERN = /\[quick_summary\]/gi;

const LEGACY_QUICK_SUMMARY_PATTERNS = [
  /(?:<hr[^>]*>\s*)?<p[^>]*>\s*(?:<(?:strong|span|em)[^>]*>)?Quick Summary(?:<\/(?:strong|span|em)>)?\s*<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>(\s*<hr[^>]*>)?/gi,
  /<p[^>]*>\s*(?:<(?:strong|span|em)[^>]*>)?Quick Summary(?:<\/(?:strong|span|em)>)?\s*(?:<br\s*\/?>\s*)+([\s\S]*?)<\/p>(\s*<hr[^>]*>)?/gi,
  /<div[^>]*class=["'][^"']*block-title[^"']*["'][^>]*>\s*Quick Summary\s*<\/div>\s*<div[^>]*class=["'][^"']*block-content[^"']*["'][^>]*>([\s\S]*?)<\/div>(\s*<hr[^>]*>)?/gi,
] as const;

const QUICK_LINKS_SHORTCODE_PATTERN = /\[quick_links\]/gi;

const CTA_BTN_SHORTCODE_PATTERN = /\[cta[-_]btn\]|\[cta[-_]button\]/gi;

const CTA_SHORTCODE_PATTERN = /\[cta\]/gi;

const ANCHOR_GROUP = "(?:\\s*(?:<br\\s*\\/?>)?\\s*<a\\b[\\s\\S]*?<\\/a>\\s*)+";

const SITE_QUICK_SUMMARY_ASIDE_PATTERN =
  /<aside\b[^>]*\bsite-quick-summary\b[^>]*>[\s\S]*?<\/aside>/i;

const HIGHLIGHT_BOX_OPEN_PATTERN =
  /<div[^>]*class=["'][^"']*\bhighlight-box\b[^"']*["'][^>]*>/gi;

const QUICK_SUMMARY_DIV_OPEN_PATTERN =
  /<div[^>]*class=["'][^"']*\bquick-summary\b[^"']*["'][^>]*>/gi;

const STYLED_SHELL_DIV_OPEN_PATTERN =
  /<div\b[^>]*style=["'][^"']*(?:border|background|padding)[^"']*["'][^>]*>/gi;

const LEGACY_QUICK_LINKS_PATTERNS = [
  /<div[^>]*class=["'][^"']*block-title[^"']*["'][^>]*>\s*Quick Links\s*<\/div>\s*<div[^>]*class=["'][^"']*block-content[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
  /<h[1-6][^>]*>\s*(?:<(?:strong|span)[^>]*>)?Quick Links(?:<\/(?:strong|span)>)?\s*<\/h[1-6]>\s*<ul[^>]*>([\s\S]*?)<\/ul>/gi,
  new RegExp(
    `<p[^>]*>\\s*(?:<(?:strong|span)[^>]*>)?Quick Links(?:<\\/(?:strong|span)>)?\\s*<\\/p>\\s*<p[^>]*>(${ANCHOR_GROUP})<\\/p>`,
    "gi",
  ),
  /<p[^>]*>\s*(?:<(?:strong|span)[^>]*>)?Quick Links(?:<\/(?:strong|span)>)?\s*<\/p>\s*<ul[^>]*>([\s\S]*?)<\/ul>/gi,
  /<p[^>]*>\s*(?:<(?:strong|span)[^>]*>)?Quick Links(?:<\/(?:strong|span)>)?\s*<\/p>\s*<ol[^>]*>([\s\S]*?)<\/ol>/gi,
  new RegExp(
    `<p[^>]*>\\s*(?:<(?:strong|span)[^>]*>)?Quick Links(?:<\\/(?:strong|span)>)?\\s*(?:<br\\s*\\/?>\\s*)+(${ANCHOR_GROUP})<\\/p>`,
    "gi",
  ),
  new RegExp(
    `<p[^>]*>\\s*(?:<(?:strong|span)[^>]*>)?Quick Links(?:<\\/(?:strong|span)>)?\\s*<\\/p>\\s*(${ANCHOR_GROUP})(?=\\s*(?:<hr\\b|<h[1-4]\\b|<p\\b|$))`,
    "gi",
  ),
  /<div[^>]*>\s*Quick Links\s*<\/div>\s*<(?:p|div)[^>]*>((?:\s*<a\b[\s\S]*?<\/a>\s*)+)<\/(?:p|div)>/gi,
  /<p[^>]*>\s*Quick Links\s*((?:<a\b[\s\S]*?<\/a>\s*)+)<\/p>/gi,
] as const;

export type QuickLinkItem = {
  label: string;
  href: string;
};

export type ServiceAreaCtaButtonConfig = {
  label: string;
  href: string;
};

export type ServiceAreaReviewsBlockConfig = {
  amount: number;
  categoryRef: string;
};

export type ParsedServiceAreaContent = {
  htmlBeforeReviews: string;
  htmlAfterReviews: string;
  reviewsBlock: ServiceAreaReviewsBlockConfig | null;
  faqCategoryRef: string | null;
};

function parseReviewsShortcode(shortcode: string): ServiceAreaReviewsBlockConfig {
  const amountMatch = shortcode.match(/\bamount\s*=\s*["']?(\d+)["']?/i);
  const categoryMatch =
    shortcode.match(/\bcategory\s*=\s*["']([^"']*)["']/i) ??
    shortcode.match(/\bcategory\s*=\s*([^\s\]"']+)/i);

  return {
    amount: amountMatch ? Math.max(1, Number.parseInt(amountMatch[1], 10)) : 3,
    categoryRef: categoryMatch?.[1]?.trim() ?? "",
  };
}

function extractReviewsBlock(html: string): {
  htmlBeforeReviews: string;
  htmlAfterReviews: string;
  reviewsBlock: ServiceAreaReviewsBlockConfig | null;
} {
  const match = html.match(REVIEWS_SHORTCODE_PATTERN);

  if (!match || match.index === undefined) {
    return {
      htmlBeforeReviews: html,
      htmlAfterReviews: "",
      reviewsBlock: null,
    };
  }

  return {
    htmlBeforeReviews: html.slice(0, match.index).trimEnd(),
    htmlAfterReviews: html.slice(match.index + match[0].length).trimStart(),
    reviewsBlock: parseReviewsShortcode(match[0]),
  };
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractH2QuickLinks(html: string): QuickLinkItem[] {
  const withIds: QuickLinkItem[] = [];
  const idPattern = /<h2[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;

  while ((match = idPattern.exec(html)) !== null) {
    const id = match[1].trim();
    const label = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (id && label) {
      withIds.push({ href: `#${id}`, label });
    }
  }

  if (withIds.length > 0) {
    return withIds;
  }

  const headingPattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  const fallback: QuickLinkItem[] = [];

  while ((match = headingPattern.exec(html)) !== null) {
    const label = match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const slug = slugifyHeading(label);

    if (label && slug) {
      fallback.push({ href: `#${slug}`, label });
    }
  }

  return fallback;
}

function parseLegacyQuickLinks(anchorHtml: string): QuickLinkItem[] {
  const links: QuickLinkItem[] = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorPattern.exec(anchorHtml)) !== null) {
    const attrs = match[1];
    const label = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);

    if (hrefMatch && label) {
      links.push({ href: hrefMatch[1], label });
    }
  }

  return links;
}

function findLegacyQuickLinkItems(html: string): QuickLinkItem[] {
  for (const pattern of LEGACY_QUICK_LINKS_PATTERNS) {
    const match = pattern.exec(html);
    pattern.lastIndex = 0;

    if (match?.[1]) {
      const links = parseLegacyQuickLinks(match[1]);
      if (links.length >= 2) {
        return links;
      }
    }
  }

  const labelMatch = /Quick Links/i.exec(html);
  if (!labelMatch || labelMatch.index === undefined) {
    return [];
  }

  const afterLabel = html.slice(labelMatch.index + labelMatch[0].length);
  const endMatch = afterLabel.match(/<h[1-4]\b|<nav class="site-quick-links"/i);
  const anchorWindow =
    endMatch?.index !== undefined
      ? afterLabel.slice(0, endMatch.index)
      : afterLabel.slice(0, 1200);
  const links = parseLegacyQuickLinks(anchorWindow);

  return links.length >= 2 ? links : [];
}

export function buildQuickLinksBoxHtml(links: QuickLinkItem[]): string {
  if (links.length === 0) {
    return "";
  }

  const midpoint = Math.ceil(links.length / 2);
  const left = links.slice(0, midpoint);
  const right = links.slice(midpoint);

  const renderCol = (items: QuickLinkItem[]) =>
    `<ul class="site-quick-links__col">${items
      .map(
        (item) =>
          `<li><a href="${escapeHtmlAttr(item.href)}">${escapeHtmlText(item.label)}</a></li>`,
      )
      .join("")}</ul>`;

  return `<nav class="site-quick-links" aria-label="Quick Links"><div class="site-quick-links__header">Quick Links</div><div class="site-quick-links__body">${renderCol(left)}${right.length > 0 ? renderCol(right) : ""}</div></nav>`;
}

export function buildCtaBtnHtml(config: ServiceAreaCtaButtonConfig): string {
  const defaults = createDefaultSiteConfigValues();
  const label = config.label.trim() || defaults.ctaButtonText;
  const href = normalizeCtaButtonHref(config.href || defaults.ctaButtonPage);

  return `<div class="site-btn btn-pill"><a href="${escapeHtmlAttr(href)}">${escapeHtmlText(label)}<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></a></div>`;
}

function stripOuterParagraph(html: string): string {
  const trimmed = html.trim();
  const singleParagraph = trimmed.match(/^<p[^>]*>([\s\S]*)<\/p>$/i);

  if (singleParagraph) {
    return singleParagraph[1].trim();
  }

  return trimmed;
}

export function buildQuickSummaryBoxHtml(bodyHtml: string): string {
  const body = stripOuterParagraph(bodyHtml);

  if (!body) {
    return "";
  }

  return `<aside class="site-quick-summary" aria-label="Quick Summary"><p class="site-quick-summary__title">Quick Summary</p><div class="site-quick-summary__body">${body}</div></aside>`;
}

const QUICK_SUMMARY_LABEL_PATTERN =
  /<(?:h[1-6]|p|span)\b[^>]*>\s*(?:<(?:strong|em|b|i)[^>]*>\s*)*Quick\s+Summary(?:\s*<\/(?:strong|em|b|i)\s*>\s*)*(?:<\/(?:strong|em|b|i)\s*>\s*)*\s*<\/(?:h[1-6]|p|span)>/i;

function stripQuickSummaryHeadingMarkup(html: string): string {
  return html
    .replace(/<h[1-6][^>]*>\s*Quick\s+Summary\s*<\/h[1-6]>/gi, "")
    .replace(
      /<p[^>]*>\s*(?:<(?:strong|em|b|i)[^>]*>\s*)*Quick\s+Summary(?:\s*<\/(?:strong|em|b|i)\s*>\s*)*(?:<\/(?:strong|em|b|i)\s*>\s*)*\s*<\/p>/gi,
      "",
    )
    .replace(
      /<span[^>]*>\s*(?:<(?:strong|em|b|i)[^>]*>\s*)*Quick\s+Summary(?:\s*<\/(?:strong|em|b|i)\s*>\s*)*(?:<\/(?:strong|em|b|i)\s*>\s*)*\s*<\/span>/gi,
      "",
    )
    .replace(
      /<(?:strong|em|b|i)[^>]*>\s*Quick\s+Summary\s*<\/(?:strong|em|b|i)>/gi,
      "",
    )
    .trim();
}

function containsQuickSummaryLabel(html: string): boolean {
  return QUICK_SUMMARY_LABEL_PATTERN.test(stripWrapperComments(html));
}

function isInsideDivWithClass(html: string, index: number, className: string): boolean {
  const before = html.slice(0, index);
  const openPattern = new RegExp(
    `<div[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`,
    "gi",
  );
  const opens = [...before.matchAll(openPattern)];

  if (opens.length === 0) {
    return false;
  }

  const lastOpen = opens[opens.length - 1];
  const openEnd = lastOpen.index! + lastOpen[0].length;
  const segment = html.slice(openEnd, index);
  let depth = 1;

  for (const tag of segment.match(/<\/?div\b[^>]*>/gi) ?? []) {
    if (tag.startsWith("</")) {
      depth -= 1;
    } else if (!/\/>\s*$/.test(tag)) {
      depth += 1;
    }
  }

  return depth > 0;
}

function stripWrapperComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, "").trim();
}

function stripHighlightBoxComments(html: string): string {
  return html
    .replace(/<!--\s*Start Highlight Box\s*-->\s*/gi, "")
    .replace(/\s*<!--\s*End Highlight Box\s*-->/gi, "");
}

function extractQuickSummaryAsideFromWrapperContent(inner: string): string | null {
  const stripped = stripWrapperComments(inner);
  const asideMatch = stripped.match(SITE_QUICK_SUMMARY_ASIDE_PATTERN);

  if (!asideMatch) {
    return null;
  }

  const aside = asideMatch[0];
  const remainder = stripped
    .replace(aside, "")
    .replace(/<hr[^>]*>/gi, "")
    .trim();

  return remainder ? null : aside;
}

function findBalancedDivClose(contentAfterOpen: string): number {
  const tokenPattern = /<div\b[^>]*>|<\/div>/gi;
  let depth = 1;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(contentAfterOpen)) !== null) {
    if (match[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) {
        return match.index;
      }
    } else {
      depth += 1;
    }
  }

  return -1;
}

function getDivClassList(openTag: string): string[] {
  const classMatch = openTag.match(/class=["']([^"']*)["']/i);
  if (!classMatch) {
    return [];
  }

  return classMatch[1].trim().split(/\s+/).filter(Boolean);
}

function unwrapSingleChildContainer(
  html: string,
  openPattern: RegExp,
): string {
  let result = html;
  let changed = true;

  while (changed) {
    changed = false;
    const pattern = new RegExp(openPattern.source, openPattern.flags);
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(result)) !== null) {
      const openEnd = match.index + match[0].length;
      const afterOpen = result.slice(openEnd);
      const closeIndex = findBalancedDivClose(afterOpen);

      if (closeIndex === -1) {
        continue;
      }

      const inner = afterOpen.slice(0, closeIndex).trim();
      const aside = extractQuickSummaryAsideFromWrapperContent(inner);

      if (!aside) {
        continue;
      }

      const fullEnd = openEnd + closeIndex + "</div>".length;
      result = result.slice(0, match.index) + aside + result.slice(fullEnd);
      changed = true;
      break;
    }
  }

  return result;
}

function flattenQuickSummaryShells(html: string): string {
  const shellPattern =
    /<div[^>]*(?:\bhighlight-box\b|\bquick-summary\b|style=["'][^"']*(?:border|background|padding)[^"']*["'])[^>]*>\s*(?:<!--[\s\S]*?-->\s*)*(?:<hr[^>]*>\s*)*(<aside\b[^>]*\bsite-quick-summary\b[^>]*>[\s\S]*?<\/aside>)(?:\s*<hr[^>]*>\s*)*(?:<!--[\s\S]*?-->\s*)*<\/div>/gi;

  let result = html;
  let previous = "";

  while (result !== previous) {
    previous = result;
    result = result.replace(shellPattern, "$1");
  }

  return result;
}

function unwrapQuickSummaryContainers(html: string): string {
  let result = unwrapSingleChildContainer(html, HIGHLIGHT_BOX_OPEN_PATTERN);
  result = unwrapSingleChildContainer(result, QUICK_SUMMARY_DIV_OPEN_PATTERN);
  result = unwrapSingleChildContainer(result, STYLED_SHELL_DIV_OPEN_PATTERN);
  return flattenQuickSummaryShells(result);
}

function pickQuickSummaryDividerHr(match: string, aside: string): string {
  const asideIndex = match.indexOf(aside);
  const beforeAside = match.slice(0, asideIndex);
  const afterAside = match.slice(asideIndex + aside.length);
  const trailingHrs = [...afterAside.matchAll(/<hr[^>]*>/gi)];

  if (trailingHrs.length > 0) {
    return trailingHrs[trailingHrs.length - 1][0];
  }

  const leadingHrs = [...beforeAside.matchAll(/<hr[^>]*>/gi)];

  if (leadingHrs.length > 0) {
    return leadingHrs[leadingHrs.length - 1][0];
  }

  return "";
}

const QUICK_SUMMARY_DIVIDER_PATTERN =
  /(?:<hr[^>]*>\s*)*(?:<!--[\s\S]*?-->\s*)*(<aside\b[^>]*\bsite-quick-summary\b[^>]*>[\s\S]*?<\/aside>)(?:<!--[\s\S]*?-->\s*)*(?:\s*<hr[^>]*>\s*)*(?:<!--[\s\S]*?-->\s*)*/gi;

function normalizeQuickSummaryDividers(html: string): string {
  return html.replace(QUICK_SUMMARY_DIVIDER_PATTERN, (match, aside: string) => {
    const hr = pickQuickSummaryDividerHr(match, aside);
    return hr ? `${aside}\n${hr}\n` : aside;
  });
}

function replaceHighlightBoxQuickSummaryNested(html: string): string {
  let result = html;
  let changed = true;

  while (changed) {
    changed = false;
    const pattern = new RegExp(HIGHLIGHT_BOX_OPEN_PATTERN.source, HIGHLIGHT_BOX_OPEN_PATTERN.flags);
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(result)) !== null) {
      const openEnd = match.index + match[0].length;
      const afterOpen = result.slice(openEnd);
      const closeIndex = findBalancedDivClose(afterOpen);

      if (closeIndex === -1) {
        continue;
      }

      const inner = afterOpen.slice(0, closeIndex);
      const innerTrimmed = stripWrapperComments(inner);
      const aside = extractQuickSummaryAsideFromWrapperContent(innerTrimmed);

      if (aside) {
        const fullEnd = openEnd + closeIndex + "</div>".length;
        result = result.slice(0, match.index) + aside + result.slice(fullEnd);
        changed = true;
        break;
      }

      const quickOpenMatch = innerTrimmed.match(/^<div[^>]*\bquick-summary\b[^>]*>/i);

      if (quickOpenMatch) {
        const quickContentStart = quickOpenMatch[0].length;
        const afterQuickOpen = innerTrimmed.slice(quickContentStart);
        const quickCloseIndex = findBalancedDivClose(afterQuickOpen);

        if (quickCloseIndex !== -1) {
          const afterQuickClose = innerTrimmed
            .slice(quickContentStart + quickCloseIndex + "</div>".length)
            .trim();

          if (!afterQuickClose) {
            const quickBody = afterQuickOpen.slice(0, quickCloseIndex);
            const box = buildQuickSummaryBoxHtml(stripQuickSummaryHeadingMarkup(quickBody));

            if (box) {
              const fullEnd = openEnd + closeIndex + "</div>".length;
              result = result.slice(0, match.index) + box + result.slice(fullEnd);
              changed = true;
              break;
            }
          }
        }
      }

      if (containsQuickSummaryLabel(innerTrimmed)) {
        const box = buildQuickSummaryBoxHtml(stripQuickSummaryHeadingMarkup(innerTrimmed));

        if (box) {
          const fullEnd = openEnd + closeIndex + "</div>".length;
          result = result.slice(0, match.index) + box + result.slice(fullEnd);
          changed = true;
          break;
        }
      }
    }
  }

  return result;
}

function hasBlogQuickSummaryWrapper(html: string): boolean {
  const pattern = new RegExp(QUICK_SUMMARY_DIV_OPEN_PATTERN.source, QUICK_SUMMARY_DIV_OPEN_PATTERN.flags);
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const classes = getDivClassList(match[0]);
    if (classes.includes("quick-summary")) {
      return true;
    }
  }

  return false;
}

function replaceQuickSummaryDivBlocks(
  html: string,
  replaceInner: (inner: string) => string,
): string {
  let result = html;
  let changed = true;

  while (changed) {
    changed = false;
    const pattern = new RegExp(QUICK_SUMMARY_DIV_OPEN_PATTERN.source, QUICK_SUMMARY_DIV_OPEN_PATTERN.flags);
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(result)) !== null) {
      const openEnd = match.index + match[0].length;
      const afterOpen = result.slice(openEnd);
      const closeIndex = findBalancedDivClose(afterOpen);

      if (closeIndex === -1) {
        continue;
      }

      const inner = afterOpen.slice(0, closeIndex);
      const replacement = replaceInner(inner);

      if (replacement === inner) {
        continue;
      }

      const fullEnd = openEnd + closeIndex + "</div>".length;
      result = result.slice(0, match.index) + replacement + result.slice(fullEnd);
      changed = true;
      break;
    }
  }

  return result;
}

function convertQuickSummaryDivsToSiteCard(html: string): string {
  let result = replaceHighlightBoxQuickSummaryNested(html);

  result = replaceQuickSummaryDivBlocks(result, (inner) => {
    const innerTrimmed = stripWrapperComments(inner);
    const aside = extractQuickSummaryAsideFromWrapperContent(innerTrimmed);

    if (aside) {
      return aside;
    }

    const asideOnly = innerTrimmed.match(SITE_QUICK_SUMMARY_ASIDE_PATTERN);

    if (asideOnly && asideOnly[0] === innerTrimmed) {
      return asideOnly[0];
    }

    const body = stripQuickSummaryHeadingMarkup(inner);
    const box = buildQuickSummaryBoxHtml(body);
    return box || inner;
  });

  return unwrapQuickSummaryContainers(result);
}

function normalizeQuickSummaryMarkup(html: string): string {
  if (/\bsite-quick-summary\b/.test(html) && !hasBlogQuickSummaryWrapper(html)) {
    return unwrapQuickSummaryContainers(html);
  }

  return convertQuickSummaryDivsToSiteCard(html);
}

function upgradeLegacyQuickSummary(html: string): string {
  if (/\bsite-quick-summary\b/.test(html)) {
    return html;
  }

  let result = html;

  for (const pattern of LEGACY_QUICK_SUMMARY_PATTERNS) {
    result = result.replace(pattern, (fullMatch, bodyBlock: string, trailingHr = "") => {
      const box = buildQuickSummaryBoxHtml(bodyBlock);
      return box ? `${box}${trailingHr}` : fullMatch;
    });
  }

  if (/\bsite-quick-summary\b/.test(result)) {
    return result;
  }

  const labelMatch = /Quick Summary/i.exec(result);
  if (!labelMatch || labelMatch.index === undefined) {
    return result;
  }

  if (
    isInsideDivWithClass(result, labelMatch.index, "highlight-box") ||
    isInsideDivWithClass(result, labelMatch.index, "quick-summary")
  ) {
    return result;
  }

  const afterLabel = result.slice(labelMatch.index + labelMatch[0].length);
  const endMatch = afterLabel.match(/<hr\b|<h[1-4]\b|<aside class="site-quick-summary"/i);
  const bodyWindow =
    endMatch?.index !== undefined
      ? afterLabel.slice(0, endMatch.index)
      : afterLabel.slice(0, 2000);
  const bodyMatch = bodyWindow.match(/^\s*(?:<\/p>\s*)?(?:<p[^>]*>([\s\S]*?)<\/p>|([\s\S]+))/i);

  if (!bodyMatch) {
    return result;
  }

  const bodyBlock = (bodyMatch[1] ?? bodyMatch[2] ?? "").trim();
  const box = buildQuickSummaryBoxHtml(bodyBlock);

  if (!box) {
    return result;
  }

  const blockStart = (() => {
    const hrIndex = result.lastIndexOf("<hr", labelMatch.index);
    if (hrIndex >= 0) {
      return hrIndex;
    }

    const paragraphIndex = result.lastIndexOf("<p", labelMatch.index);
    if (paragraphIndex >= 0) {
      return paragraphIndex;
    }

    return labelMatch.index;
  })();
  const blockEnd = labelMatch.index + labelMatch[0].length + bodyWindow.length;
  const trailing = result.slice(blockEnd).match(/^[\s\n]*(?:<\/p>\s*)?/);
  const blockEndExtended = blockEnd + (trailing?.[0]?.length ?? 0);
  const prefix = result.slice(blockStart, labelMatch.index);
  const hrPrefix = prefix.match(/<hr[^>]*>\s*$/i)?.[0] ?? "";

  return `${result.slice(0, blockStart)}${hrPrefix}${box}${result.slice(blockEndExtended)}`;
}

function hasWordPressQuickLinksBlock(html: string): boolean {
  return /<div[^>]*class=["'][^"']*block-title[^"']*["'][^>]*>\s*Quick Links\s*<\/div>/i.test(
    html,
  );
}

function upgradeLegacyQuickLinks(html: string): string {
  if (hasWordPressQuickLinksBlock(html)) {
    return html;
  }

  if (/\bsite-quick-links\b/.test(html)) {
    return html;
  }

  let result = html;

  for (const pattern of LEGACY_QUICK_LINKS_PATTERNS) {
    result = result.replace(pattern, (fullMatch, anchorBlock: string) => {
      const links = parseLegacyQuickLinks(anchorBlock);
      return links.length >= 2 ? buildQuickLinksBoxHtml(links) : fullMatch;
    });
  }

  const labelMatch = /Quick Links/i.exec(result);
  if (!labelMatch || labelMatch.index === undefined) {
    return result;
  }

  const afterLabel = result.slice(labelMatch.index + labelMatch[0].length);
  const endMatch = afterLabel.match(/<h[1-4]\b|<nav class="site-quick-links"/i);
  const anchorWindow =
    endMatch?.index !== undefined
      ? afterLabel.slice(0, endMatch.index)
      : afterLabel.slice(0, 1200);
  const links = parseLegacyQuickLinks(anchorWindow);

  if (links.length < 2) {
    return result;
  }

  const blockStart = (() => {
    const hrIndex = result.lastIndexOf("<hr", labelMatch.index);
    if (hrIndex >= 0) {
      return hrIndex;
    }

    const paragraphIndex = result.lastIndexOf("<p", labelMatch.index);
    if (paragraphIndex >= 0) {
      return paragraphIndex;
    }

    return labelMatch.index;
  })();
  const blockEnd = labelMatch.index + labelMatch[0].length + anchorWindow.length;
  const trailing = result.slice(blockEnd).match(/^[\s\n]*(?:<\/p>\s*)?(?:<hr[^>]*>\s*)?/);
  const blockEndExtended = blockEnd + (trailing?.[0]?.length ?? 0);

  const prefix = result.slice(blockStart, labelMatch.index);
  const hrPrefix = prefix.match(/<hr[^>]*>\s*$/i)?.[0] ?? "";
  const before = result.slice(0, blockStart);
  const after = result.slice(blockEndExtended);

  return `${before}${hrPrefix}${buildQuickLinksBoxHtml(links)}${after}`;
}

function removeLegacyQuickLinksMarkup(html: string): string {
  if (!/Quick Links/i.test(html)) {
    return html;
  }

  let result = html;

  for (const pattern of LEGACY_QUICK_LINKS_PATTERNS) {
    result = result.replace(pattern, "");
  }

  if (/\bsite-quick-links\b/.test(result)) {
    return result.replace(/<p[^>]*>\s*<\/p>/gi, "");
  }

  const labelMatch = /Quick Links/i.exec(result);
  if (!labelMatch || labelMatch.index === undefined) {
    return result;
  }

  const afterLabel = result.slice(labelMatch.index + labelMatch[0].length);
  const endMatch = afterLabel.match(/<h[1-4]\b|<nav class="site-quick-links"/i);
  const anchorWindow =
    endMatch?.index !== undefined
      ? afterLabel.slice(0, endMatch.index)
      : afterLabel.slice(0, 1200);

  if (parseLegacyQuickLinks(anchorWindow).length < 2) {
    return result;
  }

  const blockStart = (() => {
    const hrIndex = result.lastIndexOf("<hr", labelMatch.index);
    if (hrIndex >= 0) {
      return hrIndex;
    }

    const paragraphIndex = result.lastIndexOf("<p", labelMatch.index);
    if (paragraphIndex >= 0) {
      return paragraphIndex;
    }

    return labelMatch.index;
  })();
  const blockEnd = labelMatch.index + labelMatch[0].length + anchorWindow.length;
  const trailing = result.slice(blockEnd).match(/^[\s\n]*(?:<\/p>\s*)?(?:<hr[^>]*>\s*)?/);
  const blockEndExtended = blockEnd + (trailing?.[0]?.length ?? 0);

  return result.slice(0, blockStart) + result.slice(blockEndExtended);
}

function stripUnrenderedShortcodes(html: string): string {
  return html
    .replace(CTA_SHORTCODE_PATTERN, "")
    .replace(/<p[^>]*>\s*<\/p>/gi, "");
}

export type PrepareServiceAreaHtmlOptions = {
  ctaButton?: ServiceAreaCtaButtonConfig;
};

export function prepareServiceAreaHtml(
  html: string,
  fullContentForLinks = html,
  options: PrepareServiceAreaHtmlOptions = {},
): string {
  let result = normalizeQuickSummaryMarkup(html);
  result = upgradeLegacyQuickSummary(result);
  result = unwrapQuickSummaryContainers(result);
  const hasQuickLinksShortcode = /\[quick_links\]/i.test(result);
  const preserveWordPressQuickLinks = hasWordPressQuickLinksBlock(fullContentForLinks);

  if (hasQuickLinksShortcode) {
    if (preserveWordPressQuickLinks) {
      result = result.replace(QUICK_LINKS_SHORTCODE_PATTERN, "");
    } else {
      const legacyLinks = findLegacyQuickLinkItems(fullContentForLinks);
      const links =
        legacyLinks.length >= 2 ? legacyLinks : extractH2QuickLinks(fullContentForLinks);
      const box = buildQuickLinksBoxHtml(links);
      result = result.replace(QUICK_LINKS_SHORTCODE_PATTERN, box);
      result = removeLegacyQuickLinksMarkup(result);
    }
  } else if (!preserveWordPressQuickLinks) {
    result = upgradeLegacyQuickLinks(result);
  }

  if (/\[quick_summary\]/i.test(result)) {
    const summaryMatch = result.match(
      /\[quick_summary\]\s*(?:<p[^>]*>([\s\S]*?)<\/p>)?/i,
    );
    const bodyBlock = summaryMatch?.[1]?.trim() ?? "";
    const box = bodyBlock ? buildQuickSummaryBoxHtml(bodyBlock) : "";
    result = result.replace(QUICK_SUMMARY_SHORTCODE_PATTERN, box);
  }

  if (CTA_BTN_SHORTCODE_PATTERN.test(result)) {
    const ctaButton = options.ctaButton ?? getCtaButtonConfig();
    const button = buildCtaBtnHtml(ctaButton);
    result = result.replace(CTA_BTN_SHORTCODE_PATTERN, button);
  }

  return stripHighlightBoxComments(
    stripUnrenderedShortcodes(
      normalizeQuickSummaryDividers(unwrapQuickSummaryContainers(result)),
    ),
  );
}

export function parseServiceAreaContent(html: string): ParsedServiceAreaContent {
  const faqMatch = html.match(FAQS_SHORTCODE_PATTERN);
  let working = html;
  let faqCategoryRef: string | null = null;

  if (faqMatch?.index !== undefined) {
    working = html.slice(0, faqMatch.index).trimEnd();
    faqCategoryRef = faqMatch[1].trim();
  }

  const reviews = extractReviewsBlock(working);

  return {
    ...reviews,
    faqCategoryRef,
  };
}