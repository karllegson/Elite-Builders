import Image from "next/image";
import { cityPageShared } from "@/lib/site/cityPages";

export function CityWhyFramingFirst() {
  const { heading, lede, image, callouts, points } = cityPageShared.whyFramingFirst;

  return (
    <section className="section bg-white" aria-labelledby="city-why-heading">
      <div className="site-container">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <figure className="min-w-0">
            <div className="relative overflow-hidden rounded-3xl border border-solid border-site-line">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                quality={75}
                sizes="(max-width: 1024px) 100vw, 640px"
                className="h-auto w-full"
              />
              <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-70" aria-hidden />
              {callouts.map((callout, index) => (
                <span
                  key={callout.label}
                  className="callout-dot absolute -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_6px_rgba(201,166,107,0.25)]"
                  style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
                  aria-hidden
                >
                  {index + 1}
                </span>
              ))}
            </div>
            <figcaption>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {callouts.map((callout, index) => (
                  <li key={callout.label} className="flex items-start gap-3 text-sm leading-snug text-site-text-dark">
                    <span className="callout-dot !size-6 !text-[0.6875rem]" aria-hidden>
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{callout.label}</span>
                  </li>
                ))}
              </ol>
            </figcaption>
          </figure>

          <div>
            <p className="spec-label">Structure</p>
            <h2 id="city-why-heading" className="section-title mt-4">
              {heading}
            </h2>
            <p className="section-lede mt-5">{lede}</p>
            <ul className="mt-8 grid gap-6">
              {points.map((point) => (
                <li key={point.title} className="border-l-2 border-solid border-brand-lumber pl-5">
                  <h3 className="font-display text-lg font-semibold text-brand-ink">{point.title}</h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-site-text">{point.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
