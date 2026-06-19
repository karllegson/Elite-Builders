"use client";

import { useMemo } from "react";
import { ServiceAreaFaqAccordion } from "@/components/site/ServiceAreaFaqAccordion";
import { ServiceAreaHtmlContent } from "@/components/site/ServiceAreaHtmlContent";
import { ServiceAreaMapEmbed } from "@/components/site/ServiceAreaMapEmbed";
import {
  findFaqCategoryByRef,
  listPublishedFaqsForCategory,
} from "@/lib/site/faqsPublic";
import { parseServiceAreaContent } from "@/lib/site/serviceAreaContent";

type ServiceAreaContentPanelProps = {
  content: string;
  mapEmbed: string;
};

export function ServiceAreaContentPanel({ content, mapEmbed }: ServiceAreaContentPanelProps) {
  const parsed = useMemo(() => parseServiceAreaContent(content), [content]);

  const faqItems = useMemo(() => {
    if (!parsed.faqCategoryRef) {
      return [];
    }

    const category = findFaqCategoryByRef(parsed.faqCategoryRef);

    if (!category) {
      return [];
    }

    return listPublishedFaqsForCategory(category.id);
  }, [parsed.faqCategoryRef]);

  return (
    <div className="service-area-content-panel">
      <ServiceAreaHtmlContent html={parsed.htmlBeforeFaqs} />

      {parsed.faqCategoryRef ? (
        <>
          {faqItems.length === 0 ? (
            <p
              className="mt-8 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500"
              role="status"
            >
              No published FAQs were found for category &ldquo;{parsed.faqCategoryRef}&rdquo;.
            </p>
          ) : (
            <ServiceAreaFaqAccordion items={faqItems} />
          )}
          <ServiceAreaMapEmbed html={mapEmbed} />
        </>
      ) : (
        <ServiceAreaMapEmbed html={mapEmbed} />
      )}
    </div>
  );
}
