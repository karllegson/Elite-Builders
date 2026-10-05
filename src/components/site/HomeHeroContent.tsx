"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
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
    <div className="max-w-3xl text-white">
      <p className="inline-flex items-center gap-2.5 rounded-full border border-solid border-white/20 bg-white/10 py-1.5 pl-2 pr-4 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md sm:text-sm">
        <span className="relative flex size-2.5 items-center justify-center" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-red/70 motion-reduce:hidden" />
          <span className="relative inline-flex size-2 rounded-full bg-brand-red" />
        </span>
        {heroLocationLine}
      </p>
      <h1 className="mt-6 font-display text-[2.375rem] font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
        {heroHeadline}
      </h1>
      <p className="mt-6 font-display text-lg font-semibold text-brand-sky sm:text-xl">
        {heroSubheading}
      </p>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
        {heroIntro}
      </p>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <EstimateCtaLink href={primaryCtaHref} className="btn btn-primary btn-lg">
          {primaryCtaText}
          <ArrowRight size={18} aria-hidden className="btn-arrow" />
        </EstimateCtaLink>
        <Link href={secondaryCtaHref} className="btn btn-glass btn-lg">
          {secondaryCtaText}
        </Link>
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
        {heroBullets.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-white/85 sm:text-[0.9375rem]">
            <span className="flex size-5 items-center justify-center rounded-full bg-white/15">
              <Check size={12} strokeWidth={3} aria-hidden className="text-white" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
