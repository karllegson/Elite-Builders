import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
} from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
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

const EstimateForm = dynamic(() => import("@/components/site/EstimateForm"));
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
    body: "Custom homes, additions, remodel framing, decks, and siding — structural work with honest estimates and clear communication from start to finish.",
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
    "Framing-first contractor serving the Bay Area, Central Valley, and Southern California — custom, production, and addition framing plus siding and deck construction for residential and commercial projects.",
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
      <HomeHeroSection>
        <HomeHeroContent />
      </HomeHeroSection>

      {/* ── Builder logos marquee (right under the hero) ─────── */}
      <BuilderPartnersSection />

      <BrandPillars />

      <TeamSection members={teamMembers} />

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="bg-white py-12 sm:py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Our Services"
            title="Framing Contractor & Construction Specialists"
            lede="Custom, production, and addition framing are our core — plus home building, decks, and siding across the Bay Area, Central Valley, and Southern California. Need kitchen or room re-framing? We handle the structural work."
          />

          <div className="mt-8 sm:mt-14">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {services.map((service) => {
              const img = homeImages[service.image];
              return (
                <Link
                  key={service.slug}
                  href={service.href}
                  className="group overflow-hidden rounded-xl border border-solid border-gray-200 bg-white transition-all hover:-translate-y-1 hover:border-brand-sky/60 hover:shadow-lg"
                >
                  <ContentImage src={img.src} alt={img.alt} className="h-36 sm:h-48" />
                  <div className="p-4 sm:p-7">
                    <h3 className="text-base font-bold text-brand-navy sm:text-lg">{service.name}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500 sm:mt-2 sm:text-sm">
                      {service.shortDescription}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue group-hover:text-brand-red sm:mt-4 sm:text-sm">
                      Learn More
                      <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}

            <div className="flex flex-col items-start justify-center rounded-xl border border-solid border-gray-200 bg-gray-50 p-4 sm:p-7">
              <h3 className="text-base font-bold text-brand-navy sm:text-lg">Not Sure What You Need?</h3>
              <p className="mt-1.5 text-xs text-gray-500 sm:mt-2 sm:text-sm">
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
        </div>
      </section>

      {/* ── Dual audience — homeowners + builders ────────────── */}
      <section className="border-t border-solid border-gray-100 bg-gray-50/60 py-12 sm:py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Who We Serve"
            title="Two Ways We Build"
            lede="From a single family's custom home to a production builder's multi-plan community, Elite Builders brings the same framing-first precision to every project."
          />

          <WhoWeServeCards items={audiences} />
        </div>
      </section>

      {/* ── About + stats ────────────────────────────────────── */}
      <section className="border-y border-solid border-gray-100 bg-white py-12 sm:py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="About Us"
            title={`${business.displayName}: Framing Built On Craftsmanship, Not Shortcuts`}
            lede={`Family-owned since ${business.foundedYear}. ${business.companyStory} ${integrityStatement}`}
          />

          <div className="mt-8 grid items-center gap-6 sm:mt-14 sm:gap-10 lg:grid-cols-2">
            <ContentImage
              src={homeImages.customHomeFramingCrew.src}
              alt={homeImages.customHomeFramingCrew.alt}
              className="h-48 rounded-lg sm:h-80 sm:rounded-xl lg:h-96"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
            <div className="space-y-3 text-xs text-gray-600 sm:space-y-5 sm:text-base">
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

          <dl className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-y-6 sm:mt-14 sm:gap-y-10 lg:grid-cols-4">
            {trustStats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <dd className="font-display text-2xl font-extrabold text-brand-blue sm:text-4xl">{value}</dd>
                <dt className="mt-1 text-[11px] text-gray-500 sm:mt-1.5 sm:text-sm">{label}</dt>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-center text-xs font-semibold text-gray-500 sm:mt-10 sm:text-sm">
            Licensed California Contractor —{" "}
            <span className="text-brand-navy">{business.license}</span>
          </p>
        </div>
      </section>

      <WhyChooseUsSection items={whyChooseUs} lede={framingFirstTagline} />

      {/* ── Featured projects ────────────────────────────────── */}
      <section className="border-y border-solid border-gray-100 bg-gray-50/60 py-12 sm:py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Recent Work"
            title="Framing Projects Across Northern California"
            lede="A look at recent framing, siding, and deck projects across the Bay Area and Northern California."
          />

          <div className="mt-8 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {featuredProjects.map((project) => {
              const img = homeImages[project.image];
              return (
              <article
                key={project.id}
                className="overflow-hidden rounded-lg border border-solid border-gray-200 bg-white transition-shadow hover:shadow-lg sm:rounded-xl"
              >
                <ContentImage src={img.src} alt={img.alt} className="h-36 sm:h-52" />
                <div className="p-4 sm:p-6">
                  <span className="text-xs font-bold uppercase tracking-wide text-brand-blue sm:text-sm">
                    {project.type}
                  </span>
                  <h3 className="mt-1.5 text-base font-bold text-brand-navy sm:mt-2 sm:text-lg">{project.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 sm:text-sm">
                    <MapPin size={14} aria-hidden />
                    {project.location}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:mt-3 sm:text-sm">
                    {project.blurb}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold text-brand-blue sm:mt-3 sm:text-xs">
                    Built for {project.builder}
                  </p>
                </div>
              </article>
            );
            })}
          </div>

          <div className="mt-8 text-center sm:mt-12">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-blue-dark sm:px-7 sm:py-3 sm:text-base"
            >
              View All Projects
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Reviews (gallery until real reviews are added) ───── */}
      <section id="reviews" className="scroll-mt-28 bg-white py-12 sm:py-24">
        <div className="site-container">
          <SectionIntro eyebrow="Our Reviews" title="What Our Customers Say" />

          <div className="mt-8 grid grid-cols-2 gap-2 sm:mt-14 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {homepageGalleryImageKeys.map((key) => (
              <ContentImage
                key={key}
                src={homeImages[key].src}
                alt={homeImages[key].alt}
                className="h-24 rounded-md sm:h-48 sm:rounded-lg"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Service areas ────────────────────────────────────── */}
      <section className="border-y border-solid border-gray-100 bg-gray-50/60 py-12 sm:py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Where We Work"
            title="Proudly Serving the Bay Area, Central Valley & Southern California"
          />

          <ContentImage
            src={homeImages.bayAreaNorthBayService.src}
            alt={homeImages.bayAreaNorthBayService.alt}
            className="mt-6 h-40 rounded-lg sm:mt-12 sm:h-72 sm:rounded-xl"
            sizes="(max-width: 1152px) 100vw, 1152px"
            quality={80}
          />

          <div className="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {featuredHomeServiceAreas.map((area) => (
              <Link
                key={area.slug}
                href={area.href}
                className="group flex items-start gap-3 rounded-lg border border-solid border-gray-200 bg-white p-4 transition-all hover:border-brand-sky/60 hover:shadow-md sm:gap-4 sm:rounded-xl sm:p-6"
              >
                <span className="rounded-full bg-brand-blue/5 p-2 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white sm:p-2.5">
                  <MapPin className="size-4 sm:size-[19px]" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-brand-navy sm:text-base">
                    {area.city === "Bay Area" ? "Bay Area" : `${area.city}, CA`}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500 sm:mt-1 sm:text-sm">{area.blurb}</span>
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:mt-10">
            <Link
              href="/service-areas"
              className="inline-flex items-center gap-2 rounded-full border border-solid border-brand-navy px-5 py-2.5 text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white sm:px-7 sm:py-3 sm:text-sm"
            >
              View All Service Areas
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="bg-white py-12 sm:py-24">
        <div className="site-container">
          <div className="mx-auto max-w-3xl">
          <SectionIntro
            eyebrow="FAQ"
            title="Framing Contractor FAQ"
            lede="Straight answers about our services, service areas, and what makes Elite Builders different."
          />

          <div className="mt-6 space-y-2.5 sm:mt-12 sm:space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-solid border-gray-200 bg-white px-4 py-3 transition-colors open:border-brand-sky/60 sm:rounded-xl sm:px-6 sm:py-5"
              >
                <summary className="flex items-center justify-between gap-3 text-sm font-bold text-brand-navy sm:gap-4 sm:text-base">
                  {faq.question}
                  <span className="shrink-0 text-brand-blue transition-transform group-open:rotate-90">
                    <ArrowRight className="size-4 sm:size-[18px]" aria-hidden />
                  </span>
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:mt-3 sm:text-sm">{faq.answer}</p>
              </details>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* ── Estimate form ────────────────────────────────────── */}
      <section id="estimate" className="scroll-mt-24 border-t border-solid border-gray-100 bg-gray-50/60 py-12 sm:py-24">
        <div className="site-container">
          <SectionIntro
            eyebrow="Free Estimate"
            title="Ready to Start Your Project?"
            lede="Tell us about your project and we'll respond within one business day — no pressure, no obligation."
          />
          <div className="mx-auto mt-6 grid max-w-5xl items-start gap-6 sm:mt-12 sm:gap-10 lg:grid-cols-2">
            <EstimateForm variant="card" />
            <ContentImage
              src={homeImages.luxuryHomeInterior.src}
              alt={homeImages.luxuryHomeInterior.alt}
              className="hidden h-[32rem] rounded-xl lg:block"
            />
          </div>
          <p className="mt-5 text-center text-xs text-gray-500 sm:mt-8 sm:text-sm">
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
