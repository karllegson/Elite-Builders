import {
  extractH2QuickLinks,
  prepareServiceAreaHtml,
  type QuickLinkItem,
} from "@/lib/site/serviceAreaContent";

/** Element id of the wrapper around the dashboard (CMS) content on city pages. */
export const CITY_CMS_CONTENT_ID = "city-cms-content";

function cleanLabel(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function anchorsIn(html: string): QuickLinkItem[] {
  const seen = new Set<string>();
  const links: QuickLinkItem[] = [];

  for (const match of html.matchAll(/<a\b[^>]*href=["'](#[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1];
    const label = cleanLabel(match[2]);
    if (label && !seen.has(href)) {
      seen.add(href);
      links.push({ href, label });
    }
  }

  return links;
}

/**
 * The Quick Links an editor set up in the dashboard content — same sources the old in-content
 * box used: the `[quick_links]` shortcode, a legacy/WordPress "Quick Links" block, or the H2s.
 */
export function extractCityQuickLinks(content: string): QuickLinkItem[] {
  const prepared = prepareServiceAreaHtml(content, content);

  const nav = prepared.match(/<nav[^>]*class=["'][^"']*site-quick-links[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i);
  if (nav) {
    const links = anchorsIn(nav[1]);
    if (links.length > 0) {
      return links;
    }
  }

  // WordPress-style block that was preserved as-is: take the anchors right after the label.
  const labelIndex = prepared.search(/Quick Links/i);
  if (labelIndex >= 0) {
    const rest = prepared.slice(labelIndex);
    const end = rest.search(/<h2\b|<hr\b/i);
    const links = anchorsIn(end > 0 ? rest.slice(0, end) : rest.slice(0, 4000));
    if (links.length >= 2) {
      return links;
    }
  }

  return extractH2QuickLinks(prepared);
}
