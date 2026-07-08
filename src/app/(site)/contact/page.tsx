import type { Metadata } from "next";
import { Phone } from "lucide-react";
import ContactForm from "@/components/site/ContactForm";
import { business } from "@/lib/site/config";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Contact Elite Builders for a free framing, remodeling, siding, or deck estimate. Serving the Bay Area, Central Valley, and Southern California. CSLB #970551.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="bg-brand-navy py-16 text-white sm:py-20">
        <div className="site-container">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            Contact Us
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Request a Free Estimate or Ask a Question
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            Tell us about your framing, remodeling, siding, or deck project. We respond within one
            business day. {business.license}.
          </p>
        </div>
      </section>

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
