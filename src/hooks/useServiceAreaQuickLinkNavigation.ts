"use client";

import { useEffect, type RefObject } from "react";
import {
  findQuickLinkTarget,
  QUICK_LINK_FLASH_CLASS,
  QUICK_LINK_FLASH_MS,
  resolveQuickLinkHeading,
} from "@/lib/site/serviceAreaQuickLinks";

function flashQuickLinkTarget(
  target: HTMLElement,
  container: ParentNode,
  smooth = true,
) {
  const heading = resolveQuickLinkHeading(target);

  container.querySelectorAll(`.${QUICK_LINK_FLASH_CLASS}`).forEach((element) => {
    element.classList.remove(QUICK_LINK_FLASH_CLASS);
  });

  heading.classList.add(QUICK_LINK_FLASH_CLASS);
  heading.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });

  window.setTimeout(() => {
    heading.classList.remove(QUICK_LINK_FLASH_CLASS);
  }, QUICK_LINK_FLASH_MS);
}

export function useServiceAreaQuickLinkNavigation(
  containerRef: RefObject<HTMLElement | null>,
  contentKey: string,
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const navigateToHash = (hash: string, smooth: boolean) => {
      const target = findQuickLinkTarget(container, hash);
      if (!target) {
        return false;
      }

      flashQuickLinkTarget(target, container, smooth);

      if (typeof window !== "undefined" && window.history.replaceState) {
        const url = `${window.location.pathname}${window.location.search}${hash}`;
        window.history.replaceState(null, "", url);
      }

      return true;
    };

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest(
        ".site-quick-links a[href^='#']",
      );

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const hash = link.getAttribute("href");
      if (!hash || hash === "#") {
        return;
      }

      if (!findQuickLinkTarget(container, hash)) {
        return;
      }

      event.preventDefault();
      navigateToHash(hash, true);
    };

    container.addEventListener("click", onClick);

    const initialHash = window.location.hash;
    if (initialHash) {
      requestAnimationFrame(() => {
        navigateToHash(initialHash, false);
      });
    }

    return () => {
      container.removeEventListener("click", onClick);
    };
  }, [containerRef, contentKey]);
}
