/**
 * Elite page format for city landing pages and service sub-pages.
 *
 * Pages written with `eb-*` markup or the Elite shortcodes render with this
 * pipeline; older pages keep using `prepareServiceAreaHtml` unchanged.
 *
 * Authoring format (what goes in the HTML editor):
 *   <div class="eb-short"><p>…</p></div>          summary box ("The Short Version")
 *   <h1>…</h1>                                   the page's only H1, shown where it is written
 *   <hr>                                         divider line, typed before every section H2 but the first
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
const PLAIN_HR_AT_END = /<hr\s*\/?>$/i;
const SHORT_HR = `<hr class="short">`;
const SHORT_HR_PATTERN = /^\s*<hr\b[^>]*\bclass=["'][^"']*\bshort\b[^"']*["'][^>]*>/i;
/** A heading the short red bar goes under: the H1, or an H2 plus the H3 subhead right after it. */
const BAR_HEADING_PATTERN =
  /<h1\b[^>]*>[\s\S]*?<\/h1>(?:\s*<h2\b[^>]*>[\s\S]*?<\/h2>)?(?:\s*<h3\b[^>]*>[\s\S]*?<\/h3>)?|<h2\b[^>]*>[\s\S]*?<\/h2>(?:\s*<h3\b[^>]*>[\s\S]*?<\/h3>)?/gi;
/** An H1 sitting directly on top of what follows (only blank space after it). */
const H1_AT_END = /<h1\b[^>]*>[\s\S]*?<\/h1>\s*$/i;

/** A plain typed <hr> (not <hr class="short">): always a section line. */
const PLAIN_HR_PATTERN = /<hr\s*\/?>/gi;
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

  // Divider lines are typed by hand: every plain <hr> is a section line.
  result = result.replace(PLAIN_HR_PATTERN, `<hr class="eb-rule">`);

  // Section label goes above the heading stack: above the H1 when one sits right on the H2.
  const inserts: Array<{ at: number; label: string }> = [];
  for (const match of result.matchAll(H2_WITH_ID_PATTERN)) {
    inserts.push({
      at: sectionStackStart(result, match.index ?? 0),
      label: `<p class="eb-label">${escapeText(ebSectionLabel(match[2].trim()))}</p>`,
    });
  }
  for (const { at, label } of inserts.reverse()) {
    result = `${result.slice(0, at)}${label}${result.slice(at)}`;
  }

  // Phone-only jump list, placed right before the second section (and its line).
  const mobileJump = buildMobileJumpHtml(jumpLinks);
  if (mobileJump) {
    const labels = Array.from(result.matchAll(/<p class="eb-label">/g), (m) => m.index ?? 0);
    let at = labels[1] ?? -1;
    if (at >= 0) {
      const before = result.slice(0, at).replace(/\s+$/, "");
      if (before.endsWith(`<hr class="eb-rule">`)) {
        at = before.length - `<hr class="eb-rule">`.length;
      }
      result = `${result.slice(0, at)}${mobileJump}${result.slice(at)}`;
    } else {
      result = `${result}${mobileJump}`;
    }
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

/** Where a section's heading stack starts: the H1 right above the H2, if there is one. */
function sectionStackStart(html: string, h2Index: number): number {
  const before = html.slice(0, h2Index);
  const h1 = before.match(H1_AT_END);
  return h1 && h1.index !== undefined ? h1.index : h2Index;
}

/** True when a plain <hr> sits right above the section's heading stack. */
function hasRuleAbove(html: string, h2Index: number): boolean {
  const before = html.slice(0, sectionStackStart(html, h2Index)).replace(/(\s|<!--[\s\S]*?-->)*$/, "");
  return PLAIN_HR_AT_END.test(before);
}

/**
 * Section H2s (with an id) that have no typed <hr> right before them, skipping the
 * first section, which never gets a line. Returns the heading texts.
 */
export function findSectionsMissingRule(html: string): string[] {
  const missing: string[] = [];
  let index = 0;
  for (const match of html.matchAll(H2_WITH_ID_PATTERN)) {
    if (index > 0 && !hasRuleAbove(html, match.index ?? 0)) {
      missing.push(stripTags(match[3]) || match[2]);
    }
    index += 1;
  }
  return missing;
}

/** Adds a typed <hr> above every section (except the first) that doesn't have one. */
export function addMissingSectionRules(html: string): string {
  const starts: number[] = [];
  let index = 0;
  for (const match of html.matchAll(H2_WITH_ID_PATTERN)) {
    if (index > 0 && !hasRuleAbove(html, match.index ?? 0)) {
      starts.push(sectionStackStart(html, match.index ?? 0));
    }
    index += 1;
  }
  let result = html;
  for (const at of starts.reverse()) {
    result = `${result.slice(0, at)}<hr>\n\n${result.slice(at)}`;
  }
  return result;
}

/**
 * Stacks the H1 right on top of the first section heading (The Basics), with a
 * section line above the stack: Short Version, <hr>, H1 + H2, red bar.
 */
export function stackH1OnFirstSection(html: string): string {
  const firstSection = html.match(/<h2\b[^>]*\bid=["']/i);
  const h1 = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>(\s*<hr\b[^>]*\bclass=["'][^"']*\bshort\b[^"']*["'][^>]*>)?/i);
  if (!firstSection || !h1 || firstSection.index === undefined || h1.index === undefined) {
    return html;
  }
  const h1Tag = h1[0].replace(/\s*<hr\b[\s\S]*$/i, "");
  const between = html.slice(h1.index + h1[0].length, firstSection.index);
  let result = html;
  if (h1.index > firstSection.index || between.trim() !== "" || h1[1]) {
    const before = html.slice(0, h1.index).replace(/\s+$/, "");
    const after = html.slice(h1.index + h1[0].length).replace(/^\s+/, "");
    result = `${before}\n\n${after}`;
    const sectionAt = result.search(/<h2\b[^>]*\bid=["']/i);
    result = `${result.slice(0, sectionAt)}${h1Tag}\n${result.slice(sectionAt)}`;
  }
  // Section line above the stack when something (the Short Version box) comes before it.
  const stackAt = result.search(/<h1\b/i);
  const above = result.slice(0, stackAt).replace(/\s+$/, "");
  if (above && !PLAIN_HR_AT_END.test(above)) {
    result = `${above}\n\n<hr>\n\n${result.slice(stackAt)}`;
  }
  return result;
}

/** Headings (H1, H2 or H2 + H3 subhead) with no typed <hr class="short"> right after them. */
export function findHeadingsMissingBar(html: string): string[] {
  const missing: string[] = [];
  for (const match of html.matchAll(BAR_HEADING_PATTERN)) {
    const after = html.slice((match.index ?? 0) + match[0].length);
    if (!SHORT_HR_PATTERN.test(after)) {
      missing.push(stripTags(match[0].replace(/<h3\b[\s\S]*$/i, "")));
    }
  }
  return missing;
}

/** Adds <hr class="short"> after every heading that's missing its red bar. */
export function addMissingHeadingBars(html: string): string {
  return html.replace(BAR_HEADING_PATTERN, (heading: string, offset: number) => {
    const after = html.slice(offset + heading.length);
    return SHORT_HR_PATTERN.test(after) ? heading : `${heading}\n${SHORT_HR}`;
  });
}
