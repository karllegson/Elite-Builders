import { CardAccentBar, CardIndex } from "@/components/site/CardAccent";
import { brandPillars, brandPillarsHeading, differentiationIntro } from "@/lib/site/messaging";

export default function BrandPillars() {
  return (
    <section className="border-b border-solid border-gray-100 bg-[#f5f8fd] py-20 sm:py-24">
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
            Our Identity
          </p>
          <h2 className="mt-3 text-2xl font-bold text-site-text-dark sm:text-3xl">
            {brandPillarsHeading}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-site-text">{differentiationIntro}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {brandPillars.map(({ title, body }, index) => (
            <article
              key={title}
              className="rounded-2xl border border-solid border-gray-100 border-t-4 border-t-brand-red bg-white px-7 py-8 shadow-sm"
            >
              <CardIndex index={index} />
              <h3 className="mt-4 text-lg font-semibold text-site-text-dark">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-site-text">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
