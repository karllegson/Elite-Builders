export const QUICK_LINK_FLASH_CLASS = "service-area-quick-link-flash";
export const QUICK_LINK_FLASH_MS = 2200;

export function slugifyQuickLinkId(value: string): string {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sortQuickLinkSectionsByDomOrder(
  sections: QuickLinkSection[],
): QuickLinkSection[] {
  return [...sections].sort((a, b) => {
    const position = a.target.compareDocumentPosition(b.target);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }

    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }

    return 0;
  });
}

export function resolveActiveQuickLinkSection(
  sections: QuickLinkSection[],
  stickyTop: number,
  dockHeight: number,
): string | null {
  const sorted = sortQuickLinkSectionsByDomOrder(sections);

  if (sorted.length === 0) {
    return null;
  }

  const marker = stickyTop + dockHeight + 8;
  let activeId: string | null = null;

  for (const section of sorted) {
    const top = section.target.getBoundingClientRect().top;

    if (top <= marker) {
      activeId = section.id;
      continue;
    }

    break;
  }

  return activeId;
}

export function findQuickLinkTarget(
  container: ParentNode,
  hash: string,
): HTMLElement | null {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) {
    return null;
  }

  const normalizedId = slugifyQuickLinkId(id);

  const byHeadingId = container.querySelector<HTMLElement>(
    `h2[id="${CSS.escape(id)}"], h3[id="${CSS.escape(id)}"]`,
  );
  if (byHeadingId) {
    return byHeadingId;
  }

  const headings = container.querySelectorAll<HTMLElement>("h2, h3");

  for (const heading of headings) {
    if (heading.id && slugifyQuickLinkId(heading.id) === normalizedId) {
      return heading;
    }

    const headingSlug = slugifyQuickLinkId(heading.textContent ?? "");
    if (headingSlug && headingSlug === normalizedId) {
      return heading;
    }
  }

  const panelSection = container.querySelector<HTMLElement>(
    `[data-quick-link-id="${CSS.escape(id)}"]`,
  );
  if (panelSection) {
    return panelSection;
  }

  const byId = container.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  if (byId && !byId.closest(".site-quick-links")) {
    return byId;
  }

  return null;
}

export function resolveQuickLinkHeading(target: HTMLElement): HTMLElement {
  if (target.matches("h2, h3")) {
    return target;
  }

  const nestedHeading = target.querySelector<HTMLElement>("h2, h3");
  return nestedHeading ?? target;
}

export function getSiteMainHeader(): HTMLElement | null {
  if (typeof window === "undefined") {
    return null;
  }

  return document.querySelector<HTMLElement>(".site > header:not(.site-admin-bar)");
}

export function getQuickLinksStickyTop(): number {
  if (typeof window === "undefined") {
    return 80;
  }

  const adminBar = document.querySelector<HTMLElement>(".site-admin-bar");
  const header = getSiteMainHeader();
  let top = 0;

  if (adminBar) {
    top += adminBar.getBoundingClientRect().height;
  }

  if (header) {
    top += header.getBoundingClientRect().height;
  }

  return top;
}

export type QuickLinkSection = {
  link: HTMLAnchorElement;
  target: HTMLElement;
  id: string;
};

export function collectQuickLinkSections(
  container: ParentNode,
  nav: HTMLElement,
): QuickLinkSection[] {
  const links = nav.querySelectorAll<HTMLAnchorElement>("a[href^='#']");
  const sections: QuickLinkSection[] = [];

  links.forEach((link) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") {
      return;
    }

    const target = findQuickLinkTarget(container, hash);
    if (!target) {
      return;
    }

    const heading = resolveQuickLinkHeading(target);
    const id =
      target.getAttribute("data-quick-link-id") ||
      (target.matches("h2, h3") ? target.id : "") ||
      heading.id ||
      hash.replace(/^#/, "");

    sections.push({ link, target, id });
  });

  return sections;
}
