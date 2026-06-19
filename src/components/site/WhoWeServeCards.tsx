import ContentImage from "@/components/site/ContentImage";

const audienceImages = [
  {
    src: "/images/who-we-serve/homeowners.png",
    alt: "Homeowner standing in front of a finished custom home built by Elite Builders",
  },
  {
    src: "/images/who-we-serve/builders-gc.png",
    alt: "General contractor with blueprints on a residential construction job site",
  },
] as const;

type AudienceCard = {
  title: string;
  body: string;
};

export default function WhoWeServeCards({ items }: { items: readonly AudienceCard[] }) {
  return (
    <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:mt-14 md:grid-cols-2 md:gap-8">
      {items.map(({ title, body }, index) => {
        const image = audienceImages[index] ?? audienceImages[0];

        return (
          <article
            key={title}
            className="overflow-hidden rounded-xl border border-solid border-gray-200/90 bg-white shadow-[0_8px_30px_-20px_rgba(0,32,91,0.35)] sm:rounded-2xl"
          >
            <ContentImage
              src={image.src}
              alt={image.alt}
              className="aspect-[16/10] sm:aspect-[3/2]"
              objectFit="contain"
              sizes="(max-width: 768px) 100vw, 560px"
              quality={88}
            />

            <div className="px-4 py-4 sm:px-8 sm:py-7">
              <span className="block h-0.5 w-8 bg-brand-red sm:w-10" aria-hidden />
              <h3 className="mt-3 font-display text-base font-bold leading-snug text-brand-navy sm:mt-5 sm:text-xl">
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:mt-3 sm:text-[15px]">
                {body}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
