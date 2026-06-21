"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { fetchPublishedFaqsForCategoryRefAction } from "@/app/admin/(shell)/faqs/actions";
import { ServiceAreaFaqAccordion } from "@/components/site/ServiceAreaFaqAccordion";
import { ServiceAreaHtmlContent } from "@/components/site/ServiceAreaHtmlContent";
import { ServiceAreaMapEmbed } from "@/components/site/ServiceAreaMapEmbed";
import type { PublicFaqItem } from "@/lib/site/faqsPublic";
import { parseServiceAreaContent } from "@/lib/site/serviceAreaContent";

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
  const parsed = useMemo(() => parseServiceAreaContent(content), [content]);
  const [fetchedFaqItems, setFetchedFaqItems] = useState<PublicFaqItem[] | null>(null);
  const [, startTransition] = useTransition();

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
    <div className="service-area-content-panel">
      <ServiceAreaHtmlContent html={parsed.htmlBeforeFaqs} />

      {parsed.faqCategoryRef ? (
        isLoading ? (
          <p
            className="mt-8 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500"
            role="status"
          >
            Loading FAQs…
          </p>
        ) : faqItems.length === 0 ? (
          <p
            className="mt-8 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500"
            role="status"
          >
            No published FAQs were found for category &ldquo;{parsed.faqCategoryRef}&rdquo;.
          </p>
        ) : (
          <ServiceAreaFaqAccordion items={faqItems} />
        )
      ) : null}

      {mapEmbed.trim() ? <ServiceAreaMapEmbed html={mapEmbed} /> : null}
    </div>
  );
}
