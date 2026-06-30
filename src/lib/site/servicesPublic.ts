import {
  normalizeServicePageRecord,
  readServicePagesStore,
  type ServicePageRecord,
  type ServicePagesStore,
} from "@/lib/admin/servicesData";
import { services as staticServices } from "@/lib/site/config";
import type { ServiceDetail } from "@/lib/site/scope";
import { serviceDetails, serviceOrder } from "@/lib/site/scope";

export { SERVICE_PAGES_CHANGED_EVENT } from "@/lib/admin/servicesData";

export type PublicServicePage = ServiceDetail & {
  id: string;
  title: string;
  href: string;
  sortOrder: number;
  shortDescription: string;
  image: ServiceDetail["heroImage"];
};

function resolveStaticServiceMeta(slug: string) {
  return staticServices.find((service) => service.slug === slug);
}

export function toPublicServicePage(record: ServicePageRecord): PublicServicePage | null {
  if (record.status !== "published") {
    return null;
  }

  const staticMeta = resolveStaticServiceMeta(record.slug);

  return {
    slug: record.slug,
    name: record.name,
    h1: record.h1,
    metaTitle: record.metaTitle,
    metaDescription: record.metaDescription,
    heroImage: record.heroImage,
    intro: record.intro,
    scopeHeading: record.scopeHeading,
    scope: record.scope,
    residential: record.residential,
    commercial: record.commercial,
    faqs: record.faqs,
    id: record.id,
    title: record.title,
    href: `/services/${record.slug}`,
    sortOrder: record.sortOrder,
    shortDescription:
      record.intro[0]?.trim() ||
      staticMeta?.shortDescription ||
      record.metaDescription ||
      record.name,
    image: record.heroImage,
  };
}

export function getPublicServicePagesFromStore(
  store: ServicePagesStore = readServicePagesStore(),
): PublicServicePage[] {
  return store.pages
    .map((page) => toPublicServicePage(normalizeServicePageRecord(page)))
    .filter((page): page is PublicServicePage => page !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
}

export function findPublicServicePageBySlug(
  slug: string,
  store: ServicePagesStore = readServicePagesStore(),
): PublicServicePage | null {
  const record = store.pages.find((page) => page.slug === slug);
  return record ? toPublicServicePage(normalizeServicePageRecord(record)) : null;
}

export function getPublicServicePagesFallback(): PublicServicePage[] {
  return serviceOrder
    .map((slug, index) => {
      const detail = serviceDetails[slug];
      const staticMeta = resolveStaticServiceMeta(slug);

      if (!detail) {
        return null;
      }

      return {
        ...detail,
        id: `services-${slug}`,
        title: detail.name,
        href: `/services/${slug}`,
        sortOrder: index,
        shortDescription: staticMeta?.shortDescription ?? detail.intro[0] ?? detail.name,
        image: detail.heroImage,
      } satisfies PublicServicePage;
    })
    .filter((page): page is PublicServicePage => page !== null);
}
