import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import DimensionLine from "@/components/site/home/DimensionLine";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { integrityStatement } from "@/lib/site/messaging";

export default function HomeAboutSection() {
  return (
    <section className="section bg-white">
      <div className="site-container grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="order-2 lg:col-span-6">
          <div className="reveal-up">
            <p className="eyebrow">About Us</p>
            <h2 className="section-title mt-4">
              {business.displayName}: Framing Built On Craftsmanship, Not Shortcuts
            </h2>
            <p className="section-lede mt-5">{business.companyStory}</p>
          </div>

          <figure className="reveal-up mt-10">
            <span
              className="block font-display text-6xl font-bold leading-none text-brand-red"
              aria-hidden
            >
              &ldquo;
            </span>
            <blockquote className="-mt-4 font-display text-2xl font-semibold leading-snug tracking-tight text-brand-ink sm:text-[1.75rem]">
              {integrityStatement}
            </blockquote>
            <DimensionLine className="mt-6 max-w-xs" />
          </figure>

          <div className="reveal-up mt-8 space-y-4 text-[0.9375rem] leading-relaxed text-site-text sm:text-base">
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

          <div className="reveal-up mt-9 flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/about" className="btn btn-dark">
              Our Story
              <ArrowRight size={16} aria-hidden className="btn-arrow" />
            </Link>
            <p className="inline-flex flex-col rounded-lg border border-solid border-site-line bg-site-surface px-4 py-2.5">
              <span className="text-xs text-site-text">Licensed California Contractor</span>
              <span className="font-display text-sm font-bold tracking-wide text-brand-ink">
                {business.license}
              </span>
            </p>
          </div>
        </div>

        {/* Offset collage, left on wide screens: the crew tied off on a Mammoth roof, with a St. Helena
            home pinned over the corner. The inset drifts slower than the page, so the two read as layers. */}
        <div className="relative order-1 pb-10 pr-10 sm:pb-14 sm:pr-16 lg:col-span-6">
          <ContentImage
            src={homeImages.mammothRoofCrewFallProtection.src}
            alt={homeImages.mammothRoofCrewFallProtection.alt}
            className="reveal-rise aspect-[5/4] rounded-3xl lg:aspect-[4/5]"
            objectPosition="center 62%"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={90}
          />
          <div className="drift absolute bottom-0 right-0 w-[46%] max-w-64 overflow-hidden rounded-2xl border-4 border-solid border-white shadow-[0_24px_48px_-28px_rgba(7,21,48,0.55)]">
            <ContentImage
              src={homeImages.stHelenaGableTrussFraming.src}
              alt={homeImages.stHelenaGableTrussFraming.alt}
              className="aspect-[4/3]"
              sizes="256px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
