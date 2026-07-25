import type { Metadata } from "next";
import { Phone } from "lucide-react";
import ContactForm from "@/components/site/ContactForm";
import ContactPageHero from "@/components/site/ContactPageHero";
import { business } from "@/lib/site/config";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Contact Elite Builders for a free framing, siding, or deck estimate. Serving the Bay Area, Central Valley, and Southern California. CSLB #970551.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <ContactPageHero />

      <section className="bg-white py-12 sm:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <ContactForm formType="contact" />

          <aside className="rounded-xl border border-solid border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-brand-navy">Reach Elite Builders</h2>
            <div className="mt-6 space-y-5 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-brand-navy">Phone</p>
                <a
                  href={business.phoneHref}
                  className="mt-1 inline-flex items-center gap-2 font-bold text-brand-blue hover:text-brand-blue-dark"
                >
                  <Phone size={16} aria-hidden />
                  {business.phone}
                </a>
              </div>
              <div>
                <p className="font-semibold text-brand-navy">Email</p>
                <a
                  href={`mailto:${business.email}`}
                  className="mt-1 block text-brand-blue hover:text-brand-blue-dark"
                >
                  {business.email}
                </a>
              </div>
              <div>
                <p className="font-semibold text-brand-navy">Office</p>
                <p className="mt-1 leading-relaxed">
                  {business.address.street}
                  <br />
                  {business.address.city}, {business.address.state} {business.address.zip}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
