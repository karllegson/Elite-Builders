import { Plus } from "lucide-react";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import type { ClientTodo } from "@/lib/site/cityPages";

export type CityFaqItem = {
  id: string;
  question: string;
  /** Plain text or sanitized HTML from the FAQ dashboard. */
  answer: string;
  isHtml?: boolean;
  todo?: ClientTodo;
};

type CityFaqProps = {
  city: string;
  items: CityFaqItem[];
  showDrafts: boolean;
};

/** Native <details> accordion — works without JavaScript and is fully server-rendered. */
export function CityFaq({ city, items, showDrafts }: CityFaqProps) {
  const visible = items.filter((item) => !item.todo || showDrafts);

  if (visible.length === 0) {
    return null;
  }

  return (
    <section className="section bg-white" aria-labelledby="city-faq-heading">
      <div className="site-container grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <p className="spec-label">FAQ</p>
          <h2 id="city-faq-heading" className="section-title mt-4">
            {`${city} framing FAQ`}
          </h2>
          <p className="section-lede mt-5">
            Straight answers to the questions we hear most. Don&apos;t see yours? Ask us when you call.
          </p>
        </div>

        <div className="grid gap-3">
          {visible.map((item, index) => (
            <details
              key={item.id}
              className="city-faq group overflow-hidden rounded-2xl border border-solid border-site-line bg-white open:border-brand-blue/30 open:shadow-[0_20px_40px_-32px_rgba(7,21,48,0.5)]"
              open={index === 0}
            >
              <summary className="flex min-h-14 items-center justify-between gap-4 px-5 py-4 font-display text-base font-semibold text-brand-ink hover:text-brand-blue">
                <span>{item.question}</span>
                <span
                  className="city-faq-icon inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-site-surface text-brand-ink"
                  aria-hidden
                >
                  <Plus size={16} />
                </span>
              </summary>
              <div className="px-5 pb-5 text-[0.9375rem] leading-relaxed text-site-text">
                {item.todo ? (
                  <ClientTodoNote todo={item.todo} show={showDrafts} />
                ) : item.isHtml ? (
                  <div className="service-area-faq-answer" dangerouslySetInnerHTML={{ __html: item.answer }} />
                ) : (
                  <p>{item.answer}</p>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
