import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import DimensionLine from "@/components/site/home/DimensionLine";
import { business, featuredHomeServiceAreas, type ServiceArea } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";

const REGIONS: ServiceArea["region"][] = ["Bay Area", "Central Valley", "Southern California"];

export default function HomeServiceAreasSection() {
  const groups = REGIONS.map((region) => ({
    region,
    areas: featuredHomeServiceAreas.filter((area) => area.region === region),
  })).filter((group) => group.areas.length > 0);

  return (
    // overflow-clip, not overflow-hidden, so the photo column can stay sticky.
    <section className="section bg-ink relative overflow-clip">
      <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden />

      <div className="site-container relative grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="reveal-up">
            <p className="eyebrow eyebrow-light">Where We Work</p>
            <h2 className="section-title mt-4 text-white">
              Proudly Serving the Bay Area, Central Valley &amp; Southern California
            </h2>
          </div>

          <div className="mt-12 space-y-10">
            {groups.map(({ region, areas }) => (
              <div key={region} className="reveal-up">
                <h3 className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-brand-red-light">
                  {region}
                </h3>
                <DimensionLine onDark className="mt-3" />
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {areas.map((area) => (
                    <li key={area.slug}>
                      <Link
                        href={area.href}
                        className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-solid border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-white/30 hover:bg-white/[0.08]"
                      >
                        <span className="min-w-0">
                          <span className="block font-display font-semibold text-white">
                            {area.city === "Bay Area" ? "Bay Area" : `${area.city}, CA`}
                          </span>
                          <span className="mt-0.5 block line-clamp-1 text-sm text-white/65">
                            {area.blurb}
                          </span>
                        </span>
                        <ArrowRight
                          size={16}
                          aria-hidden
                          className="shrink-0 text-brand-red-light transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link href="/service-areas" className="btn btn-white mt-12">
            View All Service Areas
            <ArrowRight size={16} aria-hidden className="btn-arrow" />
          </Link>
        </div>

        <div className="reveal-rise relative self-start overflow-hidden rounded-3xl lg:sticky lg:top-32 lg:col-span-5">
          <ContentImage
            src={homeImages.bayAreaNorthBayService.src}
            alt={homeImages.bayAreaNorthBayService.alt}
            className="aspect-[4/3] lg:aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 40vw"
            quality={85}
          />
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-white p-4 sm:inset-x-6 sm:bottom-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
              <MapPin size={18} aria-hidden />
            </span>
            <p className="text-sm leading-snug text-site-text">
              <span className="block font-display font-semibold text-brand-ink">
                Headquartered in {business.address.city}, {business.address.state}
              </span>
              Crews across Northern &amp; Southern California
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
