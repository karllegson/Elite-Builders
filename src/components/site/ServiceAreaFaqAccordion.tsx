"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { PublicFaqItem } from "@/lib/site/faqsPublic";

type ServiceAreaFaqAccordionProps = {
  items: PublicFaqItem[];
};

export function ServiceAreaFaqAccordion({ items }: ServiceAreaFaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer.replace(/<[^>]+>/g, " "),
        },
      })),
    }),
    [items],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      data-quick-link-id="faq"
      className="mt-8 border-t border-solid border-site-line pt-8"
      aria-labelledby="service-area-faq-heading"
    >
      <h2 id="service-area-faq-heading" className="sr-only">
        FAQ
      </h2>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="grid gap-3">
        {items.map((item) => {
          const isOpen = openId === item.id;

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-solid border-site-line bg-white"
            >
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-base font-semibold transition-colors ${
                  isOpen ? "text-brand-ink" : "text-brand-ink hover:text-brand-blue"
                }`}
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span>{item.question}</span>
                <span
                  className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    isOpen ? "bg-brand-red text-white" : "bg-site-surface text-brand-ink"
                  }`}
                  aria-hidden
                >
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              {isOpen ? (
                <div
                  className="service-area-faq-answer px-5 pb-5 text-[0.9375rem] leading-relaxed text-site-text"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
