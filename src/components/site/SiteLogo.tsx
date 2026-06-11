import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/site/config";

type SiteLogoProps = {
  variant?: "header" | "footer";
  linked?: boolean;
};

export default function SiteLogo({ variant = "header", linked = true }: SiteLogoProps) {
  const isFooter = variant === "footer";

  const icon = (
    <Image
      src="/logo.png"
      alt=""
      width={64}
      height={64}
      priority={variant === "header"}
      quality={95}
      className={`shrink-0 object-contain ${isFooter ? "size-12" : "size-14"}`}
    />
  );

  const label = (
    <span className="leading-tight">
        <span
          className={`font-display block text-lg font-semibold tracking-tight ${
            isFooter ? "text-white" : "text-site-text-dark sm:text-xl"
          }`}
        >
        {business.displayName}
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
    <Link href="/" className={className} aria-label={`${business.displayName} — Home`}>
      {inner}
    </Link>
  );
}
