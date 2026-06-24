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
      className="mt-8 border-t border-solid border-gray-200 pt-8"
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
              className="overflow-hidden rounded-lg border border-solid border-gray-200 bg-gray-50"
            >
              <button
                type="button"
                className={`flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-[0.95rem] font-bold transition-colors ${
                  isOpen
                    ? "bg-brand-red text-white"
                    : "bg-transparent text-brand-red"
                }`}
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span>{item.question}</span>
                <span className="inline-flex shrink-0" aria-hidden>
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </span>
              </button>
              {isOpen ? (
                <div
                  className="service-area-faq-answer bg-white px-4 pb-4 pt-3 text-[0.92rem] leading-relaxed text-gray-600"
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
