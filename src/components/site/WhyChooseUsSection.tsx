import { ArrowRight } from "lucide-react";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import SectionIntro from "@/components/site/SectionIntro";

type WhyChooseUsItem = {
  title: string;
  body: string;
};

type WhyChooseUsSectionProps = {
  items: readonly WhyChooseUsItem[];
  lede?: string;
};

export default function WhyChooseUsSection({ items, lede }: WhyChooseUsSectionProps) {
  return (
    <section id="why-us" className="section bg-ink relative scroll-mt-28 overflow-hidden">
      <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -left-40 top-1/3 size-[32rem] rounded-full bg-brand-blue/20 blur-3xl"
        aria-hidden
      />

      <div className="site-container relative">
        <SectionIntro
          eyebrow="Why Choose Us"
          title="Framing-first specialists you can trust"
          lede={lede ?? "Straight answers and real craftsmanship — not sales gimmicks or the cheapest bid."}
          align="left"
          tone="dark"
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-solid border-white/10 bg-white/10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ title, body }, index) => {
            const isFeatured = index === 0;
            return (
              <article
                key={title}
                className={`flex flex-col p-7 transition-colors duration-300 hover:bg-brand-ink-2 sm:p-8 ${
                  isFeatured ? "bg-brand-ink-2" : "bg-brand-ink"
                }`}
              >
                <span className="font-display text-sm font-semibold tracking-[0.16em] text-[#ff6b70]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3
                  className={`mt-6 font-display font-semibold text-white ${
                    isFeatured ? "text-xl" : "text-lg"
                  }`}
                >
                  {title}
                </h3>
                <p
                  className="mt-3 text-[0.9375rem] leading-relaxed text-white/65"
                >
                  {body}
                </p>
              </article>
            );
          })}

          <EstimateCtaLink
            href="/#estimate"
            className="group flex flex-col justify-between bg-brand-red p-7 transition-colors hover:bg-brand-red-dark sm:p-8"
          >
            <span className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
              Free Estimate
            </span>
            <span className="mt-6 flex items-end justify-between gap-4">
              <span className="font-display text-2xl font-semibold leading-tight text-white">
                Let&apos;s talk about your project
              </span>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-red transition-transform group-hover:translate-x-1">
                <ArrowRight size={18} aria-hidden />
              </span>
            </span>
          </EstimateCtaLink>
        </div>
      </div>
    </section>
  );
}
