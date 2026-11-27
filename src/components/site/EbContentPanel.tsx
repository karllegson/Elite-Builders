"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { fetchPublishedFaqsForCategoryRefAction } from "@/app/admin/(shell)/faqs/actions";
import { ServiceAreaFaqAccordion } from "@/components/site/ServiceAreaFaqAccordion";
import { ServiceAreaFaqEmpty } from "@/components/site/ServiceAreaFaqEmpty";
import { ServiceAreaMapEmbed } from "@/components/site/ServiceAreaMapEmbed";
import { ServiceAreaReviewsSection } from "@/components/site/ServiceAreaReviewsSection";
import { business } from "@/lib/site/config";
import { lazyLoadContentImages } from "@/lib/site/contentImages";
import { prepareEbHtml, splitEbBlocks, type EbBlock, type EbStat } from "@/lib/site/ebContent";
import type { PublicFaqItem } from "@/lib/site/faqsPublic";
import { getCtaButtonConfig } from "@/lib/site/runtimeSiteConfig";

type EbContentPanelProps = {
  content: string;
  mapEmbed?: string;
  /** FAQs the server already loaded, so they're in the first HTML. */
  initialFaqItems?: PublicFaqItem[];
};

const stats: EbStat[] = [
  { value: String(business.foundedYear), label: "Family-owned since" },
  { value: business.licenseNumber, label: "CSLB license" },
];

/** Renders city / service pages written in the Elite (`eb-*`) format. */
export function EbContentPanel({ content, mapEmbed = "", initialFaqItems }: EbContentPanelProps) {
  const estimateHref = useMemo(() => getCtaButtonConfig().href, []);
  const blocks = useMemo(
    () => splitEbBlocks(lazyLoadContentImages(prepareEbHtml(content, { estimateHref, stats }))),
    [content, estimateHref],
  );
  const faqCategoryRef =
    blocks.find((block): block is Extract<EbBlock, { type: "faqs" }> => block.type === "faqs")
      ?.categoryRef ?? null;
  const hasMapBlock = blocks.some((block) => block.type === "map");

  const [faqItems, setFaqItems] = useState<PublicFaqItem[] | null>(initialFaqItems ?? null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!faqCategoryRef || initialFaqItems) {
      return;
    }

    let cancelled = false;
    startTransition(async () => {
      const result = await fetchPublishedFaqsForCategoryRefAction(faqCategoryRef);
      if (!cancelled) {
        setFaqItems(result.items);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [faqCategoryRef, initialFaqItems]);

  return (
    <div className="eb-panel">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "html":
            return (
              <div
                key={index}
                className="eb-content"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            );
          case "reviews":
            return <ServiceAreaReviewsSection key={index} config={block.config} />;
          case "faqs":
            if (faqItems === null) {
              return (
                <p key={index} className="eb-loading" role="status">
                  Loading questions…
                </p>
              );
            }
            return faqItems.length === 0 ? (
              <ServiceAreaFaqEmpty key={index} />
            ) : (
              <ServiceAreaFaqAccordion key={index} items={faqItems} />
            );
          case "map":
            return <ServiceAreaMapEmbed key={index} html={mapEmbed} />;
        }
      })}

      {!hasMapBlock && mapEmbed.trim() ? <ServiceAreaMapEmbed html={mapEmbed} /> : null}
    </div>
  );
}
