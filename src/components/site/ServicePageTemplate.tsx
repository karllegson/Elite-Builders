import Link from "next/link";
import { ArrowRight, Building2, Check, Home, Phone } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import CtaBand from "@/components/site/CtaBand";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import PageHero from "@/components/site/PageHero";
import SectionIntro from "@/components/site/SectionIntro";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import type { ServiceDetail } from "@/lib/site/scope";

type ServiceSubPageLink = {
  label: string;
  href: string;
  slug?: string;
};

type ServicePageTemplateProps = {
  detail: ServiceDetail;
  subPages?: ServiceSubPageLink[];
  activeSubPage?: string;
};

export default function ServicePageTemplate({
  detail,
  subPages = [],
  activeSubPage,
}: ServicePageTemplateProps) {
  const img = homeImages[detail.heroImage];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: detail.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      {detail.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <PageHero
        eyebrow={business.heroLocationLine}
        title={detail.h1}
        image={img}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: detail.name },
        ]}
        lede={detail.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <EstimateCtaLink href="/#estimate" className="btn btn-primary btn-lg">
            Request a Free Estimate
            <ArrowRight size={18} aria-hidden className="btn-arrow" />
          </EstimateCtaLink>
          <a href={business.phoneHref} className="btn btn-glass btn-lg">
            <Phone size={17} aria-hidden />
            {business.phone}
          </a>
        </div>
      </PageHero>

      {/* ── Dual audience ────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ContentImage
            src={img.src}
            alt={img.alt}
            className="aspect-[4/3] rounded-3xl lg:aspect-[5/6]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={90}
          />
          <div className="grid gap-5">
            {[
              { icon: Home, ...detail.residential },
              { icon: Building2, ...detail.commercial },
            ].map(({ icon: Icon, heading, body }) => (
              <div
                key={heading}
                className="rounded-3xl border border-solid border-site-line bg-white p-7 sm:p-8"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-site-surface text-brand-navy">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold sm:text-2xl">{heading}</h2>
                <p className="mt-3 leading-relaxed text-site-text">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sub-services for this category ───────────────────── */}
      {subPages.length > 0 && (
        <section className="section bg-site-surface">
          <div className="site-container">
            <SectionIntro
              eyebrow={`${detail.name} Services`}
              title={`Explore Our ${detail.name} Sub-Services`}
            />

            <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
              {subPages.map((subPage) => {
                const isActive = activeSubPage === subPage.slug;
                return (
                  <Link
                    key={subPage.href}
                    href={subPage.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`group flex items-center justify-between gap-3 rounded-2xl border border-solid p-5 transition-all ${
                      isActive
                        ? "border-brand-ink bg-brand-ink text-white"
                        : "border-site-line bg-white hover:-translate-y-0.5 hover:border-brand-ink/30 hover:shadow-[0_16px_32px_-20px_rgba(7,21,48,0.4)]"
                    }`}
                  >
                    <span
                      className={`font-display font-semibold ${
                        isActive ? "text-white" : "text-brand-ink"
                      }`}
                    >
                      {subPage.label}
                    </span>
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isActive
                          ? "bg-brand-red text-white"
                          : "bg-site-surface text-brand-ink group-hover:bg-brand-red group-hover:text-white"
                      }`}
                    >
                      <ArrowRight size={16} aria-hidden />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured specialty (e.g. Framing) ────────────────── */}
      {detail.featured && (
        <section id="framing" className="section bg-ink relative scroll-mt-28 overflow-hidden">
          <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden />
          <div className="site-container relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow eyebrow-light">Our Specialty</p>
              <h2 className="section-title mt-4">{detail.featured.heading}</h2>
              <p className="section-lede mt-5 max-w-xl">{detail.featured.body}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {detail.featured.items.map((item) => {
                const subPage = subPages.find((page) => page.label === item);
                const content = (
                  <>
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-red">
                      <Check size={13} strokeWidth={3} aria-hidden className="text-white" />
                    </span>
                    <span className="font-display font-semibold leading-snug text-white">{item}</span>
                  </>
                );

                if (subPage) {
                  return (
                    <li key={item}>
                      <Link
                        href={subPage.href}
                        className="flex h-full items-start gap-3 rounded-2xl border border-solid border-white/10 bg-white/5 p-5 transition-colors hover:border-white/25 hover:bg-white/10"
                      >
                        {content}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-solid border-white/10 bg-white/5 p-5"
                  >
                    {content}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ── Scope of work ────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container">
          <SectionIntro eyebrow="Scope of Work" title={detail.scopeHeading} />

          <ul className="mx-auto mt-12 grid max-w-5xl gap-3 sm:mt-14 sm:grid-cols-2">
            {detail.scope.map((item) => {
              const subPage = subPages.find((page) => page.label === item);
              const content = (
                <>
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-red/10">
                    <Check size={13} strokeWidth={3} aria-hidden className="text-brand-red" />
                  </span>
                  <span className="leading-relaxed text-site-text-dark">{item}</span>
                </>
              );

              if (subPage) {
                return (
                  <li key={item}>
                    <Link
                      href={subPage.href}
                      className="flex h-full items-start gap-3 rounded-2xl border border-solid border-site-line bg-site-surface p-5 transition-all hover:border-brand-ink/30 hover:bg-white"
                    >
                      {content}
                    </Link>
                  </li>
                );
              }

              return (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-solid border-site-line bg-site-surface p-5"
                >
                  {content}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      {detail.faqs.length > 0 && (
        <section className="section bg-site-surface">
          <div className="site-container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="eyebrow">FAQ</p>
              <h2 className="section-title mt-4">{detail.name} Questions</h2>
              <p className="section-lede mt-5">
                Still have a question? Call{" "}
                <a href={business.phoneHref} className="font-semibold text-brand-ink underline-offset-4 hover:underline">
                  {business.phone}
                </a>
                .
              </p>
            </div>

            <div className="border-t border-solid border-site-line">
              {detail.faqs.map((faq) => (
                <details key={faq.question} className="faq-item group">
                  <summary>
                    {faq.question}
                    <span className="faq-icon" aria-hidden />
                  </summary>
                  <p className="faq-answer">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related services (internal links) ────────────────── */}
      {detail.relatedServices.length > 0 && (
        <section className="section-sm bg-white">
          <div className="site-container">
            <SectionIntro eyebrow="Explore More" title="Related Services" align="left" />

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {detail.relatedServices.map((related) => (
                <Link
                  key={related.href}
                  href={related.href}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-solid border-site-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-ink/30 hover:shadow-[0_16px_32px_-20px_rgba(7,21,48,0.4)]"
                >
                  <span className="font-display text-lg font-semibold text-brand-ink">
                    {related.label}
                  </span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-site-surface text-brand-ink transition-colors group-hover:bg-brand-red group-hover:text-white">
                    <ArrowRight size={16} aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
