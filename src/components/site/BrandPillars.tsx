import Image from "next/image";
import { HardHat, Ruler, ShieldCheck } from "lucide-react";
import { brandPillars, brandPillarsHeading, differentiationIntro } from "@/lib/site/messaging";

const pillarIcons = [Ruler, ShieldCheck, HardHat] as const;

const GROUP_PHOTO = {
  src: "/images/team/group-photo.webp",
  alt: "Elite Builders team group photo",
} as const;

export default function BrandPillars() {
  return (
    <section className="border-b border-solid border-gray-100 bg-[#f5f8fd]">
      <div className="brand-pillars-hero">
        <div className="brand-pillars-hero-grid">
          <div className="brand-pillars-hero-media">
            <Image
              src={GROUP_PHOTO.src}
              alt={GROUP_PHOTO.alt}
              fill
              quality={90}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="brand-pillars-hero-photo"
              style={{ objectPosition: "center 42%" }}
            />
            <div className="brand-pillars-hero-fade" aria-hidden />
          </div>

          <div className="brand-pillars-hero-copy">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-blue">
              What We Stand For
            </p>
            <h2 className="mt-3 max-w-xl text-2xl font-bold leading-tight text-brand-navy sm:text-3xl lg:text-[2.25rem] lg:leading-[1.12]">
              {brandPillarsHeading}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
              {differentiationIntro}
            </p>

            <div className="brand-pillars-card relative mt-4 w-full max-w-2xl overflow-hidden rounded-lg border border-solid border-brand-navy/15 bg-white shadow-[0_16px_40px_-28px_rgba(0,32,91,0.45)] sm:mt-8">
              <div className="brand-pillars-card-grid pointer-events-none absolute inset-0" aria-hidden />

              <div className="relative grid grid-cols-3 divide-x divide-brand-navy/10">
                {brandPillars.map(({ title, body }, index) => {
                  const Icon = pillarIcons[index] ?? ShieldCheck;
                  const label = String(index + 1).padStart(2, "0");

                  return (
                    <article
                      key={title}
                      className="group flex flex-col p-2 text-center transition-colors duration-300 hover:bg-brand-navy/[0.02] sm:p-4 sm:text-left"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-display text-[8px] font-bold uppercase tracking-[0.14em] text-brand-blue sm:text-[10px] sm:tracking-[0.18em]">
                          {label}
                        </span>
                        <span className="hidden h-px flex-1 bg-brand-navy/15 sm:block" aria-hidden />
                      </div>

                      <span className="relative mx-auto mt-1.5 flex h-6 w-6 items-center justify-center border border-solid border-brand-blue/40 text-brand-blue transition-colors duration-300 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-white sm:mt-3 sm:h-9 sm:w-9">
                        <span
                          className="absolute -left-[2px] -top-[2px] h-1 w-1 border-l border-t border-solid border-brand-blue"
                          aria-hidden
                        />
                        <span
                          className="absolute -bottom-[2px] -right-[2px] h-1 w-1 border-b border-r border-solid border-brand-blue"
                          aria-hidden
                        />
                        <Icon className="size-3 sm:size-4" strokeWidth={1.75} aria-hidden />
                      </span>

                      <h3 className="mt-1.5 text-[10px] font-bold leading-tight tracking-tight text-brand-navy sm:mt-3 sm:text-sm">
                        {title}
                      </h3>
                      <p className="mt-1 hidden text-xs leading-relaxed text-gray-600 sm:block">
                        {body}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
