/**
 * Elite page format for city landing pages and service sub-pages.
 *
 * Pages written with `eb-*` markup or the Elite shortcodes render with this
 * pipeline; older pages keep using `prepareServiceAreaHtml` unchanged.
 *
 * Authoring format (what goes in the HTML editor):
 *   <div class="eb-short"><p>…</p></div>          summary box ("The Short Version")
 *   <h1>…</h1>                                   lifted into the page header band
 *   <h2 id="the-basics">…</h2> <h3>…</h3>        section heading + subhead
 *   <div class="eb-card"><img …><h3>…</h3><p>…</p>[button href="…"]…[/button]</div>
 *   <ul class="eb-tiles"><li><strong>…</strong> …</li></ul>
 *   [estimate_button] [stats] [reviews …] [faqs category="…"] [map]
 */
import { escapeHtmlAttr } from "@/lib/admin/postEditor";
import {
  parseReviewsShortcode,
  type ServiceAreaReviewsBlockConfig,
} from "@/lib/site/serviceAreaContent";

/** Standard section ids, in the recommended page order. */
export const EB_SECTIONS = [
  { id: "the-basics", label: "The Basics" },
  { id: "our-services", label: "Our Services" },
  { id: "the-elite-difference", label: "The Elite Difference" },
  { id: "what-clients-say", label: "What Clients Say" },
  { id: "our-process", label: "Our Process" },
  { id: "questions", label: "Questions" },
  { id: "where-we-work", label: "Where We Work" },
  { id: "book-an-estimate", label: "Book An Estimate" },
] as const;

export const EB_SHORT_LABEL = "The Short Version";
export const EB_JUMP_LABEL = "On This Page";
export const EB_ESTIMATE_LABEL = "Start My Estimate";

export type EbJumpLink = { href: string; label: string };

export type EbStat = { value: string; label: string };

export type EbBlock =
  | { type: "html"; html: string }
  | { type: "reviews"; config: ServiceAreaReviewsBlockConfig }
  | { type: "faqs"; categoryRef: string }
  | { type: "map" };

export type PrepareEbOptions = {
  estimateHref: string;
  stats: EbStat[];
};

const EB_MARKER_PATTERN =
  /class=["'][^"']*\beb-(?:short|card|tiles)\b|\[(?:estimate_button|stats|map)\]|\[button\s/i;
const H1_PATTERN = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i;
const H2_WITH_ID_PATTERN = /<h2\b([^>]*\bid=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/h2>/gi;
const SHORT_PATTERN = /<div\s+class=["']eb-short["']\s*>([\s\S]*?)<\/div>/gi;
const CARD_PATTERN = /<div\s+class=["']eb-card["']\s*>([\s\S]*?)<\/div>/gi;
const CARD_RUN_PATTERN = /(?:\s*<div\s+class=["']eb-card["']\s*>[\s\S]*?<\/div>)+/gi;
const BUTTON_PATTERN = /\[button\s+href\s*=\s*["']([^"']*)["']\s*\]([\s\S]*?)\[\/button\]/gi;
const ESTIMATE_PATTERN = /\[estimate_button\]|\[cta[-_]btn\]|\[cta[-_]button\]/gi;
const STATS_PATTERN = /\[stats\]/gi;
const LEFTOVER_SHORTCODE_PATTERN = /\[(?:jump_to|on_this_page|quick_links)\]/gi;
const BLOCK_SHORTCODE_PATTERN =
  /\[reviews(?:\s+[^\]]*)?\]|\[faqs\s+category\s*=\s*["']?([^"'\]]+?)["']?\s*\]|\[map\]/gi;

const ARROW_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

export function isEbContent(html: string): boolean {
  return EB_MARKER_PATTERN.test(html);
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Label shown above an H2 and in the jump list, derived from its id. */
export function ebSectionLabel(id: string): string {
  const known = EB_SECTIONS.find((section) => section.id === id);
  if (known) {
    return known.label;
  }

  return id
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Text of the first `<h1>` in the content, used as the page header title. */
export function extractEbH1(html: string): string | null {
  const match = html.match(H1_PATTERN);
  const text = match ? stripTags(match[1]) : "";
  return text || null;
}

export function buildEbJumpLinks(html: string): EbJumpLink[] {
  const links: EbJumpLink[] = [];
  for (const match of html.matchAll(H2_WITH_ID_PATTERN)) {
    const id = match[2].trim();
    if (id) {
      links.push({ href: `#${id}`, label: ebSectionLabel(id) });
    }
  }
  return links;
}

function buildButtonHtml(href: string, label: string, extraClass = ""): string {
  const className = extraClass ? `eb-btn ${extraClass}` : "eb-btn";
  return `<div class="eb-action"><a class="${className}" href="${escapeHtmlAttr(href.trim() || "/contact")}">${label.trim()}${ARROW_SVG}</a></div>`;
}

function buildCardHtml(inner: string): string {
  const imgMatch = inner.match(/<img\b[^>]*>/i);
  const media = imgMatch ? `<div class="eb-card__media">${imgMatch[0]}</div>` : "";
  const body = imgMatch ? inner.replace(imgMatch[0], "") : inner;
  return `<article class="eb-card${imgMatch ? "" : " eb-card--no-media"}">${media}<div class="eb-card__body">${body.trim()}</div></article>`;
}

function buildStatsHtml(stats: EbStat[]): string {
  if (stats.length === 0) {
    return "";
  }

  const items = stats
    .map(
      (stat) =>
        `<div class="eb-stats__item"><span class="eb-stats__value">${escapeText(stat.value)}</span><span class="eb-stats__label">${escapeText(stat.label)}</span></div>`,
    )
    .join("");
  return `<div class="eb-stats">${items}</div>`;
}

function buildMobileJumpHtml(links: EbJumpLink[]): string {
  if (links.length < 2) {
    return "";
  }

  const items = links
    .map((link) => `<li><a href="${escapeHtmlAttr(link.href)}">${escapeText(link.label)}</a></li>`)
    .join("");
  return `<details class="eb-jump-mobile"><summary>${EB_JUMP_LABEL}</summary><ol>${items}</ol></details>`;
}

/**
 * Turns authored Elite markup into the rendered page HTML. Block shortcodes
 * ([reviews], [faqs], [map]) are left in place for `splitEbBlocks`.
 */
export function prepareEbHtml(html: string, options: PrepareEbOptions): string {
  const jumpLinks = buildEbJumpLinks(html);
  let result = html.replace(/<!--[\s\S]*?-->/g, "");

  // The H1 is shown in the page header band instead.
  result = result.replace(H1_PATTERN, "");

  result = result.replace(
    SHORT_PATTERN,
    (_match, inner: string) =>
      `<aside class="eb-short" aria-label="${EB_SHORT_LABEL}"><p class="eb-short__label">${EB_SHORT_LABEL}</p><div class="eb-short__body">${inner.trim()}</div></aside>`,
  );

  // Cards first (they cannot contain nested divs), then group runs into a grid.
  result = result.replace(CARD_RUN_PATTERN, (run) => {
    const cards = Array.from(run.matchAll(CARD_PATTERN), (match) => buildCardHtml(match[1]));
    return `<div class="eb-cards">${cards.join("")}</div>`;
  });

  result = result.replace(BUTTON_PATTERN, (_match, href: string, label: string) =>
    buildButtonHtml(href, label),
  );
  result = result.replace(ESTIMATE_PATTERN, () =>
    buildButtonHtml(options.estimateHref, EB_ESTIMATE_LABEL, "eb-btn--estimate"),
  );
  result = result.replace(STATS_PATTERN, () => buildStatsHtml(options.stats));
  result = result.replace(LEFTOVER_SHORTCODE_PATTERN, "");

  let sectionIndex = 0;
  result = result.replace(H2_WITH_ID_PATTERN, (match, _attrs: string, id: string) => {
    const label = `<p class="eb-label">${escapeText(ebSectionLabel(id.trim()))}</p>`;
    const rule = sectionIndex > 0 ? `<hr class="eb-rule">` : "";
    sectionIndex += 1;
    return `${rule}${label}${match}`;
  });

  // Phone-only jump list, placed right before the second section.
  const mobileJump = buildMobileJumpHtml(jumpLinks);
  if (mobileJump) {
    const secondRule = result.indexOf(`<hr class="eb-rule">`);
    result =
      secondRule >= 0
        ? `${result.slice(0, secondRule)}${mobileJump}${result.slice(secondRule)}`
        : `${result}${mobileJump}`;
  }

  return result.trim();
}

/** Splits prepared HTML around [reviews], [faqs] and [map] so React can render those blocks. */
export function splitEbBlocks(html: string): EbBlock[] {
  const blocks: EbBlock[] = [];
  let cursor = 0;

  const pushHtml = (chunk: string) => {
    if (chunk.trim()) {
      blocks.push({ type: "html", html: chunk });
    }
  };

  for (const match of html.matchAll(BLOCK_SHORTCODE_PATTERN)) {
    const index = match.index ?? 0;
    pushHtml(html.slice(cursor, index));
    cursor = index + match[0].length;

    const token = match[0].toLowerCase();
    if (token.startsWith("[reviews")) {
      blocks.push({ type: "reviews", config: parseReviewsShortcode(match[0]) });
    } else if (token.startsWith("[faqs")) {
      blocks.push({ type: "faqs", categoryRef: (match[1] ?? "").trim() });
    } else {
      blocks.push({ type: "map" });
    }
  }

  pushHtml(html.slice(cursor));
  return blocks;
}
