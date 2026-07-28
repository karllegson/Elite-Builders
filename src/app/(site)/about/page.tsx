import type { Metadata } from "next";
import Image from "next/image";
import PagePlaceholder from "@/components/site/PagePlaceholder";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description:
    "Meet Elite Builders — family-owned framing-first specialists since 2012, serving the Bay Area, Central Valley, and Southern California with integrity and precision.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PagePlaceholder title="About Elite Builders" />
      <div className="site-container scroll-mt-28 space-y-10 pb-24">
        <div className="overflow-hidden rounded-2xl border border-solid border-gray-200 bg-white shadow-sm">
          <Image
            src="/images/team/group-photo.webp"
            alt="Elite Builders team group photo"
            width={2800}
            height={1894}
            quality={95}
            sizes="(max-width: 1024px) 100vw, 1120px"
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      </div>
    </>
  );
}
