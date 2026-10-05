import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/site/ContactForm";
import ContactPageHero from "@/components/site/ContactPageHero";
import { business } from "@/lib/site/config";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Contact Elite Builders for a free framing or home building estimate. Serving the Bay Area, Central Valley, and Southern California. CSLB #970551.",
  path: "/contact",
});

const contactMethods = [
  {
    icon: Phone,
    label: "Phone",
    value: business.phone,
    href: business.phoneHref,
  },
  {
    icon: Mail,
    label: "Email",
    value: business.email,
    href: `mailto:${business.email}`,
  },
  {
    icon: MapPin,
    label: "Office",
    value: business.address.full,
  },
];

export default function ContactPage() {
  return (
    <>
      <ContactPageHero />

      <section className="section bg-site-surface">
        <div className="site-container grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-14">
          <ContactForm formType="contact" />

          <aside className="grid gap-4 lg:sticky lg:top-28">
            <div className="rounded-3xl bg-white p-7 sm:p-8">
              <h2 className="font-display text-xl font-bold">Reach Elite Builders</h2>
              <ul className="mt-6 grid gap-3">
                {contactMethods.map(({ icon: Icon, label, value, href }) => {
                  const inner = (
                    <>
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-site-surface text-brand-red transition-colors group-hover:bg-brand-red group-hover:text-white">
                        <Icon size={19} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium uppercase tracking-[0.14em] text-site-text-muted">
                          {label}
                        </span>
                        <span className="mt-0.5 block break-words font-display font-semibold text-brand-ink">
                          {value}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-site-surface"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div className="flex items-center gap-4 p-2">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-ink bg-blueprint rounded-3xl p-7 sm:p-8">
              <p className="eyebrow eyebrow-light">Our Promise</p>
              <p className="mt-3 font-display text-lg font-semibold leading-snug text-white">
                We respond within one business day — no pressure, no obligation.
              </p>
              <p className="mt-3 text-sm text-white/60">Licensed &amp; insured · {business.license}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
