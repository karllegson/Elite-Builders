"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { isEstimateAnchorHref, scrollToEstimateSection } from "@/lib/site/estimateAnchor";

type EstimateCtaLinkProps = ComponentProps<typeof Link>;

export default function EstimateCtaLink({
  href,
  onClick,
  ...props
}: EstimateCtaLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hrefString = typeof href === "string" ? href : "";

  if (!hrefString || !isEstimateAnchorHref(hrefString)) {
    return <Link href={href} onClick={onClick} {...props} />;
  }

  return (
    <Link
      href="/#estimate"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }

        event.preventDefault();

        if (pathname === "/") {
          if (scrollToEstimateSection(true)) {
            window.history.pushState(null, "", "#estimate");
          }
          return;
        }

        router.push("/#estimate");
      }}
      {...props}
    />
  );
}
