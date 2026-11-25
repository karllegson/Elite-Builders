import ContentImage from "@/components/site/ContentImage";
import SectionIntro from "@/components/site/SectionIntro";
import { homeImages, homepageGalleryImageKeys, type HomeImageKey } from "@/lib/site/images";

/**
 * Mosaic spans for the 11 photos: 16 cells, so the grid fills with no gaps at both
 * 2 columns (8 rows) and 4 columns (4 rows). Masonry columns left a ragged edge.
 */
const tileSpans: Record<number, string> = {
  0: "col-span-2 row-span-2",
  5: "row-span-2",
  8: "col-span-2",
};

/** Keep faces in frame where a tile crops a photo hard (e.g. the wide tile). */
const tilePositions: Partial<Record<HomeImageKey, string>> = {
  mammothRoofFramingCrew: "center 12%",
  mammothTopPlateTieOff: "center 35%",
  mammothTrussFramingHarness: "center 20%",
};

/** Scroll-reveal stagger, so a row of tiles rises left to right instead of all at once. */
const tileStagger = ["[--reveal-i:0]", "[--reveal-i:1]", "[--reveal-i:2]", "[--reveal-i:3]"];

/**
 * Job-site photo gallery (real Elite Builders photos). Keeps the #reviews anchor (top-bar
 * "Reviews" link): no real reviews exist yet, so this shows work instead of invented testimonials.
 */
export default function HomeGallerySection() {
  return (
    <section id="reviews" className="section scroll-mt-28 bg-white">
      <div className="site-container">
        <SectionIntro eyebrow="Our Work" title="On the Job Site" className="reveal-up" />

        <div className="mt-12 grid grid-flow-dense auto-rows-[9rem] grid-cols-2 gap-3 sm:mt-16 sm:auto-rows-[12rem] sm:grid-cols-4 sm:gap-4 lg:auto-rows-[14rem]">
          {homepageGalleryImageKeys.map((key, index) => (
            <ContentImage
              key={key}
              src={homeImages[key].src}
              alt={homeImages[key].alt}
              className={`img-zoom reveal-rise h-full rounded-2xl ${tileStagger[index % 4]} ${tileSpans[index] ?? ""}`}
              objectPosition={tilePositions[key]}
              // Tiles spanning two columns (the lead and the wide one) need a 2-column image, or they blur.
              sizes={
                tileSpans[index]?.includes("col-span-2")
                  ? "(max-width: 640px) 100vw, 50vw"
                  : "(max-width: 640px) 50vw, 25vw"
              }
              quality={85}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
