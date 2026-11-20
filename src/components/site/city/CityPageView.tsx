import CtaBand from "@/components/site/CtaBand";
import { ServiceAreaContentPanel } from "@/components/site/ServiceAreaContentPanel";
import { CityAreasServed } from "@/components/site/city/CityAreasServed";
import { CityBuilderBand } from "@/components/site/city/CityBuilderBand";
import { CityEstimateSection } from "@/components/site/city/CityEstimateSection";
import { CityFaq, type CityFaqItem } from "@/components/site/city/CityFaq";
import { CityFinancingStrip } from "@/components/site/city/CityFinancingStrip";
import { CityHero } from "@/components/site/city/CityHero";
import { CityLocalIntro } from "@/components/site/city/CityLocalIntro";
import { CityProcess } from "@/components/site/city/CityProcess";
import { CityProjects } from "@/components/site/city/CityProjects";
import { CityReviews } from "@/components/site/city/CityReviews";
import { CityServices } from "@/components/site/city/CityServices";
import { CityTrustBar } from "@/components/site/city/CityTrustBar";
import { CityWhyFramingFirst } from "@/components/site/city/CityWhyFramingFirst";
import type { CityPageConfig } from "@/lib/site/cityPages";
import { extractCityQuickLinks } from "@/lib/site/cityQuickLinks";
import { buildCityPageSchema, serializeJsonLd } from "@/lib/site/citySchema";
import type { Project } from "@/lib/site/projects";
import type { PublicReviewItem } from "@/lib/site/reviewsPublic";
import type { PublicServiceArea } from "@/lib/site/serviceAreasPublic";

type CityPageViewProps = {
  config: CityPageConfig;
  /** CMS record for this page (null only if the CMS store could not be reached). */
  area: PublicServiceArea | null;
  path: string;
  faqItems: CityFaqItem[];
  reviews: PublicReviewItem[];
  projects: Project[];
  publishedHrefs: Map<string, string>;
  /** Logged-in admin: show [CLIENT TO PROVIDE] notes for missing content. */
  showDrafts: boolean;
};

export function CityPageView({
  config,
  area,
  path,
  faqItems,
  reviews,
  projects,
  publishedHrefs,
  showDrafts,
}: CityPageViewProps) {
  const cityLabel = `${config.city}, CA`;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Service Areas", href: "/service-areas" },
    { label: cityLabel },
  ];

  // A featured image set in the dashboard wins over the config image.
  const heroImage = area?.featuredImage?.src
    ? {
        src: area.featuredImage.src,
        alt: area.featuredImage.alt || config.hero.image.alt,
      }
    : config.hero.image;
  const heroTodo = area?.featuredImage?.src ? undefined : config.hero.imageTodo;

  const answeredFaqs = faqItems.filter((item) => !item.todo);
  const schemaServices = config.services
    .filter((service) => !service.pending)
    .map((service) => ({ name: service.title, path: service.href }));

  const schema = buildCityPageSchema({
    path,
    pageTitle: config.seo.title,
    description: config.seo.description,
    city: config.city,
    county: config.county,
    breadcrumbs: breadcrumbs.map((crumb) => ({ name: crumb.label, path: crumb.href ?? path })),
    nearbyCities: config.areas.nearbyCities.map((nearby) => nearby.name),
    services: schemaServices,
    faqs: answeredFaqs.map((item) => ({ question: item.question, answer: item.answer })),
    imageUrl: heroImage.src,
  });

  // The page's own "On this page" panel replaces the in-content Quick Links box + pinned dock.
  const hasCmsContent = Boolean(area?.content.trim());
  const cmsContent = hasCmsContent ? (
    <ServiceAreaContentPanel content={area!.content} mapEmbed="" />
  ) : null;
  const toc = hasCmsContent
    ? {
        links: extractCityQuickLinks(area!.content),
        // Template sections below the dashboard content. Links to sections that aren't
        // rendered (e.g. no projects) are dropped by the panel on load.
        moreLinks: [
          { href: "#city-projects-heading", label: "Recent work" },
          { href: "#city-process-heading", label: "How it works" },
          { href: "#city-areas-heading", label: "Areas we serve" },
        ],
      }
    : undefined;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />

      <CityHero
        hero={{ ...config.hero, imageTodo: heroTodo }}
        image={heroImage}
        breadcrumbs={breadcrumbs}
        showDrafts={showDrafts}
      />
      <CityTrustBar showDrafts={showDrafts} />
      <CityLocalIntro
        intro={config.localIntro}
        isHomeBase={config.isHomeBase}
        showDrafts={showDrafts}
        cmsContent={cmsContent}
        toc={toc}
      />
      <CityServices city={config.city} services={config.services} showDrafts={showDrafts} />
      <CityWhyFramingFirst />
      <CityProjects config={config.projects} projects={projects} showDrafts={showDrafts} />
      <CityProcess showDrafts={showDrafts} />
      <CityReviews city={config.city} reviews={reviews} showDrafts={showDrafts} />
      <CityBuilderBand band={config.builderBand} showDrafts={showDrafts} />
      <CityFinancingStrip />
      <CityEstimateSection city={config.city} estimate={config.estimate} showDrafts={showDrafts} />
      <CityFaq city={config.city} items={faqItems} showDrafts={showDrafts} />
      <CityAreasServed
        city={config.city}
        areas={config.areas}
        isHomeBase={config.isHomeBase}
        publishedHrefs={publishedHrefs}
        showDrafts={showDrafts}
      />
      <CtaBand title={config.finalCta.title} body={config.finalCta.body} />
    </>
  );
}
