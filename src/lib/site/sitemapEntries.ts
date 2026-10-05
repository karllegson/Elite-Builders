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
import { SERVICE_LANDING_ROUTES } from "@/lib/site/serviceLandingPages";
import { getAllServiceSubPages } from "@/lib/site/serviceSubPages";

const STATIC_ROUTES = [
  "",
  "/about",
  "/contact",
  "/projects",
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

async function getServiceAreaSitemapEntries(): Promise<{
  entries: MetadataRoute.Sitemap;
  /** Built-in /services routes that redirect to a dashboard-built page. */
  replacedServiceRoutes: Set<string>;
}> {
  const replacedServiceRoutes = new Set<string>();

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

      if (isTopLevelServiceArea(area) && SERVICE_LANDING_ROUTES[area.slug]) {
        replacedServiceRoutes.add(SERVICE_LANDING_ROUTES[area.slug]);
      }

      entries.push(
        sitemapUrl(getServiceAreaPublicHref(area, store.areas), {
          changeFrequency: "monthly",
          priority: isServiceAreaSubPage(area) ? 0.65 : 0.7,
        }),
      );
    }

    if (entries.length > 0) {
      return { entries, replacedServiceRoutes };
    }
  } catch {
    // Fall back to static config when the store is unavailable at build time.
  }

  return {
    entries: staticServiceAreas.map((area) =>
      sitemapUrl(area.href, {
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
    replacedServiceRoutes,
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
  const [{ entries: serviceAreaEntries, replacedServiceRoutes }, blogEntries] =
    await Promise.all([getServiceAreaSitemapEntries(), getBlogSitemapEntries()]);
  const isLive = (href: string) => !replacedServiceRoutes.has(href);

  return [
    ...STATIC_ROUTES.map((path) =>
      sitemapUrl(path, {
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
      }),
    ),
    ...services.filter((service) => isLive(service.href)).map((service) =>
      sitemapUrl(service.href, {
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    ),
    ...getAllServiceSubPages()
      .filter((subPage) => isLive(subPage.href))
      .map((subPage) =>
      sitemapUrl(subPage.href, {
        changeFrequency: "monthly",
        priority: 0.75,
      }),
    ),
    ...serviceAreaEntries,
    ...blogEntries,
  ];
}
