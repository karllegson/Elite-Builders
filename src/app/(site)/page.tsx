import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Quote,
  Star,
} from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import EstimateForm from "@/components/site/EstimateForm";
import HeroVideo from "@/components/site/HeroVideo";
import BuilderPartnersSection from "@/components/site/BuilderPartnersSection";
import BrandPillars from "@/components/site/BrandPillars";
import TeamSection from "@/components/site/TeamSection";
import {
  business,
  featuredHomeServiceAreas,
  serviceAreas,
  services,
  teamMembers,
} from "@/lib/site/config";
import { heroBullets, heroIntro, homepageFaqs, integrityStatement } from "@/lib/site/messaging";
import { homeImages, homepageGalleryImageKeys } from "@/lib/site/images";
import { completedProjects, currentProjects, type Project } from "@/lib/site/projects";

export const metadata: Metadata = {
  title: "Framing Contractor Bay Area & Northern California | Elite Builders IX",
  description:
    "Bay Area framing contractor since 2012. Framing, remodeling, and siding for residential and commercial projects across the Bay Area, Central Valley, and Southern California. CSLB #970551.",
  alternates: { canonical: business.domain },
  openGraph: {
    title: "Framing Contractor Bay Area & Northern California | Elite Builders IX",
    description:
      "Framing, remodeling, and siding for residential & commercial projects across the Bay Area and Northern California.",
    url: business.domain,
    siteName: business.name,
    type: "website",
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: "Elite Builders IX logo" }],
  },
};

const yearsInBusiness = new Date().getFullYear() - business.foundedYear;

const trustStats = [
  { value: `${yearsInBusiness}+`, label: "Years in Business" },
  { value: "350+", label: "Projects Completed" },
  { value: `${serviceAreas.length}+`, label: "Cities Served" },
  { value: "100%", label: "Licensed & Insured" },
];

const whyChooseUs = [
  {
    title: "Built On Integrity",
    body: integrityStatement,
  },
  {
    title: "Experienced Team",
    body: "Our crews live and breathe framing. Decades of combined experience means clean lines, square walls, and structures that pass inspection the first time.",
  },
  {
    title: "Licensed & Insured",
    body: "Fully licensed California contractor (CSLB #970551) with complete liability and workers' comp coverage — your project and property are protected.",
  },
  {
    title: "Quality Craftsmanship",
    body: "We don't cover up problems — we fix them. Every cut, nail, and connection is done to spec, because the frame is the backbone of the build.",
  },
  {
    title: "Reliable Scheduling",
    body: "We show up when we say we will and keep your project on the timeline. No ghosting, no excuses — just consistent progress you can see.",
  },
  {
    title: "Bay Area & Northern California",
    body: "Job sites across the Bay Area, Central Valley, and Southern California — with the crews and capacity to keep multiple projects moving.",
  },
  {
    title: "Framing-First Expertise",
    body: "Framing isn't a side service for us — it's our specialty. Remodeling, siding, and decks are built on that same structural know-how.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Free Consultation & Estimate",
    body: "We walk your project, review your plans, and give you a clear, honest estimate — no pressure, no games.",
  },
  {
    step: "02",
    title: "Plans, Permits & Scheduling",
    body: "We coordinate with your builder, architect, or city to make sure everything is permitted and ready before the first board goes up.",
  },
  {
    step: "03",
    title: "Framing & Construction",
    body: "Our crew builds fast and precise — square, plumb, and to code — keeping you updated at every milestone.",
  },
  {
    step: "04",
    title: "Inspection & Walkthrough",
    body: "We stand with you through inspection and the final walkthrough, and we don't call it done until you're satisfied.",
  },
];

// Featured real projects — full portfolio lives on /projects.
const featuredProjects: Project[] = [
  currentProjects[0], // 6060 Minarets Rd — Durkin Inc
  completedProjects[1], // Highland Ridge Condominiums — City Ventures
  completedProjects[2], // Custom Homes — Thomas James Homes
];

// Dual-audience offerings — Elite Builders serves homeowners AND production builders.
const audiences = [
  {
    title: "For Homeowners",
    body: "Custom homes, additions, remodels, decks, and siding — framed and finished with honest estimates and clear communication from start to finish.",
  },
  {
    title: "For Builders & General Contractors",
    body: "A dependable rough-carpentry subcontractor with the manpower and resources to deliver multi-plan production communities and multi-family projects on schedule.",
  },
];

// DUMMY reviews — replace with real Google reviews via the admin.
const testimonials = [
  {
    name: "Michael R.",
    city: "Livermore",
    quote:
      "Elite Builders framed our custom home and the inspector said it was some of the cleanest work he'd seen all year. On time, on budget, zero drama.",
  },
  {
    name: "Sandra T.",
    city: "Turlock",
    quote:
      "They rebuilt our deck and installed new siding. The crew showed up every day on schedule and left the site spotless. Highly recommend.",
  },
  {
    name: "David L.",
    city: "Tracy",
    quote:
      "As a GC, I've worked with a lot of framing subs. Elite Builders is the one I keep calling back — square walls, fast turnaround, no callbacks.",
  },
];

const faqs = [...homepageFaqs];

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: business.name,
  url: business.domain,
  telephone: business.phone,
  email: business.email,
  image: `${business.domain}/logo.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    postalCode: business.address.zip,
    addressCountry: "US",
  },
  foundingDate: String(business.foundedYear),
  areaServed: serviceAreas.map((area) => ({ "@type": "City", name: `${area.city}, CA` })),
  description:
    "Framing contractor serving the Bay Area, Central Valley, and Southern California — rough framing, remodeling, siding, and deck construction for residential and commercial projects.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

/** Centered section intro — light-blue eyebrow over navy heading (Arlington style) */
function SectionIntro({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold text-site-text-dark sm:text-4xl">{title}</h2>
      {lede && <p className="mt-4 text-base leading-relaxed text-site-text">{lede}</p>}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Hero with commercial video ───────────────────────── */}
      <section className="relative min-h-[75dvh] overflow-hidden bg-brand-navy">
        <HeroVideo />
        {/* Readability overlay — strong on the left, clear on the right */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-brand-navy/60 via-brand-navy/25 to-transparent"
        />

        <div className="site-container relative z-10 flex min-h-[75dvh] items-center py-10 sm:py-14">
          <div className="max-w-xl text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
            <p className="flex items-center gap-2 text-xs font-semibold italic text-brand-sky sm:text-sm">
              <MapPin size={14} aria-hidden className="shrink-0 sm:size-4" />
              {business.heroLocationLine}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
              {business.heroHeadline}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
              {heroIntro}
            </p>

            <ul className="mt-5 space-y-2">
              {heroBullets.map(({ lead, text }) => (
                <li key={lead} className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} aria-hidden className="mt-0.5 shrink-0 text-brand-sky" />
                  <p className="text-sm leading-snug text-white/85 sm:text-[0.9375rem]">
                    <strong className="font-bold text-brand-sky">{lead}</strong> {text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="#estimate"
                className="rounded-full bg-brand-red px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark sm:px-7 sm:py-3 sm:text-base"
              >
                Request a Free Estimate
              </Link>
              <a
                href={business.phoneHref}
                className="flex items-center gap-2 rounded-full border border-solid border-white/40 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/10 sm:px-6 sm:py-3 sm:text-base"
              >
                <Phone size={18} aria-hidden />
                {business.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Floating review card — Arlington signature accent */}
        <figure className="absolute bottom-10 right-6 z-10 hidden w-64 rounded-lg bg-brand-red p-5 text-white shadow-xl xl:block">
          <div className="flex gap-0.5" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={15} aria-hidden className="fill-amber-300 text-amber-300" />
            ))}
          </div>
          <blockquote className="mt-3 text-sm leading-relaxed">
            &quot;Cleanest framing work the inspector had seen all year. Zero drama.&quot;
          </blockquote>
          <figcaption className="mt-2 text-xs font-bold">
            Michael R. (happy customer)
          </figcaption>
        </figure>
      </section>

      <BrandPillars />

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Our Services"
            title="Framing, Remodeling & Siding — Residential & Commercial"
            lede="The frame is the backbone of every build — and it's our specialty. Remodeling, siding, and decks with the same power, precision, and passion."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const img = homeImages[service.image];
              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className="group overflow-hidden rounded-xl border border-solid border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-brand-sky/60 hover:shadow-lg"
                >
                  <ContentImage src={img.src} alt={img.alt} className="h-48" />
                  <div className="p-7">
                    <h3 className="text-lg font-bold text-brand-navy">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      {service.shortDescription}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-blue group-hover:text-brand-red">
                      Learn More
                      <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}

            <div className="flex flex-col items-start justify-center rounded-xl border border-solid border-gray-200 bg-gray-50 p-7">
              <h3 className="text-lg font-bold text-brand-navy">Not Sure What You Need?</h3>
              <p className="mt-2 text-sm text-gray-500">
                Tell us about your project and we&apos;ll point you in the right direction — even
                if that means we&apos;re not the right fit.
              </p>
              <Link
                href="#estimate"
                className="mt-5 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark"
              >
                Ask Us Anything
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dual audience — homeowners + builders ────────────── */}
      <section className="border-t border-solid border-gray-100 bg-gray-50/60 py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Who We Serve"
            title="Two Ways We Build"
            lede="From a single family's custom home to a production builder's multi-plan community, Elite Builders brings the same framing-first precision to every project."
          />

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            {audiences.map(({ title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-solid border-gray-200 border-l-4 border-l-brand-red bg-white p-8 transition-shadow hover:shadow-md"
              >
                <h3 className="text-xl font-bold text-brand-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About + stats ────────────────────────────────────── */}
      <section className="border-y border-solid border-gray-100 bg-white py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="About Us"
            title={`${business.displayName}: Framing Built On Craftsmanship, Not Shortcuts`}
            lede={`Family-owned since ${business.foundedYear}. ${business.companyStory} ${integrityStatement}`}
          />

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
            <ContentImage
              src={homeImages.customHomeFramingCrew.src}
              alt={homeImages.customHomeFramingCrew.alt}
              className="h-72 rounded-xl sm:h-80 lg:h-96"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
            <div className="space-y-5 text-gray-600">
              <p className="leading-relaxed">
                From the first blueprint review to the final walkthrough, our crews bring decades of
                framing experience to every job — residential, commercial, and everything in between.
              </p>
              <p className="leading-relaxed">
                We coordinate permits, keep your timeline on track, and build structures that pass
                inspection the first time. That&apos;s how we&apos;ve earned trust across the Bay Area,
                Central Valley, and Northern California.
              </p>
            </div>
          </div>

          <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-y-10 lg:grid-cols-4">
            {trustStats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <dd className="font-display text-4xl font-extrabold text-brand-blue">{value}</dd>
                <dt className="mt-1.5 text-sm text-gray-500">{label}</dt>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-center text-sm font-semibold text-gray-500">
            Licensed California Contractor —{" "}
            <span className="text-brand-navy">{business.license}</span>
          </p>
        </div>
      </section>

      <BuilderPartnersSection />

      <TeamSection members={teamMembers} />

      {/* ── Why choose us — the one colored band ─────────────── */}
      <section id="why-us" className="scroll-mt-28 bg-brand-blue py-24 text-white">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
              Why Choose Us
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Why Homeowners &amp; Builders Trust Elite Builders
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              When your build is on the line, you need straight answers and real craftsmanship —
              not sales gimmicks or the cheapest bid. Here&apos;s why Northern California homeowners and
              builders call us first.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map(({ title, body }) => (
              <div
                key={title}
                className="rounded-xl border-t-4 border-solid border-t-brand-red bg-brand-blue-dark/60 p-7"
              >
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────── */}
      <section id="process" className="scroll-mt-28 bg-white py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="How It Works"
            title="Our Home Framing Process"
            lede="A clear, predictable process — so you always know what's happening, when, and why."
          />

          <ContentImage
            src={homeImages.framingContractorPlanning.src}
            alt={homeImages.framingContractorPlanning.alt}
            className="mt-12 h-56 rounded-xl sm:h-64"
            sizes="(max-width: 1152px) 100vw, 1152px"
            quality={90}
          />

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map(({ step, title, body }) => (
              <li
                key={step}
                className="rounded-xl border border-solid border-gray-200 bg-white p-7"
              >
                <span className="text-4xl font-extrabold text-brand-sky/60">{step}</span>
                <h3 className="mt-3 font-bold text-brand-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Featured projects ────────────────────────────────── */}
      <section className="border-y border-solid border-gray-100 bg-gray-50/60 py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Recent Work"
            title="Framing Projects Across Northern California"
            lede="A look at recent framing, siding, and deck projects across the Bay Area and Northern California."
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => {
              const img = homeImages[project.image];
              return (
              <article
                key={project.id}
                className="overflow-hidden rounded-xl border border-solid border-gray-200 bg-white transition-shadow hover:shadow-lg"
              >
                <ContentImage src={img.src} alt={img.alt} className="h-52" />
                <div className="p-6">
                  <span className="text-xs font-bold uppercase tracking-wide text-brand-sky">
                    {project.type}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-brand-navy">{project.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                    <MapPin size={14} aria-hidden />
                    {project.location}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500">
                    {project.blurb}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-brand-blue">
                    Built for {project.builder}
                  </p>
                </div>
              </article>
            );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-7 py-3 font-bold text-white transition-colors hover:bg-brand-blue-dark"
            >
              View All Projects
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section id="reviews" className="scroll-mt-28 bg-white py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Our Reviews"
            title="What Our Customers Say"
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((review) => (
              <figure
                key={review.name}
                className="rounded-xl border border-solid border-gray-200 bg-white p-7"
              >
                <Quote size={26} aria-hidden className="text-brand-sky/40" />
                <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} aria-hidden className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-gray-600">
                  &quot;{review.quote}&quot;
                </blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-bold text-brand-navy">{review.name}</span>
                  <span className="text-gray-400"> — {review.city}, CA</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {homepageGalleryImageKeys.map((key) => (
              <ContentImage
                key={key}
                src={homeImages[key].src}
                alt={homeImages[key].alt}
                className="h-40 rounded-lg sm:h-48"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Service areas ────────────────────────────────────── */}
      <section className="border-y border-solid border-gray-100 bg-gray-50/60 py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Where We Work"
            title="Proudly Serving the Bay Area, Central Valley & Southern California"
          />

          <ContentImage
            src={homeImages.bayAreaNorthBayService.src}
            alt={homeImages.bayAreaNorthBayService.alt}
            className="mt-12 h-56 rounded-xl sm:h-72"
            sizes="(max-width: 1152px) 100vw, 1152px"
            quality={90}
            priority
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredHomeServiceAreas.map((area) => (
              <Link
                key={area.slug}
                href={area.href}
                className="group flex items-start gap-4 rounded-xl border border-solid border-gray-200 bg-white p-6 transition-all hover:border-brand-sky/60 hover:shadow-md"
              >
                <span className="rounded-full bg-brand-blue/5 p-2.5 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                  <MapPin size={19} aria-hidden />
                </span>
                <span>
                  <span className="block font-bold text-brand-navy">
                    {area.city === "Bay Area" ? "Bay Area" : `${area.city}, CA`}
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">{area.blurb}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/service-areas"
              className="inline-flex items-center gap-2 rounded-full border border-solid border-brand-navy px-7 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
            >
              View All Service Areas
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="site-container">
          <div className="mx-auto max-w-3xl">
          <SectionIntro
            eyebrow="FAQ"
            title="Framing Contractor FAQ"
            lede="Straight answers about our services, service areas, and what makes Elite Builders different."
          />

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
          </div>
        </div>
      </section>

      {/* ── Estimate form ────────────────────────────────────── */}
      <section id="estimate" className="scroll-mt-24 border-t border-solid border-gray-100 bg-gray-50/60 py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Free Estimate"
            title="Ready to Start Your Project?"
            lede="Tell us about your project and we'll respond within one business day — no pressure, no obligation."
          />
          <div className="mx-auto mt-12 grid max-w-5xl items-start gap-10 lg:grid-cols-2">
            <EstimateForm variant="card" />
            <ContentImage
              src={homeImages.luxuryHomeInterior.src}
              alt={homeImages.luxuryHomeInterior.alt}
              className="hidden h-[32rem] rounded-xl lg:block"
            />
          </div>
          <p className="mt-8 text-center text-sm text-gray-400">
            Prefer to talk?{" "}
            <a href={business.phoneHref} className="font-bold text-brand-blue hover:text-brand-blue-dark">
              Call {business.phone}
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
