import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Check, Mail, Phone } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import HomeHeroContent from "@/components/site/HomeHeroContent";
import HomeHeroSection from "@/components/site/HomeHeroSection";
import BrandPillars from "@/components/site/BrandPillars";
import WhyChooseUsSection from "@/components/site/WhyChooseUsSection";
import HomeAboutSection from "@/components/site/home/HomeAboutSection";
import HomeAudienceSection, { type Audience } from "@/components/site/home/HomeAudienceSection";
import HomeFaqSection from "@/components/site/home/HomeFaqSection";
import HomeGallerySection from "@/components/site/home/HomeGallerySection";
import HomeProjectsSection from "@/components/site/home/HomeProjectsSection";
import HomeServiceAreasSection from "@/components/site/home/HomeServiceAreasSection";
import HomeServicesSection, { type HomeService } from "@/components/site/home/HomeServicesSection";
import ScrollReveal from "@/components/site/home/ScrollReveal";
import { business, serviceAreas, teamMembers } from "@/lib/site/config";
import { listPublishedPublicServicePages } from "@/lib/admin/services.server";
import { getPublicServicePagesFallback } from "@/lib/site/servicesPublic";
import { getServiceSubPagesForCategory } from "@/lib/site/serviceSubPages";
import { homepageFaqs, framingFirstTagline } from "@/lib/site/messaging";
import { homeImages } from "@/lib/site/images";
import { completedProjects, currentProjects, type Project } from "@/lib/site/projects";
import { homepageMetadata, logoSchemaImage, organizationSchema } from "@/lib/site/seo";

const ContactForm = dynamic(() => import("@/components/site/ContactForm"));
const BuilderPartnersSection = dynamic(
  () => import("@/components/site/BuilderPartnersSection"),
);
const TeamSection = dynamic(() => import("@/components/site/TeamSection"));

// Cached for an hour; dashboard saves refresh it right away (revalidatePath).
export const revalidate = 3600;

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
// Each path's next step is added in HomePage (the home builder link depends on the live service URL).
const audiences: Omit<Audience, "action">[] = [
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
  const linkedServices: HomeService[] = services.map((service) => ({
    ...service,
    subServices: getServiceSubPagesForCategory(service.slug).map((page) => ({
      label: page.label,
      href: page.href,
    })),
  }));
  // Who We Serve: homeowners go on to home building, builders to the projects framed for builders.
  const homeBuilderHref =
    linkedServices.find((service) => service.slug === "home-builder")?.href ?? "/services";
  const audienceItems: Audience[] = [
    { ...audiences[0], action: { label: "See home building services", href: homeBuilderHref } },
    { ...audiences[1], action: { label: "See projects we've framed", href: "/projects" } },
  ];
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

      {/* ── Services through FAQ (home redesign: components in components/site/home) ── */}
      {/* Home Builder is left out here on purpose; the homeowners path in Who We Serve links to it. */}
      <HomeServicesSection
        services={linkedServices.filter((service) => service.slug !== "home-builder")}
      />

      <HomeAudienceSection items={audienceItems} />

      {/* Real work right after "what we do / who for": projects, then job-site photos. */}
      <HomeProjectsSection projects={featuredProjects} />

      <HomeGallerySection />

      <WhyChooseUsSection items={whyChooseUs} lede={framingFirstTagline} />

      <HomeAboutSection />

      <HomeServiceAreasSection />

      <HomeFaqSection faqs={faqs} />

      {/* Plays the reveal motion in the sections above as each one scrolls into view. */}
      <ScrollReveal />

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
