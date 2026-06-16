"use client";

import Link from "next/link";
import { CheckCircle2, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { business } from "@/lib/site/config";
import { heroBullets, heroIntro } from "@/lib/site/messaging";
import { phoneToHref, readRuntimeSiteConfig } from "@/lib/site/runtimeSiteConfig";
import { SITE_CONFIG_UPDATED_EVENT } from "@/lib/admin/siteConfigSettings";

export default function HomeHeroContent() {
  const [heroLocationLine, setHeroLocationLine] = useState<string>(business.heroLocationLine);
  const [heroHeadline, setHeroHeadline] = useState<string>(business.heroHeadline);
  const [phone, setPhone] = useState<string>(business.phone);
  const [phoneHref, setPhoneHref] = useState<string>(business.phoneHref);
  const [primaryCtaText, setPrimaryCtaText] = useState("Request a Free Estimate");
  const [primaryCtaHref, setPrimaryCtaHref] = useState("#estimate");

  useEffect(() => {
    const applyRuntime = () => {
      const runtime = readRuntimeSiteConfig();
      setHeroLocationLine(runtime.heroLocationLine || business.heroLocationLine);
      setHeroHeadline(runtime.heroHeadline || business.heroHeadline);
      setPhone(runtime.phoneMain || business.phone);
      setPhoneHref(phoneToHref(runtime.phoneMain || business.phone));
      setPrimaryCtaText(runtime.homepagePrimaryCtaText || "Request a Free Estimate");
      setPrimaryCtaHref(runtime.homepagePrimaryCtaLink || "#estimate");
    };

    applyRuntime();
    window.addEventListener(SITE_CONFIG_UPDATED_EVENT, applyRuntime);
    return () => window.removeEventListener(SITE_CONFIG_UPDATED_EVENT, applyRuntime);
  }, []);

  return (
    <div className="max-w-xl text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.45)]">
      <p className="flex items-center gap-2 text-xs font-semibold italic text-brand-sky sm:text-sm">
        <MapPin size={14} aria-hidden className="shrink-0 sm:size-4" />
        {heroLocationLine}
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
        {heroHeadline}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">{heroIntro}</p>

      <ul className="mt-5 space-y-2">
        {heroBullets.map(({ lead, text }) => (
          <li key={lead} className="flex items-start gap-2.5">
            <CheckCircle2 size={18} aria-hidden className="mt-0.5 shrink-0 text-brand-sky" />
            <p className="text-sm leading-snug text-white/85 sm:text-[0.9375rem]">
              <strong className="font-bold text-brand-sky">{lead}</strong> {text}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <Link
          href={primaryCtaHref}
          className="rounded-full bg-brand-red px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark sm:px-7 sm:py-3 sm:text-base"
        >
          {primaryCtaText}
        </Link>
        <a
          href={phoneHref}
          className="flex items-center gap-2 rounded-full border border-solid border-white/40 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/10 sm:px-6 sm:py-3 sm:text-base"
        >
          <Phone size={18} aria-hidden />
          {phone}
        </a>
      </div>
    </div>
  );
}

