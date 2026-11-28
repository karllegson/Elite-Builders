import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import JsonLd from "@/components/site/JsonLd";
import { ServiceAreaSubPageView } from "@/components/site/ServiceAreaSubPageView";
import {
  getPublishedPublicServiceAreaSubPage,
  listPublishedServiceAreaPathSegments,
} from "@/lib/admin/serviceAreas.server";
import { business } from "@/lib/site/config";
import { loadFaqsForContent } from "@/lib/site/serviceAreaFaqs.server";
import { buildPageMetadata } from "@/lib/site/seo";
import type { PublicServiceAreaSubPage } from "@/lib/site/serviceAreasPublic";
import { breadcrumbSchema, serviceSchema } from "@/lib/site/structuredData";

// Cached for an hour; dashboard saves refresh it right away (revalidatePath).
export const revalidate = 3600;
// Sub-pages added after the build still render on first visit.
export const dynamicParams = true;

export async function generateStaticParams() {
  const paths = await listPublishedServiceAreaPathSegments();
  return paths
    .filter((segments) => segments.length === 2)
    .map(([city, subpage]) => ({ city, subpage }));
}

type ServiceAreaSubPageProps = PageProps<"/service-areas/[city]/[subpage]">;

/**
 * Loads the page once per request from the server-side store (shared by metadata
 * and the page). `undefined` means the store couldn't be read, so the browser loads it.
 */
const loadSubPage = cache(
  async (city: string, subpage: string): Promise<PublicServiceAreaSubPage | null | undefined> => {
    try {
      return await getPublishedPublicServiceAreaSubPage(city, subpage);
    } catch {
      return undefined;
    }
  },
);

function describeSubPage(page: PublicServiceAreaSubPage) {
  return (
    page.metaDescription ||
    `${page.title}: framing and construction from Elite Builders IX in ${page.parent.city}, CA. Licensed ${business.license}. Free estimates.`
  );
}

export async function generateMetadata(props: ServiceAreaSubPageProps): Promise<Metadata> {
  const { city, subpage } = await props.params;
  const page = await loadSubPage(city, subpage);
  const path = `/service-areas/${city}/${subpage}`;

  if (page === null) {
    return buildPageMetadata({
      title: "Page Not Found",
      description: "The requested service area page could not be found.",
      path,
      noIndex: true,
    });
  }

  if (!page) {
    return buildPageMetadata({
      title: `${subpage.replace(/-/g, " ")} ${city.replace(/-/g, " ")}`,
      description: `Framing and construction services from Elite Builders IX. Licensed ${business.license}.`,
      path,
    });
  }

  return buildPageMetadata({
    title: page.seoTitle?.trim() || page.title,
    description: describeSubPage(page),
    path,
  });
}

export default async function ServiceAreaSubPage(props: ServiceAreaSubPageProps) {
  const { city, subpage } = await props.params;
  const page = await loadSubPage(city, subpage);

  if (page === null) {
    // Parent city renamed to a "-ca" slug: send old sub-page links to the new address.
    if (!city.endsWith("-ca") && (await loadSubPage(`${city}-ca`, subpage))) {
      permanentRedirect(`/service-areas/${city}-ca/${subpage}`);
    }
    notFound();
  }

  const path = `/service-areas/${city}/${subpage}`;
  const initialFaqItems = page?.content ? await loadFaqsForContent(page.content) : undefined;

  return (
    <>
      {page ? (
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Service Areas", path: "/service-areas" },
              { name: page.parent.title, path: page.parent.href },
              { name: page.title, path },
            ]),
            serviceSchema({
              name: page.title,
              path,
              description: describeSubPage(page),
              city: page.parent.city,
            }),
          ]}
        />
      ) : null}
      <ServiceAreaSubPageView
        parentSlug={city}
        subPageSlug={subpage}
        initialPage={page}
        initialFaqItems={initialFaqItems}
      />
    </>
  );
}
