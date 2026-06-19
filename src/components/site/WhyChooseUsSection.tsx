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
    <section id="why-us" className="scroll-mt-28 bg-[#eef4fb] py-12 sm:py-24">
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-site-accent sm:text-sm sm:tracking-[0.18em]">
            Why Choose Us
          </p>
          <h2 className="mt-2 text-lg font-bold leading-snug text-site-text-dark sm:mt-3 sm:text-3xl sm:leading-tight lg:text-4xl">
            Framing-First Specialists You Can Trust
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-site-text sm:mt-4 sm:text-base">
            {lede ?? "Straight answers and real craftsmanship — not sales gimmicks or the cheapest bid."}
          </p>
        </div>

        <div className="relative mx-auto mt-8 grid max-w-6xl gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {items.map(({ title, body }, index) => {
            const label = String(index + 1).padStart(2, "0");
            const isFeatured = index === 0;

            return (
              <article
                key={title}
                className={`flex flex-col rounded-lg border border-solid px-4 py-4 shadow-sm sm:rounded-xl sm:px-7 sm:py-7 ${
                  isFeatured
                    ? "border-brand-navy/25 bg-white ring-1 ring-brand-red/25 sm:col-span-2 lg:col-span-1"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`font-mono text-[10px] font-bold tracking-[0.18em] sm:text-xs sm:tracking-[0.22em] ${
                      isFeatured ? "text-brand-red" : "text-brand-blue"
                    }`}
                  >
                    {label}
                  </span>
                  <span className="h-px flex-1 bg-gray-200" aria-hidden />
                </div>
                <h3
                  className={`mt-2 font-bold leading-snug sm:mt-3 ${
                    isFeatured
                      ? "text-base text-brand-navy sm:text-lg"
                      : "text-sm text-brand-navy sm:text-[17px]"
                  }`}
                >
                  {title}
                </h3>
                <p
                  className={`mt-1 leading-relaxed text-gray-600 sm:mt-2 ${
                    isFeatured ? "text-sm sm:text-[15px]" : "text-xs sm:text-[15px]"
                  }`}
                >
                  {body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
