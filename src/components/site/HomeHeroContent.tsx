"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { business } from "@/lib/site/config";
import { heroBullets, heroIntro, heroSubheading } from "@/lib/site/messaging";
import { readRuntimeSiteConfig } from "@/lib/site/runtimeSiteConfig";
import { SITE_CONFIG_UPDATED_EVENT } from "@/lib/admin/siteConfigSettings";

export default function HomeHeroContent() {
  const [heroLocationLine, setHeroLocationLine] = useState<string>(business.heroLocationLine);
  const [heroHeadline, setHeroHeadline] = useState<string>(business.heroHeadline);
  const [primaryCtaText, setPrimaryCtaText] = useState("Get a Free Estimate");
  const [primaryCtaHref, setPrimaryCtaHref] = useState("/#estimate");
  const secondaryCtaText = "View Our Projects";
  const secondaryCtaHref = "/projects";

  useEffect(() => {
    const applyRuntime = () => {
      const runtime = readRuntimeSiteConfig();
      setHeroLocationLine(runtime.heroLocationLine || business.heroLocationLine);
      setHeroHeadline(runtime.heroHeadline || business.heroHeadline);
      setPrimaryCtaText(runtime.homepagePrimaryCtaText || "Get a Free Estimate");
      setPrimaryCtaHref(runtime.homepagePrimaryCtaLink || "/#estimate");
    };

    applyRuntime();
    window.addEventListener(SITE_CONFIG_UPDATED_EVENT, applyRuntime);
    return () => window.removeEventListener(SITE_CONFIG_UPDATED_EVENT, applyRuntime);
  }, []);

  return (
    <div className="max-w-xl text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-sky sm:text-sm sm:tracking-[0.18em]">
        {heroLocationLine}
      </p>
      <h1 className="mt-1.5 text-xl font-bold leading-tight text-white sm:mt-2 sm:text-3xl lg:text-4xl">
        {heroHeadline}
      </h1>
      <p className="mt-2 text-sm font-semibold text-white sm:mt-3 sm:text-lg">{heroSubheading}</p>
      <p className="mt-2 text-xs leading-relaxed text-white/90 sm:mt-3 sm:text-base">{heroIntro}</p>

      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:mt-5 sm:grid-cols-2 sm:gap-2">
        {heroBullets.map((item) => (
          <li key={item} className="flex items-center gap-2 sm:gap-2.5">
            <CheckCircle2 size={16} aria-hidden className="shrink-0 text-brand-sky sm:size-[18px]" />
            <p className="text-xs leading-snug text-white/90 sm:text-[0.9375rem]">{item}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
        <Link
          href={primaryCtaHref}
          className="rounded-full bg-brand-red px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-red-dark sm:px-7 sm:py-3 sm:text-base"
        >
          {primaryCtaText}
        </Link>
        <Link
          href={secondaryCtaHref}
          className="rounded-full border border-solid border-white/40 px-4 py-2 text-xs font-bold backdrop-blur-sm transition-colors hover:bg-white/10 sm:px-6 sm:py-3 sm:text-base"
        >
          {secondaryCtaText}
        </Link>
      </div>
    </div>
  );
}
