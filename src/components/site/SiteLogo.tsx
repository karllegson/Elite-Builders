"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { business } from "@/lib/site/config";
import { SITE_CONFIG_UPDATED_EVENT } from "@/lib/admin/siteConfigSettings";
import { readRuntimeSiteConfig } from "@/lib/site/runtimeSiteConfig";

type SiteLogoProps = {
  variant?: "header" | "footer";
  linked?: boolean;
};

export default function SiteLogo({ variant = "header", linked = true }: SiteLogoProps) {
  const isFooter = variant === "footer";
  const [displayName, setDisplayName] = useState<string>(business.displayName);
  const [logoSrc, setLogoSrc] = useState<string>("/logo.png");

  useEffect(() => {
    const applyRuntime = () => {
      const runtime = readRuntimeSiteConfig();
      const nextName =
        runtime.businessName === business.name
          ? business.displayName
          : runtime.businessName || business.displayName;
      setDisplayName(nextName);
      setLogoSrc(runtime.logoImage || "/logo.png");
    };

    applyRuntime();
    window.addEventListener(SITE_CONFIG_UPDATED_EVENT, applyRuntime);
    return () => window.removeEventListener(SITE_CONFIG_UPDATED_EVENT, applyRuntime);
  }, []);

  const icon = (
    <Image
      src={logoSrc}
      alt=""
      width={64}
      height={64}
      priority={variant === "header"}
      quality={95}
      className={`shrink-0 object-contain ${isFooter ? "size-12" : "size-14"}`}
      unoptimized={logoSrc.startsWith("blob:")}
    />
  );

  const label = (
    <span className="leading-tight">
      <span
        className={`font-display block text-lg font-semibold tracking-tight ${
          isFooter ? "text-white" : "text-site-text-dark sm:text-xl"
        }`}
      >
        {displayName}
      </span>
      <span
        className={`block text-xs font-medium italic ${
          isFooter ? "text-brand-sky" : "text-brand-red"
        }`}
      >
        {business.slogan}
      </span>
    </span>
  );

  const inner = (
    <>
      {isFooter ? <div className="rounded-md bg-white p-2">{icon}</div> : icon}
      {label}
    </>
  );

  const className = "flex items-center gap-3 shrink-0";

  if (!linked) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link href="/" className={className} aria-label={`${displayName} — Home`}>
      {inner}
    </Link>
  );
}
