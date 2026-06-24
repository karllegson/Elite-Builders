import {
  collectQuickLinkSections,
  findQuickLinkTarget,
  getQuickLinksStickyTop,
  getSiteMainHeader,
  QUICK_LINK_FLASH_CLASS,
  QUICK_LINK_FLASH_MS,
  resolveActiveQuickLinkSection,
  resolveQuickLinkHeading,
} from "@/lib/site/serviceAreaQuickLinks";
import { prepareServiceAreaHtml } from "@/lib/site/serviceAreaContent";
import { slugifyQuickLinkId } from "@/lib/site/serviceAreaQuickLinks";

const ACTIVE_CLASS = "is-active";
const DOCK_CLASS = "site-quick-links--dock";
const VISIBLE_CLASS = "is-visible";

function shouldShowQuickLinksDock(nav: HTMLElement): boolean {
  if (!nav.isConnected) {
    return false;
  }

  const stickyTop = getQuickLinksStickyTop();
  const { bottom } = nav.getBoundingClientRect();

  return bottom < stickyTop;
}

function setActiveLinks(links: HTMLAnchorElement[], activeId: string | null) {
  links.forEach((link) => {
    const hash = link.getAttribute("href")?.replace(/^#/, "") ?? "";
    const isActive =
      activeId !== null &&
      (hash === activeId || slugifyQuickLinkId(hash) === slugifyQuickLinkId(activeId));
    link.classList.toggle(ACTIVE_CLASS, isActive);
  });
}

function flashQuickLinkTarget(target: HTMLElement, container: ParentNode) {
  const heading = resolveQuickLinkHeading(target);

  container.querySelectorAll(`.${QUICK_LINK_FLASH_CLASS}`).forEach((element) => {
    element.classList.remove(QUICK_LINK_FLASH_CLASS);
  });

  heading.classList.add(QUICK_LINK_FLASH_CLASS);
  heading.scrollIntoView({ behavior: "smooth", block: "start" });

  window.setTimeout(() => {
    heading.classList.remove(QUICK_LINK_FLASH_CLASS);
  }, QUICK_LINK_FLASH_MS);
}

function ensureQuickLinksNav(
  container: HTMLElement,
  fullContent: string,
): HTMLElement | null {
  const contentRoots = Array.from(
    container.querySelectorAll<HTMLElement>(".service-area-html-content"),
  );

  if (contentRoots.length === 0) {
    return null;
  }

  let nav = container.querySelector<HTMLElement>(".site-quick-links");
  if (nav) {
    return nav;
  }

  for (const contentRoot of contentRoots) {
    if (!/quick links/i.test(contentRoot.innerHTML)) {
      continue;
    }

    const upgraded = prepareServiceAreaHtml(contentRoot.innerHTML, fullContent);
    if (upgraded !== contentRoot.innerHTML) {
      contentRoot.innerHTML = upgraded;
    }
  }

  return container.querySelector<HTMLElement>(".site-quick-links");
}

export function initServiceAreaQuickLinksBar(
  container: HTMLElement,
  fullContent: string,
): (() => void) | null {
  document.querySelectorAll(`.site-quick-links.${DOCK_CLASS}`).forEach((element) => {
    element.remove();
  });

  const nav = ensureQuickLinksNav(container, fullContent);
  if (!nav) {
    return null;
  }

  const dock = nav.cloneNode(true) as HTMLElement;
  dock.classList.add(DOCK_CLASS);
  dock.setAttribute("aria-label", "Quick Links");
  dock.setAttribute("aria-hidden", "true");
  document.querySelector(".site")?.appendChild(dock) ?? document.body.appendChild(dock);

  const scrollScope = container.closest("main") ?? container;
  const dockLinks = Array.from(dock.querySelectorAll<HTMLAnchorElement>("a[href^='#']"));
  const sourceLinks = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a[href^='#']"));

  let stickyRaf = 0;

  const updateDockPosition = () => {
    dock.style.top = `${getQuickLinksStickyTop()}px`;
  };

  const refreshPinnedState = () => {
    updateDockPosition();
    const currentNav = container.querySelector<HTMLElement>(".site-quick-links");
    const shouldShow = currentNav ? shouldShowQuickLinksDock(currentNav) : false;
    dock.classList.toggle(VISIBLE_CLASS, shouldShow);
    dock.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    return shouldShow;
  };

  const refreshActiveSection = (isPinned: boolean) => {
    setActiveLinks(sourceLinks, null);

    const currentNav = container.querySelector<HTMLElement>(".site-quick-links");
    if (!isPinned || !currentNav) {
      setActiveLinks(dockLinks, null);
      return;
    }

    const sections = collectQuickLinkSections(scrollScope, currentNav);
    if (sections.length === 0) {
      setActiveLinks(dockLinks, null);
      return;
    }

    const activeId = resolveActiveQuickLinkSection(
      sections,
      getQuickLinksStickyTop(),
      dock.offsetHeight,
    );
    setActiveLinks(dockLinks, activeId);
  };

  const refresh = () => {
    const isPinned = refreshPinnedState();
    refreshActiveSection(isPinned);
  };

  const onScrollOrResize = () => {
    if (stickyRaf) {
      return;
    }

    stickyRaf = window.requestAnimationFrame(() => {
      stickyRaf = 0;
      refresh();
    });
  };

  const onDockClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest("a[href^='#']");
    if (!(link instanceof HTMLAnchorElement)) {
      return;
    }

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") {
      return;
    }

    const target = findQuickLinkTarget(scrollScope, hash);
    if (!target) {
      return;
    }

    event.preventDefault();
    flashQuickLinkTarget(target, scrollScope);

    if (window.history.replaceState) {
      const url = `${window.location.pathname}${window.location.search}${hash}`;
      window.history.replaceState(null, "", url);
    }

    refreshActiveSection(true);
  };

  const navObserver = new IntersectionObserver(
    () => {
      refresh();
    },
    {
      root: null,
      threshold: 0,
      rootMargin: `-${getQuickLinksStickyTop()}px 0px 0px 0px`,
    },
  );

  navObserver.observe(nav);

  const stickyObserver = new IntersectionObserver(
    () => {
      refresh();
    },
    {
      root: null,
      threshold: [0, 1],
    },
  );

  stickyObserver.observe(nav);

  const resizeObserver =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          refresh();
        })
      : null;

  const header = getSiteMainHeader();
  const adminBar = document.querySelector<HTMLElement>(".site-admin-bar");
  resizeObserver?.observe(dock);
  resizeObserver?.observe(nav);
  if (header) {
    resizeObserver?.observe(header);
  }
  if (adminBar) {
    resizeObserver?.observe(adminBar);
  }

  dock.addEventListener("click", onDockClick);
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  refresh();

  return () => {
    window.removeEventListener("scroll", onScrollOrResize);
    window.removeEventListener("resize", onScrollOrResize);
    dock.removeEventListener("click", onDockClick);
    navObserver.disconnect();
    stickyObserver.disconnect();
    resizeObserver?.disconnect();
    if (stickyRaf) {
      window.cancelAnimationFrame(stickyRaf);
    }
    dock.remove();
    setActiveLinks(sourceLinks, null);
  };
}
