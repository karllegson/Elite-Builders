import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Phone } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { business, serviceAreas } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { projectsForCity } from "@/lib/site/projects";
import { serviceDetails, serviceOrder } from "@/lib/site/scope";

export function generateStaticParams() {
  return serviceAreas.map((area) => ({ city: area.slug }));
}

export async function generateMetadata(
  props: PageProps<"/service-areas/[city]">
): Promise<Metadata> {
  const { city } = await props.params;
  const area = serviceAreas.find((a) => a.slug === city);
  if (!area) return {};
  return {
    title: `Framing Contractor ${area.city} CA | Elite Builders IX`,
    description: `Rough framing, remodeling, siding, and decks in ${area.city}, California. Licensed contractor ${business.license} serving the ${area.region}.`,
  };
}

export default async function ServiceAreaCityPage(
  props: PageProps<"/service-areas/[city]">
) {
  const { city } = await props.params;
  const area = serviceAreas.find((a) => a.slug === city);
  if (!area) notFound();

  const isRegional = area.city === "Bay Area";
  const cityLabel = isRegional ? area.city : `${area.city}, CA`;
  const localProjects = projectsForCity(area.slug);

  const faqs = [
    {
      question: `Does Elite Builders provide framing in ${area.city}?`,
      answer: `Yes. Elite Builders IX provides rough framing, remodeling, siding, and decks for residential and commercial projects throughout ${cityLabel} and the surrounding ${area.region}. We are a licensed California contractor (${business.license}).`,
    },
    {
      question: `Do you work with builders and general contractors in ${area.city}?`,
      answer: `Absolutely. We serve as a rough-carpentry subcontractor for production builders and general contractors in ${area.city} and across Northern California, with the manpower and resources to support multiple projects at once.`,
    },
    {
      question: `How do I get a framing estimate in ${area.city}?`,
      answer: `Request a free estimate online or call ${business.phone}. We review your plans and respond within one business day — no pressure, no obligation.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-brand-navy py-20 text-white">
        <div className="site-container">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            <MapPin size={15} aria-hidden />
            {area.region}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Framing Contractor in {cityLabel}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">{area.blurb}</p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
            From custom homes to production communities, Elite Builders IX brings framing-first
            precision and dependable scheduling to every {area.city} project.
          </p>
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

      {/* ── Services in this city ────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="site-container">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <ContentImage
              src={homeImages.residentialRoofFraming.src}
              alt={`Framing contractor services in ${cityLabel}`}
              className="h-72 rounded-xl sm:h-80 lg:h-96"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
              priority
            />
            <div>
              <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">
                Framing Services We Offer in {area.city}
              </h2>
              <ul className="mt-6 grid gap-3">
                {serviceOrder.map((slug) => {
                  const detail = serviceDetails[slug];
                  return (
                    <li key={slug}>
                      <Link
                        href={`/services/${slug}`}
                        className="group flex items-start gap-3 rounded-xl border border-solid border-gray-200 bg-white p-4 transition-all hover:border-brand-sky/60 hover:shadow-md"
                      >
                        <CheckCircle2
                          size={20}
                          aria-hidden
                          className="mt-0.5 shrink-0 text-brand-sky"
                        />
                        <span>
                          <span className="block font-bold text-brand-navy group-hover:text-brand-blue">
                            {detail.name}
                          </span>
                          <span className="mt-0.5 block text-sm text-gray-500">
                            {detail.residential.body}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Local projects (only when we have real ones) ─────── */}
      {localProjects.length > 0 && (
        <section className="border-y border-solid border-gray-100 bg-gray-50/60 py-20">
          <div className="site-container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
                Recent Work
              </p>
              <h2 className="mt-3 text-3xl font-bold text-site-text-dark sm:text-4xl">
                Projects in {area.city}
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {localProjects.map((project) => {
                const img = homeImages[project.image];
                return (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-xl border border-solid border-gray-200 bg-white"
                  >
                    <ContentImage src={img.src} alt={img.alt} className="h-48" />
                    <div className="p-6">
                      <span className="text-xs font-bold uppercase tracking-wide text-brand-sky">
                        {project.type}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-brand-navy">{project.name}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-500">{project.blurb}</p>
                      <p className="mt-3 text-xs font-semibold text-brand-blue">
                        Built for {project.builder}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="site-container">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-bold text-site-text-dark sm:text-4xl">
                Framing in {area.city} — Common Questions
              </h2>
            </div>

            <div className="mt-12 space-y-4">
              {faqs.map((faq) => (
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

            <div className="mt-12 text-center">
              <Link
                href="/service-areas"
                className="inline-flex items-center gap-2 rounded-full border border-solid border-brand-navy px-7 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
              >
                View All Service Areas
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
