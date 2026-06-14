import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Phone } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import type { ServiceDetail } from "@/lib/site/scope";

export default function ServicePageTemplate({ detail }: { detail: ServiceDetail }) {
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
      <section className="bg-brand-navy py-20 text-white">
        <div className="site-container">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            <MapPin size={15} aria-hidden />
            {business.heroLocationLine}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {detail.h1}
          </h1>
          <div className="mt-5 max-w-2xl space-y-4 text-base leading-relaxed text-white/85">
            {detail.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/#estimate"
              className="rounded-full bg-brand-red px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark"
            >
              Request a Free Estimate
            </Link>
            <a
              href={business.phoneHref}
              className="flex items-center gap-2 rounded-full border border-solid border-white/40 px-6 py-3 text-sm font-bold transition-colors hover:bg-white/10"
            >
              <Phone size={18} aria-hidden />
              {business.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── Dual audience ────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="site-container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <ContentImage
              src={img.src}
              alt={img.alt}
              className="h-72 rounded-xl sm:h-80 lg:h-96"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
              priority
            />
            <div className="grid gap-6">
              <div className="rounded-xl border border-solid border-gray-200 bg-white p-7">
                <h2 className="text-xl font-bold text-brand-navy">
                  {detail.residential.heading}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {detail.residential.body}
                </p>
              </div>
              <div className="rounded-xl border border-solid border-gray-200 bg-white p-7">
                <h2 className="text-xl font-bold text-brand-navy">
                  {detail.commercial.heading}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {detail.commercial.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scope of work ────────────────────────────────────── */}
      <section className="border-y border-solid border-gray-100 bg-gray-50/60 py-20">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
              Scope of Work
            </p>
            <h2 className="mt-3 text-3xl font-bold text-site-text-dark sm:text-4xl">
              {detail.scopeHeading}
            </h2>
          </div>

          <ul className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {detail.scope.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-solid border-gray-200 bg-white p-5"
              >
                <CheckCircle2 size={20} aria-hidden className="mt-0.5 shrink-0 text-brand-sky" />
                <span className="text-sm leading-relaxed text-gray-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      {detail.faqs.length > 0 && (
        <section className="bg-white py-20">
          <div className="site-container">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
                  FAQ
                </p>
                <h2 className="mt-3 text-3xl font-bold text-site-text-dark sm:text-4xl">
                  {detail.name} Questions
                </h2>
              </div>

              <div className="mt-12 space-y-4">
                {detail.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-xl border border-solid border-gray-200 bg-white px-6 py-5 transition-colors open:border-brand-sky/60"
                  >
                    <summary className="flex items-center justify-between gap-4 font-bold text-brand-navy">
                      {faq.question}
                      <span className="text-brand-blue transition-transform group-open:rotate-90">
                        <ArrowRight size={18} aria-hidden />
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-solid border-gray-100 bg-gray-50/60 py-20">
        <div className="site-container text-center">
          <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            Ready to Start Your Project?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-500">
            Tell us about your project and we&apos;ll respond within one business day — no pressure,
            no obligation.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#estimate"
              className="rounded-full bg-brand-red px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark"
            >
              Request a Free Estimate
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-solid border-brand-navy px-7 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
            >
              View Our Projects
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
