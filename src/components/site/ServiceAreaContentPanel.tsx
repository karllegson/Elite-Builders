"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import { fetchPublishedFaqsForCategoryRefAction } from "@/app/admin/(shell)/faqs/actions";
import { useServiceAreaQuickLinkNavigation } from "@/hooks/useServiceAreaQuickLinkNavigation";
import { initServiceAreaQuickLinksBar } from "@/lib/site/serviceAreaQuickLinksBar";
import { ServiceAreaFaqAccordion } from "@/components/site/ServiceAreaFaqAccordion";
import { ServiceAreaFaqEmpty } from "@/components/site/ServiceAreaFaqEmpty";
import { ServiceAreaHtmlContent } from "@/components/site/ServiceAreaHtmlContent";
import { ServiceAreaMapEmbed } from "@/components/site/ServiceAreaMapEmbed";
import { ServiceAreaReviewsSection } from "@/components/site/ServiceAreaReviewsSection";
import type { PublicFaqItem } from "@/lib/site/faqsPublic";
import { getCtaButtonConfig } from "@/lib/site/runtimeSiteConfig";
import {
  parseServiceAreaContent,
  prepareServiceAreaHtml,
} from "@/lib/site/serviceAreaContent";

type ServiceAreaContentPanelProps = {
  content: string;
  mapEmbed?: string;
  faqItems?: PublicFaqItem[];
};

export function ServiceAreaContentPanel({
  content,
  mapEmbed = "",
  faqItems: initialFaqItems,
}: ServiceAreaContentPanelProps) {
  const contentPanelRef = useRef<HTMLDivElement>(null);
  const ctaButton = useMemo(() => getCtaButtonConfig(), []);
  const [fetchedFaqItems, setFetchedFaqItems] = useState<PublicFaqItem[] | null>(null);
  const [, startTransition] = useTransition();

  const preparedContent = useMemo(
    () => prepareServiceAreaHtml(content, content, { ctaButton }),
    [content, ctaButton],
  );

  const parsed = useMemo(
    () => parseServiceAreaContent(preparedContent),
    [preparedContent],
  );

  const contentRenderKey = [
    parsed.htmlBeforeReviews,
    parsed.htmlAfterReviews,
    parsed.reviewsBlock?.amount,
    parsed.reviewsBlock?.categoryRef,
    parsed.faqCategoryRef,
  ].join("|");

  useLayoutEffect(() => {
    const panel = contentPanelRef.current;
    if (!panel) {
      return;
    }

    panel.querySelectorAll(".service-area-html-content").forEach((root) => {
      const upgraded = prepareServiceAreaHtml(root.innerHTML, content, { ctaButton });
      if (upgraded !== root.innerHTML) {
        root.innerHTML = upgraded;
      }
    });

    const cleanup = initServiceAreaQuickLinksBar(panel, content);
    return () => {
      cleanup?.();
    };
  }, [content, contentRenderKey, ctaButton]);

  useServiceAreaQuickLinkNavigation(contentPanelRef, preparedContent);

  useEffect(() => {
    if (initialFaqItems !== undefined || !parsed.faqCategoryRef) {
      return;
    }

    let cancelled = false;

    startTransition(async () => {
      const result = await fetchPublishedFaqsForCategoryRefAction(parsed.faqCategoryRef!);

      if (!cancelled) {
        setFetchedFaqItems(result.items);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialFaqItems, parsed.faqCategoryRef]);

  const faqItems = initialFaqItems ?? fetchedFaqItems ?? [];
  const isLoading =
    initialFaqItems === undefined && Boolean(parsed.faqCategoryRef) && fetchedFaqItems === null;

  return (
    <div ref={contentPanelRef} className="service-area-content-panel">
      {parsed.htmlBeforeReviews ? (
        <ServiceAreaHtmlContent html={parsed.htmlBeforeReviews} skipPrepare />
      ) : null}

      {parsed.reviewsBlock ? (
        <ServiceAreaReviewsSection config={parsed.reviewsBlock} />
      ) : null}

      {parsed.htmlAfterReviews ? (
        <ServiceAreaHtmlContent html={parsed.htmlAfterReviews} skipPrepare />
      ) : null}

      {parsed.faqCategoryRef ? (
        isLoading ? (
          <p
            className="mt-8 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500"
            role="status"
          >
            Loading FAQs…
          </p>
        ) : faqItems.length === 0 ? (
          <ServiceAreaFaqEmpty />
        ) : (
          <ServiceAreaFaqAccordion items={faqItems} />
        )
      ) : null}

      {mapEmbed.trim() ? <ServiceAreaMapEmbed html={mapEmbed} /> : null}
    </div>
  );
}
