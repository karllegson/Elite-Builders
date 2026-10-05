import Image from "next/image";
import { ArrowRight, Phone } from "lucide-react";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";

type CtaBandProps = {
  title?: string;
  body?: string;
};

/** Closing call-to-action panel used at the bottom of inner pages. */
export default function CtaBand({
  title = "Ready to start your project?",
  body = "Tell us about your project and we'll respond within one business day — no pressure, no obligation.",
}: CtaBandProps) {
  const image = homeImages.residentialWallFramingSky;

  return (
    <section className="section-sm bg-white">
      <div className="site-container">
        <div className="bg-ink relative isolate overflow-hidden rounded-3xl px-6 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <Image
            src={image.src}
            alt=""
            fill
            quality={75}
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="-z-20 object-cover opacity-40"
            aria-hidden
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-ink via-brand-ink/90 to-brand-ink/50"
            aria-hidden
          />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="eyebrow eyebrow-light">Free Estimate</p>
              <h2 className="section-title mt-4 text-white">{title}</h2>
              <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">{body}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <EstimateCtaLink href="/#estimate" className="btn btn-primary btn-lg">
                Request a Free Estimate
                <ArrowRight size={18} aria-hidden className="btn-arrow" />
              </EstimateCtaLink>
              <a href={business.phoneHref} className="btn btn-glass btn-lg">
                <Phone size={17} aria-hidden />
                {business.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
