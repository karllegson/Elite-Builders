import type { Metadata } from "next";
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
      <div id="fernando-gradilla" className="site-container scroll-mt-28 pb-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-solid border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">Owner</p>
          <h2 className="mt-2 text-2xl font-bold text-site-text-dark">Fernando Gradilla</h2>
          <p className="mt-4 leading-relaxed text-site-text">
            Fernando founded Elite Builders with a simple standard: communicate clearly,
            frame with precision, and do the right thing even when it&apos;s the harder path. More of
            his story is coming soon.
          </p>
        </div>
      </div>
    </>
  );
}
