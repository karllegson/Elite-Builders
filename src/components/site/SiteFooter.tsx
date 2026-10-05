import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import SiteLogo from "@/components/site/SiteLogo";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import {
  aboutNavLinks,
  business,
  featuredFooterServiceAreas,
  services,
} from "@/lib/site/config";
import { framingFirstTagline } from "@/lib/site/messaging";

const uniqueServices = services.filter(
  (service, index) => services.findIndex((s) => s.href === service.href) === index
);

const companyLinks = [{ label: "Projects", href: "/projects" }, ...aboutNavLinks];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
      {children}
    </h2>
  );
}

const footerLink = "text-white/75 transition-colors hover:text-white";

export default function SiteFooter() {
  return (
    <footer className="bg-ink relative overflow-hidden border-t border-solid border-white/10">
      <div className="bg-blueprint pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      <div className="site-container relative">
        {/* Headline row */}
        <div className="flex flex-col gap-8 border-b border-solid border-white/10 py-14 sm:py-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <SiteLogo variant="footer" linked={false} />
            <p className="mt-6 font-display text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              {framingFirstTagline}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <EstimateCtaLink href="/#estimate" className="btn btn-primary">
              Request a Free Estimate
              <ArrowRight size={16} aria-hidden className="btn-arrow" />
            </EstimateCtaLink>
            <a href={business.phoneHref} className="btn btn-glass">
              <Phone size={16} aria-hidden />
              {business.phone}
            </a>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <FooterHeading>Contact</FooterHeading>
            <ul className="mt-5 space-y-4 text-[0.9375rem]">
              <li>
                <a href={business.phoneHref} className={`flex items-center gap-3 ${footerLink}`}>
                  <Phone size={16} aria-hidden className="shrink-0 text-brand-red" />
                  {business.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className={`flex items-center gap-3 break-all ${footerLink}`}
                >
                  <Mail size={16} aria-hidden className="shrink-0 text-brand-red" />
                  {business.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/75">
                <MapPin size={16} aria-hidden className="mt-1 shrink-0 text-brand-red" />
                <span>{business.address.full}</span>
              </li>
            </ul>
            <p className="mt-6 inline-flex rounded-full border border-solid border-white/15 px-3 py-1 text-xs font-medium text-white/60">
              Licensed &amp; insured · {business.license}
            </p>
          </div>

          <nav aria-label="Footer services">
            <FooterHeading>Services</FooterHeading>
            <ul className="mt-5 space-y-3 text-[0.9375rem]">
              {uniqueServices.map((service) => (
                <li key={service.href}>
                  <Link href={service.href} className={footerLink}>
                    {service.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="font-semibold text-white hover:text-brand-sky">
                  All Services →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer service areas">
            <FooterHeading>Service Areas</FooterHeading>
            <ul className="mt-5 space-y-3 text-[0.9375rem]">
              {featuredFooterServiceAreas.map((area) => (
                <li key={area.slug}>
                  <Link href={area.href} className={footerLink}>
                    {area.city === "Bay Area" ? "Bay Area" : `${area.city}, CA`}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/service-areas" className="font-semibold text-white hover:text-brand-sky">
                  All Service Areas →
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer company" className="col-span-2 sm:col-span-1">
            <FooterHeading>Company</FooterHeading>
            <ul className="mt-5 space-y-3 text-[0.9375rem]">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="relative border-t border-solid border-white/10">
        <div className="site-container flex flex-col items-center justify-between gap-2 pb-28 pt-6 text-xs text-white/45 sm:flex-row sm:pb-6">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <p className="text-center">
            Framing-First Contractor · Bay Area · Central Valley · Southern California
          </p>
          <p>
            Website by{" "}
            <a
              href="https://legsonmedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-white"
            >
              Legson Media
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
