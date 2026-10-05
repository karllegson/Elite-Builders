import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export type PageHeroCrumb = {
  label: string;
  href?: string;
};

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  lede?: ReactNode;
  breadcrumbs?: PageHeroCrumb[];
  image?: { src: string; alt: string; objectPosition?: string };
  /** Compact variant for content pages (blog posts, service-area pages). */
  size?: "default" | "compact";
  children?: ReactNode;
};

/** Dark inner-page hero with optional photo backdrop and breadcrumbs. */
export default function PageHero({
  title,
  eyebrow,
  lede,
  breadcrumbs,
  image,
  size = "default",
  children,
}: PageHeroProps) {
  const compact = size === "compact";

  return (
    <section className="bg-ink relative isolate overflow-hidden">
      {image ? (
        <>
          <Image
            src={image.src}
            alt=""
            fill
            priority
            quality={85}
            sizes="100vw"
            className="-z-20 object-cover"
            style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
            aria-hidden
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-ink via-brand-ink/85 to-brand-ink/40"
            aria-hidden
          />
        </>
      ) : (
        <div className="bg-blueprint absolute inset-0 -z-10" aria-hidden />
      )}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-brand-ink/60 to-transparent"
        aria-hidden
      />
      <div
        className="absolute -right-32 -top-32 -z-10 size-96 rounded-full bg-brand-blue/25 blur-3xl"
        aria-hidden
      />

      <div
        className={`site-container ${
          compact ? "py-12 sm:py-16" : "py-16 sm:py-24 lg:py-28"
        }`}
      >
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumbs">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? (
                      <ChevronRight size={13} aria-hidden className="text-white/35" />
                    ) : null}
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
        ) : null}

        <div className={breadcrumbs?.length ? "mt-8 sm:mt-10" : ""}>
          {eyebrow ? <p className="eyebrow eyebrow-light">{eyebrow}</p> : null}
          <h1
            className={`max-w-4xl font-display font-bold text-white ${
              eyebrow ? "mt-4" : ""
            } ${
              compact
                ? "text-3xl leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.75rem]"
                : "text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
            }`}
          >
            {title}
          </h1>
          {lede ? (
            <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-white/75 sm:text-lg">
              {lede}
            </div>
          ) : null}
          {children ? <div className="mt-9">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
