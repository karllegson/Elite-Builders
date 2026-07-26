import Image from "next/image";
import type { ReactNode } from "react";

type SplitFadeHeroProps = {
  eyebrow: string;
  title: string;
  titleAs?: "h1" | "h2";
  lede?: string;
  children?: ReactNode;
  image: {
    src: string;
    alt: string;
    objectPosition?: string;
  };
  priority?: boolean;
};

export default function SplitFadeHero({
  eyebrow,
  title,
  titleAs = "h2",
  lede,
  children,
  image,
  priority = false,
}: SplitFadeHeroProps) {
  const Heading = titleAs;

  return (
    <div className="split-fade-hero">
      <div className="split-fade-hero-shell">
        <div className="split-fade-hero-media">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            quality={90}
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="split-fade-hero-photo"
            style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
          />
          <div
            className="split-fade-hero-media-extend"
            style={{
              backgroundImage: `url(${image.src})`,
              backgroundPosition: image.objectPosition ?? "center 35%",
            }}
            aria-hidden
          />
          <div className="split-fade-hero-fade" aria-hidden />
        </div>

        <div className="split-fade-hero-copy">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">{eyebrow}</p>
          <Heading className="split-fade-hero-title mt-3 max-w-xl text-3xl font-bold leading-tight text-brand-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            {title}
          </Heading>
          {children ? (
            <div className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-gray-600">
              {children}
            </div>
          ) : lede ? (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-600">{lede}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
