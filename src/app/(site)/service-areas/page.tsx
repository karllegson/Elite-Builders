import type { Metadata } from "next";
import CtaBand from "@/components/site/CtaBand";
import PageHero from "@/components/site/PageHero";
import { ServiceAreasGrid } from "@/components/site/ServiceAreasGrid";
import { listPublishedPublicServiceAreas } from "@/lib/admin/serviceAreas.server";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { buildPageMetadata } from "@/lib/site/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Service Areas: Bay Area & Central Valley",
  description:
    "Elite Builders serves the Bay Area, Central Valley, Southern California, and the Eastern Sierra for residential, new construction, rough, and structural framing plus custom home building. CSLB #970551.",
  path: "/service-areas",
});

export default async function ServiceAreasPage() {
  // Server-loaded so every city link is in the first HTML; empty means the browser loads it.
  const areas = await listPublishedPublicServiceAreas().catch(() => []);

  return (
    <>
      <PageHero
        eyebrow="Where We Work"
        title="Framing Contractor Serving Northern California"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Service Areas" }]}
        image={homeImages.bayAreaNorthBayService}
        lede={
          <p>
            Elite Builders IX serves the Bay Area, the Central Valley, and Southern California —
            plus the Eastern Sierra — with the manpower and resources to support multiple projects
            across the region. {business.license}.
          </p>
        }
      />

      <section className="section bg-white">
        <div className="site-container">
          <ServiceAreasGrid initialAreas={areas.length > 0 ? areas : undefined} />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
