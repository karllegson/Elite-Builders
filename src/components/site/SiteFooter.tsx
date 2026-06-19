import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import SiteLogo from "@/components/site/SiteLogo";
import { business, featuredFooterServiceAreas, services } from "@/lib/site/config";
import { framingFirstTagline } from "@/lib/site/messaging";

const uniqueServices = services.filter(
  (service, index) => services.findIndex((s) => s.href === service.href) === index
);

export default function SiteFooter() {
  return (
    <footer className="bg-brand-navy text-white">
      <div className="site-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <SiteLogo variant="footer" linked={false} />
          <p className="mt-4 text-sm leading-relaxed text-white/70">{business.companyStory}</p>
          <p className="mt-3 text-xs font-semibold leading-relaxed text-brand-sky">{framingFirstTagline}</p>
          <p className="mt-4 text-xs text-white/50">{business.license}</p>
        </div>

        {/* Services */}
        <nav aria-label="Footer services">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-red">
            Services
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {uniqueServices.map((service) => (
              <li key={service.href}>
                <Link href={service.href} className="text-white/80 hover:text-white">
                  {service.title}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/services" className="font-semibold text-white hover:text-white/80">
                All Services →
              </Link>
            </li>
          </ul>
        </nav>

        {/* Service areas */}
        <nav aria-label="Footer service areas">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-red">
            Service Areas
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {featuredFooterServiceAreas.map((area) => (
              <li key={area.slug}>
                <Link href={area.href} className="text-white/80 hover:text-white">
                  {area.city === "Bay Area" ? "Bay Area" : `${area.city}, CA`}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/service-areas" className="font-semibold text-white hover:text-white/80">
                See All Service Areas →
              </Link>
            </li>
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-red">
            Contact Us
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={business.phoneHref}
                className="flex items-center gap-2.5 text-white/80 hover:text-white"
              >
                <Phone size={16} aria-hidden className="shrink-0 text-brand-red" />
                {business.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2.5 text-white/80 hover:text-white"
              >
                <Mail size={16} aria-hidden className="shrink-0 text-brand-red" />
                {business.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-white/80">
              <MapPin size={16} aria-hidden className="mt-0.5 shrink-0 text-brand-red" />
              <span>{business.address.full}</span>
            </li>
          </ul>
          <Link
            href="/#estimate"
            className="mt-6 inline-block rounded-md bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark"
          >
            Request a Free Estimate
          </Link>
        </div>
      </div>

      <div className="border-t border-solid border-white/10">
        <div className="site-container flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
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
