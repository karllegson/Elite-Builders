import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import SectionIntro from "@/components/site/SectionIntro";
import { homeImages } from "@/lib/site/images";

// Real job-site photos: a custom home (homeowners) and a full crew (builders' manpower).
const audienceImages = [
  { ...homeImages.stHelenaInteriorFraming, objectPosition: "center" },
  { ...homeImages.mammothCrewRaisingWall, objectPosition: "center" },
] as const;

export type Audience = {
  title: string;
  body: string;
  /** Where this path leads next: a page that fits this visitor, not the shared estimate form. */
  action: { label: string; href: string };
};

/**
 * Who We Serve: the two paths side by side so visitors compare them at a glance, each with
 * its own next step, and the estimate form one quieter link away.
 */
export default function HomeAudienceSection({ items }: { items: readonly Audience[] }) {
  return (
    <section className="section bg-ink relative overflow-hidden">
      <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden />

      <div className="site-container relative">
        <SectionIntro
          eyebrow="Who We Serve"
          title="Two Ways We Build"
          lede="From a single family's custom home to a production builder's multi-plan community, Elite Builders brings the same framing-first precision to every project."
          tone="dark"
          className="reveal-up"
        />

        <div className="mt-12 grid gap-5 sm:mt-16 md:grid-cols-2 lg:gap-6">
          {items.map(({ title, body, action }, index) => {
            const image = audienceImages[index] ?? audienceImages[0];

            return (
              <article
                key={title}
                style={{ "--reveal-i": index } as CSSProperties}
                className="reveal-up group flex flex-col overflow-hidden rounded-3xl border border-solid border-white/10 bg-brand-ink-2"
              >
                <ContentImage
                  src={image.src}
                  alt={image.alt}
                  className="img-zoom aspect-[16/10]"
                  objectPosition={image.objectPosition}
                  sizes="(max-width: 768px) 100vw, 640px"
                  quality={85}
                />

                <div className="flex flex-1 flex-col p-7 sm:p-10">
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-brand-red-light">
                    Path {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                    {title}
                  </h3>
                  <p className="mt-4 text-[0.9375rem] leading-relaxed text-white/80 sm:text-base">
                    {body}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-4 pt-8">
                    <Link href={action.href} className="btn btn-white">
                      {action.label}
                      <ArrowRight size={16} aria-hidden className="btn-arrow" />
                    </Link>
                    <EstimateCtaLink
                      href="/#estimate"
                      className="inline-flex min-h-11 items-center font-display text-sm font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
                    >
                      Get a free estimate
                    </EstimateCtaLink>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
