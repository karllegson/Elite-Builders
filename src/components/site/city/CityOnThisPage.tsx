"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import { CITY_CMS_CONTENT_ID } from "@/lib/site/cityQuickLinks";
import {
  findQuickLinkTarget,
  getQuickLinksStickyTop,
  QUICK_LINK_FLASH_CLASS,
  QUICK_LINK_FLASH_MS,
  resolveQuickLinkHeading,
} from "@/lib/site/serviceAreaQuickLinks";

export type CityTocLink = { href: string; label: string };

type CityOnThisPageProps = {
  /** Quick Links from the dashboard content. */
  links: CityTocLink[];
  /** Template sections further down the page. */
  moreLinks: CityTocLink[];
  /** "rail" = sticky desktop panel with active-section highlight; "mobile" = collapsible list. */
  variant: "rail" | "mobile";
};

function resolveTarget(href: string): HTMLElement | null {
  const cms = document.getElementById(CITY_CMS_CONTENT_ID);
  const inCms = cms ? findQuickLinkTarget(cms, href) : null;
  if (inCms) {
    return resolveQuickLinkHeading(inCms);
  }
  return document.getElementById(decodeURIComponent(href.replace(/^#/, "")));
}

/** Hide the dashboard's own Quick Links block (incl. preserved WordPress markup) — this panel replaces it. */
function hideCmsQuickLinksBlock() {
  const cms = document.getElementById(CITY_CMS_CONTENT_ID);
  if (!cms) {
    return;
  }

  cms.querySelectorAll<HTMLElement>(".block-title").forEach((title) => {
    if (!/quick links/i.test(title.textContent ?? "")) {
      return;
    }
    title.setAttribute("data-city-quick-links-hidden", "");
    const body = title.nextElementSibling;
    if (body instanceof HTMLElement && body.classList.contains("block-content")) {
      body.setAttribute("data-city-quick-links-hidden", "");
    }
  });
}

const TOP_GAP = 20;

export function CityOnThisPage({ links, moreLinks, variant }: CityOnThisPageProps) {
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const [available, setAvailable] = useState<{ main: CityTocLink[]; more: CityTocLink[] }>({
    main: links,
    more: moreLinks,
  });
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Drop links whose section isn't on the page (e.g. a hidden section), then hide the old box.
  // Runs a frame later so the dashboard content has been rendered/upgraded first.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      hideCmsQuickLinksBlock();
      setAvailable({
        main: links.filter((link) => resolveTarget(link.href)),
        more: moreLinks.filter((link) => resolveTarget(link.href)),
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [links, moreLinks]);

  // Highlight the section currently under the header (desktop rail only).
  useEffect(() => {
    if (variant !== "rail") {
      return;
    }

    const all = [...available.main, ...available.more];
    let frame = 0;

    const update = () => {
      frame = 0;
      const marker = getQuickLinksStickyTop() + TOP_GAP + 24;
      let current: string | null = null;
      for (const link of all) {
        const target = resolveTarget(link.href);
        if (target && target.getBoundingClientRect().top <= marker) {
          current = link.href;
        }
      }
      setActiveHref(current);
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [available, variant]);

  const go = useCallback((event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const target = resolveTarget(href);
    if (!target) {
      return;
    }
    event.preventDefault();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = target.getBoundingClientRect().top + window.scrollY - getQuickLinksStickyTop() - TOP_GAP;
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });

    if (target.closest(`#${CITY_CMS_CONTENT_ID}`)) {
      target.classList.add(QUICK_LINK_FLASH_CLASS);
      window.setTimeout(() => target.classList.remove(QUICK_LINK_FLASH_CLASS), QUICK_LINK_FLASH_MS);
    }

    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${href}`);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }, []);

  if (available.main.length === 0 && available.more.length === 0) {
    return null;
  }

  const renderList = (items: CityTocLink[], startIndex: number) => (
    <ul className="grid gap-0.5">
      {items.map((link, index) => (
        <li key={link.href}>
          <a
            href={link.href}
            onClick={(event) => go(event, link.href)}
            aria-current={variant === "rail" && activeHref === link.href ? "location" : undefined}
            className="city-toc-link"
          >
            <span className="city-toc-num" aria-hidden>
              {String(startIndex + index + 1).padStart(2, "0")}
            </span>
            <span>{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  const body = (
    <>
      {renderList(available.main, 0)}
      {available.more.length > 0 ? (
        <>
          <p className="spec-label mt-5 !text-[0.625rem]">More on this page</p>
          <div className="mt-2">{renderList(available.more, available.main.length)}</div>
        </>
      ) : null}
    </>
  );

  if (variant === "mobile") {
    return (
      <details
        ref={detailsRef}
        className="city-toc-mobile mb-8 overflow-hidden rounded-2xl border border-solid border-site-line bg-white lg:hidden"
      >
        <summary className="flex min-h-12 items-center justify-between gap-3 px-5 font-display text-[0.9375rem] font-semibold text-brand-ink">
          On this page
          <ChevronDown size={18} aria-hidden className="city-toc-chevron transition-transform" />
        </summary>
        <nav aria-label="On this page" className="border-t border-solid border-site-line px-5 pb-5 pt-3">
          {body}
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="On this page" className="rounded-3xl border border-solid border-site-line bg-white p-6">
      <p className="spec-label">On this page</p>
      <div className="mt-4">{body}</div>
      <EstimateCtaLink
        href="/#estimate"
        trackingLocation="on_this_page"
        className="btn btn-primary btn-sm mt-6 w-full"
      >
        Get a Free Estimate
        <ArrowRight size={15} aria-hidden className="btn-arrow" />
      </EstimateCtaLink>
    </nav>
  );
}
