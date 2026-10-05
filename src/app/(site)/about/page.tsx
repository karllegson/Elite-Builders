import type { Metadata } from "next";
import dynamic from "next/dynamic";
import ContentImage from "@/components/site/ContentImage";
import BrandPillars from "@/components/site/BrandPillars";
import CtaBand from "@/components/site/CtaBand";
import PageHero from "@/components/site/PageHero";
import { business, serviceAreas, teamMembers } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { framingFirstTagline, integrityStatement } from "@/lib/site/messaging";
import { buildPageMetadata } from "@/lib/site/seo";

const BuilderPartnersSection = dynamic(
  () => import("@/components/site/BuilderPartnersSection"),
);
const TeamSection = dynamic(() => import("@/components/site/TeamSection"));

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description:
    "Meet Elite Builders — family-owned framing-first specialists since 2012, serving the Bay Area, Central Valley, and Southern California with integrity and precision.",
  path: "/about",
});

const yearsInBusiness = new Date().getFullYear() - business.foundedYear;

const stats = [
  { value: String(business.foundedYear), label: "Founded" },
  { value: `${yearsInBusiness}+`, label: "Years in Business" },
  { value: "350+", label: "Projects Completed" },
  { value: `${serviceAreas.length}+`, label: "Cities Served" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="About Elite Builders"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        image={homeImages.customHomeFramingCrew}
        lede={<p>{framingFirstTagline}</p>}
      />

      <section className="section bg-white">
        <div className="site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">Our Story</p>
            <h2 className="section-title mt-4">
              Framing built on craftsmanship, not shortcuts
            </h2>
            <p className="section-lede mt-5">{business.companyStory}</p>
            <blockquote className="mt-8 border-l-2 border-solid border-brand-red pl-5 font-display text-lg font-medium leading-snug text-brand-ink sm:text-xl">
              &ldquo;{integrityStatement}&rdquo;
            </blockquote>
            <div className="mt-8 space-y-4 leading-relaxed text-site-text">
              <p>
                From the first blueprint review to the final walkthrough, our crews bring decades of
                framing experience to every job — residential, commercial, and everything in between.
              </p>
              <p>
                We coordinate permits, keep your timeline on track, and build structures that pass
                inspection the first time. Licensed California Contractor —{" "}
                <span className="font-semibold text-brand-ink">{business.license}</span>.
              </p>
            </div>
          </div>

          <ContentImage
            src={homeImages.twoStoryHomeFramingExterior.src}
            alt={homeImages.twoStoryHomeFramingExterior.alt}
            className="aspect-[4/3] rounded-3xl"
            sizes="(max-width: 1024px) 100vw, 640px"
            quality={90}
            priority
          />
        </div>

        <div className="site-container mt-16 sm:mt-20">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-solid border-site-line bg-site-line lg:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col-reverse bg-white p-6 sm:p-8">
                <dt className="mt-1 text-sm text-site-text-muted">{label}</dt>
                <dd className="font-display text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <BrandPillars />

      <TeamSection members={teamMembers} />

      <BuilderPartnersSection />

      <CtaBand />
    </>
  );
}
