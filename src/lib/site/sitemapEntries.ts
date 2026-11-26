import type { MetadataRoute } from "next";
import { loadServiceAreasStore } from "@/lib/admin/serviceAreas.server";
import { listPublishedPublicPosts } from "@/lib/admin/posts.server";
import {
  isServiceAreaSubPage,
  isTopLevelServiceArea,
} from "@/lib/admin/serviceAreasData";
import { serviceAreas as staticServiceAreas, services } from "@/lib/site/config";
import { SITE_URL } from "@/lib/site/seo";
import { getServiceAreaPublicHref } from "@/lib/site/serviceAreaUrls";
import {
  MOVED_SERVICE_AREA_PATHS,
  SERVICE_LANDING_ROUTES,
} from "@/lib/site/serviceLandingPages";
import { getAllServiceSubPages } from "@/lib/site/serviceSubPages";

const STATIC_ROUTES = [
  "",
  "/about",
  "/contact",
  "/projects",
  "/financing",
  "/services",
  "/service-areas",
  "/blog",
] as const;

function sitemapUrl(
  path: string,
  options: {
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
    lastModified?: Date;
  },
): MetadataRoute.Sitemap[number] {
  const normalizedPath = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;

  return {
    url: normalizedPath === "" ? SITE_URL : `${SITE_URL}${normalizedPath}`,
    lastModified: options.lastModified ?? new Date(),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
  };
}

/** Top-level /service-areas pages that redirect elsewhere (e.g. bay-area → /service-areas). */
function isMovedServiceArea(slug: string) {
  return `/service-areas/${slug}` in MOVED_SERVICE_AREA_PATHS;
}

/** Records without a saved date default to 1970; leave those to "now". */
function savedDate(updatedAt: string | undefined): Date | undefined {
  return updatedAt && !updatedAt.startsWith("1970") ? new Date(updatedAt) : undefined;
}

async function getServiceAreaSitemapEntries(): Promise<{
  entries: MetadataRoute.Sitemap;
  /** Last edit of the dashboard-built page shown at a /services route, keyed by route. */
  serviceLandingUpdatedAt: Map<string, Date>;
}> {
  const serviceLandingUpdatedAt = new Map<string, Date>();

  try {
    const store = await loadServiceAreasStore();
    const entries: MetadataRoute.Sitemap = [];

    for (const area of store.areas) {
      if (area.status !== "published" || area.hidden || area.unused) {
        continue;
      }

      if (!isTopLevelServiceArea(area) && !isServiceAreaSubPage(area)) {
        continue;
      }

      if (isTopLevelServiceArea(area)) {
        // Service landing pages are listed once, under their /services URL.
        const landingRoute = SERVICE_LANDING_ROUTES[area.slug];
        if (landingRoute) {
          const updatedAt = savedDate(area.updatedAt);
          if (updatedAt) serviceLandingUpdatedAt.set(landingRoute, updatedAt);
          continue;
        }

        if (isMovedServiceArea(area.slug)) {
          continue;
        }
      }

      entries.push(
        sitemapUrl(getServiceAreaPublicHref(area, store.areas), {
          changeFrequency: "monthly",
          priority: isServiceAreaSubPage(area) ? 0.65 : 0.7,
          lastModified: savedDate(area.updatedAt),
        }),
      );
    }

    if (entries.length > 0) {
      return { entries, serviceLandingUpdatedAt };
    }
  } catch {
    // Fall back to static config when the store is unavailable at build time.
  }

  return {
    entries: staticServiceAreas
      .filter((area) => !isMovedServiceArea(area.slug))
      .map((area) =>
        sitemapUrl(area.href, {
          changeFrequency: "monthly",
          priority: 0.7,
        }),
      ),
    serviceLandingUpdatedAt,
  };
}

async function getBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await listPublishedPublicPosts();

    return posts.map((post) =>
      sitemapUrl(`/blog/${post.slug}`, {
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: new Date(post.updatedAt ?? post.publishedAt ?? post.createdAt),
      }),
    );
  } catch {
    return [];
  }
}

/** All indexable public URLs for /sitemap.xml (Phase 1 SEO foundation). */
export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const [{ entries: serviceAreaEntries, serviceLandingUpdatedAt }, blogEntries] =
    await Promise.all([getServiceAreaSitemapEntries(), getBlogSitemapEntries()]);

  return [
    ...STATIC_ROUTES.map((path) =>
      sitemapUrl(path, {
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
      }),
    ),
    ...services.map((service) =>
      sitemapUrl(service.href, {
        changeFrequency: "monthly",
        priority: 0.8,
        lastModified: serviceLandingUpdatedAt.get(service.href),
      }),
    ),
    ...getAllServiceSubPages().map((subPage) =>
      sitemapUrl(subPage.href, {
        changeFrequency: "monthly",
        priority: 0.75,
        lastModified: serviceLandingUpdatedAt.get(subPage.href),
      }),
    ),
    ...serviceAreaEntries,
    ...blogEntries,
  ];
}
