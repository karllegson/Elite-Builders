"use client";

import { useLayoutEffect, type RefObject } from "react";
import { initServiceAreaQuickLinksBar } from "@/lib/site/serviceAreaQuickLinksBar";

export function useServiceAreaQuickLinksBar(
  containerRef: RefObject<HTMLElement | null>,
  contentKey: string,
) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    return initServiceAreaQuickLinksBar(container, contentKey) ?? undefined;
  }, [containerRef, contentKey]);
}
