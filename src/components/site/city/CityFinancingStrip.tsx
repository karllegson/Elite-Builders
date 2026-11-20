import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { cityPageShared } from "@/lib/site/cityPages";

/** One-line financing teaser for homeowners — placed right before the estimate form. */
export function CityFinancingStrip() {
  const { body, href } = cityPageShared.financing;

  return (
    <div className="bg-white">
      <div className="site-container pb-10 sm:pb-12">
        <div className="flex flex-col gap-4 rounded-2xl border border-solid border-site-line bg-site-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-site-text-dark sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-navy">
              <Wallet size={19} aria-hidden />
            </span>
            {body}
          </p>
          <Link href={href} className="link-arrow shrink-0 self-start sm:self-auto">
            See financing options
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
