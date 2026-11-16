/**
 * Converts old (Level 10-era) city / service page markup into the Elite
 * format rendered by `ebContent.ts`. Used by scripts/convert-to-eb.ts.
 *
 * Handles: highlight-box summary, Quick Links block, image-card blocks,
 * site-btn buttons, [cta-btn], <hr> dividers, old section ids, the
 * bold-label "why us" list, and section order.
 */
import { EB_SECTIONS } from "@/lib/site/ebContent";

export type ConvertToEbOptions = {
  /** Adds a "Where We Work" section with [map] when the page has a map embed. */
  mapPlace?: string | null;
};

const LEGACY_ID_MAP: Record<string, string> = {
  intro: "the-basics",
  services: "our-services",
  "why-us": "the-elite-difference",
  reviews: "what-clients-say",
  faq: "questions",
  "get-started": "book-an-estimate",
};

const SECTION_ORDER: string[] = EB_SECTIONS.map((section) => section.id);

/** Finds `<div class="…className…">…</div>` blocks, matching nested divs. */
function replaceDivBlocks(
  html: string,
  className: string,
  replacer: (block: string, inner: string) => string,
): string {
  const openPattern = new RegExp(
    `<div\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`,
    "i",
  );
  let result = "";
  let rest = html;

  for (;;) {
    const open = rest.match(openPattern);
    if (!open || open.index === undefined) {
      return result + rest;
    }

    const innerStart = open.index + open[0].length;
    const tagPattern = /<div\b[^>]*>|<\/div>/gi;
    tagPattern.lastIndex = innerStart;
    let depth = 1;
    let end = -1;
    let innerEnd = -1;
    let match: RegExpExecArray | null;

    while ((match = tagPattern.exec(rest)) !== null) {
      depth += match[0].startsWith("</") ? -1 : 1;
      if (depth === 0) {
        innerEnd = match.index;
        end = match.index + match[0].length;
        break;
      }
    }

    if (end < 0) {
      return result + rest;
    }

    result += rest.slice(0, open.index) + replacer(rest.slice(open.index, end), rest.slice(innerStart, innerEnd));
    rest = rest.slice(end);
  }
}

function textOf(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function siteRelative(href: string): string {
  return href.replace(/^https?:\/\/(?:www\.)?elitebuildersco\.com(?=\/|$)/i, "") || "/";
}

function isEstimateLink(href: string, label: string): boolean {
  return /\/contact\/?$|#estimate/i.test(href) || /estimate/i.test(label);
}

function convertButton(inner: string): string {
  const anchor = inner.match(/<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/i);
  if (!anchor) {
    return "";
  }

  const href = siteRelative(anchor[1].trim());
  const label = textOf(anchor[2]);
  if (isEstimateLink(href, label)) {
    return "[estimate_button]";
  }

  return `[button href="${href}"]${label.replace(/^Explore\s+/i, "More on ")}[/button]`;
}

function convertImageCard(inner: string): string {
  const img = inner.match(/<img\b[^>]*?\/?>/i)?.[0]?.replace(/\s*\/>$/, ">") ?? "";
  let body = inner.replace(/<div\b[^>]*class=["'][^"']*image-card--image[^"']*["'][^>]*>[\s\S]*?<\/div>/i, "");
  body = body.replace(/<\/?div\b[^>]*class=["'][^"']*image-card--content[^"']*["'][^>]*>/gi, "");
  body = replaceDivBlocks(body, "site-btn", (_block, btnInner) => convertButton(btnInner));
  body = body.replace(/<\/div>\s*$/i, "");
  body = body.replace(/<h3\b[^>]*>/gi, "<h3>");

  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `  ${line}`);

  return ["<div class=\"eb-card\">", ...(img ? [`  ${img}`] : []), ...lines, "</div>"].join("\n");
}

/** Turns `<li><strong>Label</strong> – text</li>` lists into eb-tiles. */
function convertWhyList(sectionHtml: string): string {
  return sectionHtml.replace(/<ul(\s[^>]*)?>([\s\S]*?)<\/ul>/gi, (match, attrs: string | undefined, inner: string) => {
    if (attrs && /class=/.test(attrs)) {
      return match;
    }

    const items = inner.match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) ?? [];
    const allLabeled = items.length > 0 && items.every((item) => /^<li\b[^>]*>\s*<strong>/i.test(item));
    if (!allLabeled) {
      return match;
    }

    const tiles = items
      .map((item) =>
        item.replace(/(<\/strong>)\s*(?:[–—-]|&ndash;|&mdash;)\s*/i, "$1 ").trim(),
      )
      .map((item) => `  ${item}`)
      .join("\n");
    return `<ul class="eb-tiles">\n${tiles}\n</ul>`;
  });
}

/** Inserts [stats] after the section's H2 (and H3 subhead if present). */
function insertStats(sectionHtml: string): string {
  if (/\[stats\]/i.test(sectionHtml)) {
    return sectionHtml;
  }

  const head = sectionHtml.match(/^\s*<h2\b[\s\S]*?<\/h2>(\s*<h3\b[\s\S]*?<\/h3>)?/i);
  if (!head) {
    return sectionHtml;
  }

  return `${head[0]}\n\n[stats]${sectionHtml.slice(head[0].length)}`;
}

function tidy(html: string): string {
  return html
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function convertLegacyToEb(html: string, options: ConvertToEbOptions = {}): string {
  let result = html.replace(/<!--[\s\S]*?-->/g, "");

  // Summary box
  result = replaceDivBlocks(result, "highlight-box", (_block, inner) => {
    const paragraphs = inner.match(/<p\b[\s\S]*?<\/p>/gi) ?? [];
    return `<div class="eb-short">\n${paragraphs.map((p) => `  ${p.trim()}`).join("\n")}\n</div>`;
  });

  // Hand-written Quick Links block (the site builds "On This Page" itself)
  result = replaceDivBlocks(result, "quick-links", () => "");

  result = replaceDivBlocks(result, "image-card", (_block, inner) => convertImageCard(inner));
  result = replaceDivBlocks(result, "site-btn", (_block, inner) => convertButton(inner));
  result = result.replace(/\[cta[-_]btn\]|\[cta[-_]button\]/gi, "[estimate_button]");
  result = result.replace(/<hr\b[^>]*>/gi, "");
  result = result.replace(/href=["'](https?:\/\/(?:www\.)?elitebuildersco\.com[^"']*)["']/gi, (_m, href: string) => `href="${siteRelative(href)}"`);

  // Split into: preamble (before the first H2) + sections starting at each H2.
  const firstH2 = result.search(/<h2\b/i);
  const preamble = firstH2 >= 0 ? result.slice(0, firstH2) : result;
  const body = firstH2 >= 0 ? result.slice(firstH2) : "";
  const chunks = body.split(/(?=<h2\b)/i).filter((chunk) => chunk.trim());

  type Group = { id: string; html: string };
  const groups: Group[] = [];
  let processAssigned = false;

  for (const chunk of chunks) {
    const idMatch = chunk.match(/^<h2\b[^>]*\bid=["']([^"']+)["']/i);
    let id = idMatch ? (LEGACY_ID_MAP[idMatch[1]] ?? idMatch[1]) : null;
    let chunkHtml = chunk;

    if (idMatch && id) {
      chunkHtml = chunk.replace(/^<h2\b[^>]*>/i, `<h2 id="${id}">`);
    } else if (!processAssigned) {
      id = "our-process";
      processAssigned = true;
      chunkHtml = chunk.replace(/^<h2\b[^>]*>/i, `<h2 id="${id}">`);
    }

    if (id) {
      groups.push({ id, html: chunkHtml });
    } else if (groups.length > 0) {
      // Extra id-less H2s stay with the section before them.
      groups[groups.length - 1].html += `\n\n${chunkHtml}`;
    } else {
      groups.push({ id: "", html: chunkHtml });
    }
  }

  for (const group of groups) {
    if (group.id === "the-elite-difference") {
      group.html = insertStats(convertWhyList(group.html));
    }
  }

  if (options.mapPlace && !/\[map\]/i.test(result)) {
    groups.push({
      id: "where-we-work",
      html: `<h2 id="where-we-work">Serving ${options.mapPlace} And Nearby Communities</h2>\n\n<p>Elite Builders IX frames homes, additions, and commercial projects throughout ${options.mapPlace} and the surrounding area.</p>\n\n[map]`,
    });
  }

  const rank = (id: string) => {
    const index = SECTION_ORDER.indexOf(id);
    // Unknown sections go just before the closing estimate section.
    return index >= 0 ? index : SECTION_ORDER.indexOf("book-an-estimate") - 0.5;
  };
  const ordered = groups
    .map((group, index) => ({ ...group, index }))
    .sort((a, b) => rank(a.id) - rank(b.id) || a.index - b.index);

  return tidy([preamble, ...ordered.map((group) => group.html)].join("\n\n"));
}
