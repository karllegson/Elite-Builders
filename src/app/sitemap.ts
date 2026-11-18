import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/site/sitemapEntries";

// Built on each request so pages published from the dashboard show up straight away.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries();
}
