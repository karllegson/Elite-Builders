import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site/seo";
import { serviceAreas, services } from "@/lib/site/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/projects",
    "/services",
    "/service-areas",
    "/blog",
    "/services/framing",
    "/services/remodeling",
    "/services/siding",
    "/services/decks",
    "/services/general-contracting",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.8,
    })),
    ...services.map((service) => ({
      url: `${SITE_URL}${service.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...serviceAreas.map((area) => ({
      url: `${SITE_URL}${area.href}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
