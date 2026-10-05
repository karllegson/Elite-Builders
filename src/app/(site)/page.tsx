import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Check, Mail, MapPin, Phone } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import ProjectCard from "@/components/site/ProjectCard";
import HomeHeroContent from "@/components/site/HomeHeroContent";
import HomeHeroSection from "@/components/site/HomeHeroSection";
import BrandPillars from "@/components/site/BrandPillars";
import WhoWeServeCards from "@/components/site/WhoWeServeCards";
import SectionIntro from "@/components/site/SectionIntro";
import WhyChooseUsSection from "@/components/site/WhyChooseUsSection";
import {
  business,
  featuredHomeServiceAreas,
  serviceAreas,
  teamMembers,
} from "@/lib/site/config";
import { listPublishedPublicServicePages } from "@/lib/admin/services.server";
import { getPublicServicePagesFallback } from "@/lib/site/servicesPublic";
import { homepageFaqs, integrityStatement, framingFirstTagline } from "@/lib/site/messaging";
import { homeImages, homepageGalleryImageKeys } from "@/lib/site/images";
import { completedProjects, currentProjects, type Project } from "@/lib/site/projects";
import { homepageMetadata, logoSchemaImage, organizationSchema } from "@/lib/site/seo";

const ContactForm = dynamic(() => import("@/components/site/ContactForm"));
const BuilderPartnersSection = dynamic(
  () => import("@/components/site/BuilderPartnersSection"),
);
const TeamSection = dynamic(() => import("@/components/site/TeamSection"));

export const metadata: Metadata = homepageMetadata;

const yearsInBusiness = new Date().getFullYear() - business.foundedYear;

const trustStats = [
  { value: `${yearsInBusiness}+`, label: "Years in Business" },
  { value: "350+", label: "Projects Completed" },
  { value: `${serviceAreas.length}+`, label: "Cities Served" },
  { value: "100%", label: "Licensed & Insured" },
];

const whyChooseUs = [
  {
    title: "Framing-First Expertise",
    body: "Rough framing is our core — not a line item on a generalist's truck. Walls, roofs, trusses, and structural hardware from specialists who do this every day.",
  },
  {
    title: "Built On Integrity",
    body: "Honest scope and pricing — we'll tell you if we're not the right fit.",
  },
  {
    title: "Experienced Team",
    body: "Square walls, clean lines, inspection-ready work.",
  },
  {
    title: "Licensed & Insured",
    body: "CSLB #970551. Full coverage on every job site.",
  },
  {
    title: "Quality Craftsmanship",
    body: "Every cut and connection done to spec.",
  },
  {
    title: "Reliable Scheduling",
    body: "We show up when we say we will.",
  },
  {
    title: "Bay Area & Northern California",
    body: "Crews across the Bay Area, Central Valley, and SoCal.",
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
    body: "Custom homes, luxury homes, additions, and residential framing — structural work with honest estimates and clear communication from start to finish.",
  },
  {
    title: "For Builders & General Contractors",
    body: "A dependable rough-carpentry subcontractor with the manpower and resources to deliver multi-plan production communities and multi-family projects on schedule.",
  },
];

const faqs = [...homepageFaqs];

/** Mosaic spans for the 11-photo gallery — fills a 4-column grid with no gaps. */
const galleryTileClass: Record<number, string> = {
  0: "col-span-2 row-span-2",
  5: "row-span-2",
  8: "col-span-2",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: business.name,
  url: business.domain,
  telephone: business.phone,
  email: business.email,
  logo: logoSchemaImage,
  image: logoSchemaImage.url,
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
    "Framing-first contractor serving the Bay Area, Central Valley, and Southern California — residential, new construction, custom home, rough, and structural framing plus custom and luxury home building.",
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

export default async function HomePage() {
  const publishedServices = await listPublishedPublicServicePages();
  const services =
    publishedServices.length > 0 ? publishedServices : getPublicServicePagesFallback();
  // Two services: large side-by-side tiles with the "not sure" card as a full-width strip.
  // Four services: two large + three standard tiles. Otherwise a plain three-column grid.
  const pairLayout = services.length === 2;
  const useFeatureLayout = services.length === 4;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Hero with commercial video ───────────────────────── */}
      <link
        rel="preload"
        href="/videos/elite-builders-hero-poster.jpg"
        as="image"
        fetchPriority="high"
      />
      <link
        rel="preload"
        href="/videos/elite-builders-hero.mp4?v=5"
        as="video"
        type="video/mp4"
      />
      <HomeHeroSection
        footer={
          <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-solid border-white/15 bg-white/10 backdrop-blur-md lg:grid-cols-4">
            {trustStats.map(({ value, label }, index) => (
              <div
                key={label}
                className={`flex flex-col-reverse px-5 py-4 sm:px-7 sm:py-5 ${index % 2 === 1 ? "border-l border-solid border-white/10" : ""} ${
                  index > 1 ? "border-t border-solid border-white/10 lg:border-t-0" : ""
                } ${index === 2 ? "lg:border-l" : ""}`}
              >
                <dt className="mt-1 text-xs text-white/70 sm:text-sm">{label}</dt>
                <dd className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        }
      >
        <HomeHeroContent />
      </HomeHeroSection>

      {/* ── Builder logos marquee (right under the hero) ─────── */}
      <BuilderPartnersSection />

      <BrandPillars />

      <TeamSection members={teamMembers} />

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container">
          <SectionIntro
            eyebrow="Our Services"
            title="Framing Contractor & Construction Specialists"
            lede="Residential, new construction, and custom home framing are our core — plus custom and luxury home building across the Bay Area, Central Valley, and Southern California. Need kitchen or room re-framing? We handle the structural work."
            align="left"
            action={
              <Link href="/services" className="btn btn-outline">
                All Services
                <ArrowRight size={16} aria-hidden className="btn-arrow" />
              </Link>
            }
          />

          <div className="mt-12 grid gap-5 sm:mt-16 sm:grid-cols-2 lg:grid-cols-6 lg:gap-6">
            {services.map((service, index) => {
              const img = homeImages[service.image];
              const wide = pairLayout || (useFeatureLayout && index < 2);
              return (
                <Link
                  key={service.slug}
                  href={service.href}
                  className={`group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-brand-ink ${
                    wide ? `lg:col-span-3 ${pairLayout ? "sm:min-h-[28rem] lg:min-h-[32rem]" : "lg:min-h-[26rem]"}` : "lg:col-span-2"
                  }`}
                >
                  <ContentImage
                    src={img.src}
                    alt={img.alt}
                    className="img-zoom !absolute inset-0 -z-20 h-full"
                    sizes={wide ? "(max-width: 1024px) 100vw, 640px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"}
                  />
                  <div
                    className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-ink via-brand-ink/50 to-transparent"
                    aria-hidden
                  />
                  <div className="flex items-end justify-between gap-4 p-6 sm:p-8">
                    <div>
                      <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                        {service.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-white/75">
                        {service.shortDescription}
                      </p>
                    </div>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors group-hover:bg-brand-red">
                      <ArrowRight size={18} aria-hidden className="transition-transform group-hover:-rotate-45" />
                    </span>
                  </div>
                </Link>
              );
            })}

            <div
              className={`bg-blueprint-light flex flex-col justify-between rounded-3xl border border-solid border-site-line bg-site-surface p-7 sm:p-8 ${
                pairLayout
                  ? "sm:col-span-2 lg:col-span-6 lg:flex-row lg:items-center lg:gap-10"
                  : useFeatureLayout
                    ? "sm:col-span-2 lg:col-span-2"
                    : "lg:col-span-2"
              }`}
            >
              <div>
                <p className="eyebrow">Not sure?</p>
                <h3 className="mt-4 font-display text-2xl font-bold">Not Sure What You Need?</h3>
                <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-site-text">
                  Tell us about your project and we&apos;ll point you in the right direction — even
                  if that means we&apos;re not the right fit.
                </p>
              </div>
              <EstimateCtaLink
                href="/#estimate"
                className={`btn btn-dark mt-8 self-start ${pairLayout ? "lg:mt-0 lg:self-center" : ""}`}
              >
                Ask Us Anything
                <ArrowRight size={16} aria-hidden className="btn-arrow" />
              </EstimateCtaLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dual audience — homeowners + builders ────────────── */}
      <section className="section bg-site-surface">
        <div className="site-container">
          <SectionIntro
            eyebrow="Who We Serve"
            title="Two Ways We Build"
            lede="From a single family's custom home to a production builder's multi-plan community, Elite Builders brings the same framing-first precision to every project."
          />

          <WhoWeServeCards items={audiences} />
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <p className="eyebrow">About Us</p>
            <h2 className="section-title mt-4">
              {business.displayName}: Framing Built On Craftsmanship, Not Shortcuts
            </h2>
            <p className="section-lede mt-5">
              {business.companyStory}
            </p>
            <blockquote className="mt-8 border-l-2 border-solid border-brand-red pl-5 font-display text-lg font-medium leading-snug text-brand-ink sm:text-xl">
              &ldquo;{integrityStatement}&rdquo;
            </blockquote>
            <div className="mt-8 space-y-4 text-[0.9375rem] leading-relaxed text-site-text sm:text-base">
              <p>
                From the first blueprint review to the final walkthrough, our crews bring decades of
                framing experience to every job — residential, commercial, and everything in between.
              </p>
              <p>
                We coordinate permits, keep your timeline on track, and build structures that pass
                inspection the first time. That&apos;s how we&apos;ve earned trust across the Bay Area,
                Central Valley, and Northern California.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/about" className="btn btn-dark">
                Our Story
                <ArrowRight size={16} aria-hidden className="btn-arrow" />
              </Link>
              <p className="text-sm text-site-text-muted">
                Licensed California Contractor —{" "}
                <span className="font-semibold text-brand-ink">{business.license}</span>
              </p>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <ContentImage
              src={homeImages.customHomeFramingCrew.src}
              alt={homeImages.customHomeFramingCrew.alt}
              className="aspect-[4/5] rounded-3xl sm:aspect-[5/4] lg:aspect-[4/5]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
            <div className="absolute -bottom-6 -left-2 hidden w-56 overflow-hidden rounded-2xl border-4 border-solid border-white shadow-xl sm:block lg:-left-10">
              <ContentImage
                src={homeImages.framingContractorPlanning.src}
                alt={homeImages.framingContractorPlanning.alt}
                className="aspect-[4/3]"
                sizes="224px"
              />
            </div>
          </div>
        </div>
      </section>

      <WhyChooseUsSection items={whyChooseUs} lede={framingFirstTagline} />

      {/* ── Featured projects ────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container">
          <SectionIntro
            eyebrow="Recent Work"
            title="Framing Projects Across Northern California"
            lede="A look at recent framing projects across the Bay Area and Northern California."
            align="left"
            action={
              <Link href="/projects" className="btn btn-outline">
                View All Projects
                <ArrowRight size={16} aria-hidden className="btn-arrow" />
              </Link>
            }
          />

          <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews (gallery until real reviews are added) ───── */}
      <section id="reviews" className="section scroll-mt-28 bg-site-surface">
        <div className="site-container">
          <SectionIntro eyebrow="Our Reviews" title="What Our Customers Say" />

          <div className="mt-12 grid grid-flow-dense auto-rows-[9rem] grid-cols-2 gap-3 sm:mt-16 sm:auto-rows-[12rem] sm:grid-cols-4 sm:gap-4 lg:auto-rows-[14rem]">
            {homepageGalleryImageKeys.map((key, index) => (
              <ContentImage
                key={key}
                src={homeImages[key].src}
                alt={homeImages[key].alt}
                className={`img-zoom h-full rounded-2xl ${galleryTileClass[index] ?? ""}`}
                sizes={index === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Service areas ────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative overflow-hidden rounded-3xl">
            <ContentImage
              src={homeImages.bayAreaNorthBayService.src}
              alt={homeImages.bayAreaNorthBayService.alt}
              className="aspect-[4/3] lg:aspect-[4/5]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={85}
            />
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-white/90 p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
                <MapPin size={18} aria-hidden />
              </span>
              <p className="text-sm leading-snug text-site-text">
                <span className="block font-display font-semibold text-brand-ink">
                  Headquartered in {business.address.city}, {business.address.state}
                </span>
                Crews across Northern & Southern California
              </p>
            </div>
          </div>

          <div>
            <p className="eyebrow">Where We Work</p>
            <h2 className="section-title mt-4">
              Proudly Serving the Bay Area, Central Valley &amp; Southern California
            </h2>

            <ul className="mt-10 grid gap-x-6 sm:grid-cols-2">
              {featuredHomeServiceAreas.map((area) => (
                <li key={area.slug} className="border-b border-solid border-site-line">
                  <Link
                    href={area.href}
                    className="group flex items-center justify-between gap-3 py-4"
                  >
                    <span>
                      <span className="block font-display font-semibold text-brand-ink transition-colors group-hover:text-brand-red">
                        {area.city === "Bay Area" ? "Bay Area" : `${area.city}, CA`}
                      </span>
                      <span className="mt-0.5 block line-clamp-1 text-sm text-site-text-muted">
                        {area.blurb}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="shrink-0 text-site-text-muted transition-all group-hover:translate-x-1 group-hover:text-brand-red"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/service-areas" className="btn btn-dark mt-10">
              View All Service Areas
              <ArrowRight size={16} aria-hidden className="btn-arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="section bg-site-surface">
        <div className="site-container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow">FAQ</p>
            <h2 className="section-title mt-4">Framing Contractor FAQ</h2>
            <p className="section-lede mt-5">
              Straight answers about our services, service areas, and what makes Elite Builders
              different.
            </p>
            <div className="mt-8 rounded-3xl bg-white p-6 sm:p-7">
              <p className="font-display font-semibold text-brand-ink">Still have questions?</p>
              <p className="mt-1.5 text-[0.9375rem] text-site-text">
                Talk to a real person on our team.
              </p>
              <a href={business.phoneHref} className="btn btn-primary mt-5">
                <Phone size={16} aria-hidden />
                Call {business.phone}
              </a>
            </div>
          </div>

          <div className="border-t border-solid border-site-line">
            {faqs.map((faq) => (
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

      {/* ── Estimate form ────────────────────────────────────── */}
      <section id="estimate" className="section bg-ink relative isolate scroll-mt-24 overflow-hidden">
        <ContentImage
          src={homeImages.luxuryHomeInterior.src}
          alt=""
          className="!absolute inset-0 -z-20 h-full opacity-25"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-ink via-brand-ink/95 to-brand-ink/80"
          aria-hidden
        />

        <div className="site-container grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="lg:pt-6">
            <p className="eyebrow eyebrow-light">Free Estimate</p>
            <h2 className="section-title mt-4">Ready to Start Your Project?</h2>
            <p className="section-lede mt-5">
              Tell us about your project and we&apos;ll respond within one business day — no
              pressure, no obligation.
            </p>

            <ul className="mt-9 space-y-3">
              {["Response within one business day", "Honest scope and pricing", `Licensed & insured — ${business.license}`].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-white/85">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-red/90">
                      <Check size={13} strokeWidth={3} aria-hidden className="text-white" />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <a
                href={business.phoneHref}
                className="group rounded-2xl border border-solid border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
              >
                <Phone size={18} aria-hidden className="text-brand-sky" />
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/50">Call us</p>
                <p className="mt-1 font-display text-lg font-semibold text-white">{business.phone}</p>
              </a>
              <a
                href={`mailto:${business.email}`}
                className="group rounded-2xl border border-solid border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
              >
                <Mail size={18} aria-hidden className="text-brand-sky" />
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/50">Email us</p>
                <p className="mt-1 break-all font-display text-[0.9375rem] font-semibold text-white">
                  {business.email}
                </p>
              </a>
            </div>
          </div>

          <ContactForm
            formType="contact"
            variant="card"
            title="Get Your Free Estimate"
            description="No pressure. No obligation. We respond within one business day."
            submitLabel="Request My Free Estimate"
          />
        </div>
      </section>
    </>
  );
}
