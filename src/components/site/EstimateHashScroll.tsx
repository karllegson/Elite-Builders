"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToEstimateSection } from "@/lib/site/estimateAnchor";

export default function EstimateHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const scrollIfNeeded = (smooth: boolean) => {
      if (window.location.hash !== "#estimate") {
        return;
      }

      scrollToEstimateSection(smooth);
    };

    const onHashChange = () => scrollIfNeeded(true);

    requestAnimationFrame(() => scrollIfNeeded(false));
    const timeoutId = window.setTimeout(() => scrollIfNeeded(false), 150);
    const retryId = window.setTimeout(() => scrollIfNeeded(true), 500);

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(retryId);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [pathname]);

  return null;
}
