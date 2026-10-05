import { ArrowRight } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";

const audienceImages = [
  {
    src: "/images/who-we-serve/homeowners.png",
    alt: "Homeowner standing in front of a finished custom home built by Elite Builders",
    objectPosition: "70% 30%",
  },
  {
    src: "/images/who-we-serve/builders-tract-framing-aerial.png",
    alt: "Aerial view of a large residential framing project with multiple homes under construction for production builders",
    objectPosition: "center",
  },
] as const;

type AudienceCard = {
  title: string;
  body: string;
};

export default function WhoWeServeCards({ items }: { items: readonly AudienceCard[] }) {
  return (
    <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2 lg:gap-8">
      {items.map(({ title, body }, index) => {
        const image = audienceImages[index] ?? audienceImages[0];

        return (
          <article
            key={title}
            className="group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-brand-ink sm:min-h-[32rem]"
          >
            <ContentImage
              src={image.src}
              alt={image.alt}
              className="img-zoom !absolute inset-0 -z-20 h-full"
              objectPosition={image.objectPosition}
              sizes="(max-width: 768px) 100vw, 640px"
              quality={85}
            />
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-ink via-brand-ink/55 to-brand-ink/0"
              aria-hidden
            />

            <div className="p-7 sm:p-10">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 font-display text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">{title}</h3>
              <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-white/80 sm:text-base">
                {body}
              </p>
              <EstimateCtaLink
                href="/#estimate"
                className="mt-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-white"
              >
                Start a conversation
                <ArrowRight
                  size={16}
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                />
              </EstimateCtaLink>
            </div>
          </article>
        );
      })}
    </div>
  );
}
