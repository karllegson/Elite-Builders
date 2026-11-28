import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/site/sitemapEntries";

// Cached for an hour; dashboard saves refresh it right away (revalidatePath).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries();
}
