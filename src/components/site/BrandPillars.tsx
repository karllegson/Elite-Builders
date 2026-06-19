import { HardHat, Ruler, ShieldCheck } from "lucide-react";
import { brandPillars, brandPillarsHeading, differentiationIntro } from "@/lib/site/messaging";

const pillarIcons = [Ruler, ShieldCheck, HardHat] as const;

export default function BrandPillars() {
  return (
    <section className="border-b border-solid border-gray-100 bg-[#f5f8fd] py-10 sm:py-24">
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-site-accent sm:text-sm sm:tracking-[0.18em]">
            What We Stand For
          </p>
          <h2 className="mt-2 text-lg font-bold leading-snug text-site-text-dark sm:mt-3 sm:text-3xl">
            {brandPillarsHeading}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-site-text sm:mt-3 sm:text-sm sm:max-w-xl sm:mx-auto">
            {differentiationIntro}
          </p>
        </div>

        <div className="relative mx-auto mt-6 max-w-5xl overflow-hidden rounded-lg border border-solid border-brand-navy/15 bg-white shadow-[0_24px_60px_-34px_rgba(0,32,91,0.40)] sm:mt-14 sm:rounded-2xl">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,32,91,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,32,91,0.05) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden
          />

          <div className="relative grid sm:grid-cols-3">
            {brandPillars.map(({ title, body }, index) => {
              const Icon = pillarIcons[index] ?? ShieldCheck;
              const label = String(index + 1).padStart(2, "0");
              const isLast = index === brandPillars.length - 1;

              return (
                <article
                  key={title}
                  className={`group relative flex flex-col p-4 transition-colors duration-300 hover:bg-brand-navy/[0.02] sm:p-9 ${
                    isLast ? "" : "border-b border-solid border-brand-navy/10 sm:border-b-0 sm:border-r"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue sm:text-xs sm:tracking-[0.25em]">
                      {label}
                    </span>
                    <span className="h-px flex-1 bg-brand-navy/15" aria-hidden />
                  </div>

                  <span className="relative mt-3 flex h-9 w-9 items-center justify-center border border-solid border-brand-blue/40 text-brand-blue transition-colors duration-300 group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-white sm:mt-7 sm:h-14 sm:w-14">
                    <span
                      className="absolute -left-[2px] -top-[2px] h-1.5 w-1.5 border-l border-t border-solid border-brand-blue sm:-left-[3px] sm:-top-[3px] sm:h-2 sm:w-2"
                      aria-hidden
                    />
                    <span
                      className="absolute -bottom-[2px] -right-[2px] h-1.5 w-1.5 border-b border-r border-solid border-brand-blue sm:-bottom-[3px] sm:-right-[3px] sm:h-2 sm:w-2"
                      aria-hidden
                    />
                    <Icon className="size-4 sm:size-6" strokeWidth={1.75} aria-hidden />
                  </span>

                  <div className="relative mt-3 sm:mt-6">
                    <span
                      className="pointer-events-none absolute -inset-x-3 -inset-y-2 z-0 sm:-inset-x-4 sm:-inset-y-3"
                      style={{
                        background:
                          "radial-gradient(65% 60% at 50% 45%, rgba(255,255,255,0.96), rgba(255,255,255,0.7) 55%, rgba(255,255,255,0) 85%)",
                        filter: "blur(6px)",
                      }}
                      aria-hidden
                    />
                    <h3 className="relative z-10 text-sm font-bold tracking-tight text-brand-navy sm:text-lg">
                      {title}
                    </h3>
                    <p className="relative z-10 mt-1.5 text-xs leading-relaxed text-gray-600 sm:mt-3 sm:text-sm">
                      {body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
