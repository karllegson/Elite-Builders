import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone } from "lucide-react";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import { business } from "@/lib/site/config";
import type { CityPageConfig } from "@/lib/site/cityPages";

type CityHeroProps = {
  hero: CityPageConfig["hero"];
  /** CMS featured image overrides the config image when set. */
  image: { src: string; alt: string; objectPosition?: string };
  breadcrumbs: { label: string; href?: string }[];
  showDrafts: boolean;
};

function isOptimizable(src: string) {
  return !src.startsWith("blob:") && !src.startsWith("data:");
}

export function CityHero({ hero, image, breadcrumbs, showDrafts }: CityHeroProps) {
  return (
    <section className="bg-ink relative isolate overflow-hidden" aria-labelledby="city-hero-title">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        preload
        quality={75}
        sizes="100vw"
        unoptimized={!isOptimizable(image.src)}
        className="-z-20 object-cover"
        style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
      />
      {/* Mobile: darken from the bottom where the copy sits. Desktop: darken from the left. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-ink via-brand-ink/80 to-brand-ink/25 lg:bg-gradient-to-r lg:from-brand-ink lg:via-brand-ink/85 lg:to-brand-ink/15"
        aria-hidden
      />
      <div className="bg-blueprint absolute inset-0 -z-10 opacity-60" aria-hidden />

      <div className="site-container flex min-h-[36rem] flex-col justify-end pb-10 pt-8 sm:min-h-[38rem] sm:pb-14 lg:min-h-[40rem] lg:justify-center lg:py-20">
        <nav aria-label="Breadcrumb">
          <ol className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {index > 0 ? <ChevronRight size={13} aria-hidden className="text-white/35" /> : null}
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={isLast ? "page" : undefined} className="line-clamp-1">
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="mt-auto max-w-2xl pt-16 lg:mt-10 lg:pt-0">
          <p className="spec-label">{hero.eyebrow}</p>
          <h1
            id="city-hero-title"
            className="mt-4 font-display text-[2.375rem] font-bold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {hero.h1}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {hero.subhead}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <EstimateCtaLink href="/#estimate" trackingLocation="hero" className="btn btn-primary btn-lg">
              Get a Free Estimate
              <ArrowRight size={18} aria-hidden className="btn-arrow" />
            </EstimateCtaLink>
            <a href={business.phoneHref} data-cta-location="hero" className="btn btn-glass btn-lg">
              <Phone size={17} aria-hidden />
              Call {business.phone}
            </a>
          </div>

          {hero.imageTodo ? (
            <ClientTodoNote todo={hero.imageTodo} show={showDrafts} className="mt-6 max-w-xl" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
