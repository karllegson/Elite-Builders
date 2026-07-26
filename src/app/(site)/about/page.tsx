import type { Metadata } from "next";
import Image from "next/image";
import PagePlaceholder from "@/components/site/PagePlaceholder";
import { TeamHeadshotImage } from "@/components/site/TeamHeadshotImage";
import { teamMembers } from "@/lib/site/config";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Us",
  description:
    "Meet Elite Builders — family-owned framing-first specialists since 2012, serving the Bay Area, Central Valley, and Southern California with integrity and precision.",
  path: "/about",
});

export default function AboutPage() {
  const fernando = teamMembers.find((member) => member.id === "fernando-gradilla");

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

        {fernando ? (
          <div id="fernando-gradilla" className="mx-auto max-w-2xl scroll-mt-28">
            <div className="rounded-2xl border border-solid border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {fernando.imageSrc ? (
                  <TeamHeadshotImage
                    member={fernando}
                    frameClassName="size-32 shrink-0 ring-4 ring-white shadow-md sm:size-40"
                    sizes="(max-width: 640px) 128px, 160px"
                    priority
                  />
                ) : null}
                <div className="min-w-0 text-center sm:text-left">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
                    {fernando.role}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-site-text-dark">{fernando.name}</h2>
                  <p className="mt-4 leading-relaxed text-site-text">
                    {fernando.profile?.bio ??
                      "Fernando founded Elite Builders with a simple standard: communicate clearly, frame with precision, and do the right thing even when it's the harder path."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
