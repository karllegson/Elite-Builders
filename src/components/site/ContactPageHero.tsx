import Image from "next/image";
import { business } from "@/lib/site/config";

const GROUP_PHOTO = {
  src: "/images/team/group-photo.webp",
  alt: "Elite Builders team group photo",
} as const;

export default function ContactPageHero() {
  return (
    <section className="contact-page-hero bg-gray-50">
      <div className="contact-page-hero-grid">
        <div className="contact-page-hero-copy">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            Contact Us
          </p>
          <h1 className="contact-page-hero-title mt-3 max-w-xl text-3xl font-bold leading-tight text-brand-navy sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            Request a Free Estimate or Ask a Question
          </h1>
          <div className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-gray-600">
            <p>
              Tell us about your framing, siding, or deck project. Whether you need custom framing,
              a home addition, or structural work for a remodel, our team is ready to help.
            </p>
            <p>
              We respond within one business day with straight answers and clear next steps.{" "}
              {business.license}.
            </p>
          </div>
        </div>

        <div className="contact-page-hero-media">
          <Image
            src={GROUP_PHOTO.src}
            alt={GROUP_PHOTO.alt}
            fill
            priority
            quality={90}
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="contact-page-hero-photo"
            style={{ objectPosition: "4% 42%" }}
          />
          <div className="contact-page-hero-fade" aria-hidden />
        </div>
      </div>
    </section>
  );
}
