import { loadServiceAreasStore } from "@/lib/admin/serviceAreas.server";
import { listPublishedPublicPosts } from "@/lib/admin/posts.server";
import {
  resolveSeoItemHint,
  resolveSeoItemStatus,
  SEO_CHECKLIST_CATALOG,
  SEO_ROADMAP_PHASES,
  type SeoPriority,
} from "@/lib/admin/seoChecklistCatalog";
import { buildSitemapEntries } from "@/lib/site/sitemapEntries";
import { SITE_URL } from "@/lib/site/seo";

export type SeoCheckStatus = "pass" | "warn" | "pending" | "placeholder";

export type SeoChecklistItem = {
  id: string;
  label: string;
  description: string;
  status: SeoCheckStatus;
  priority: SeoPriority;
  phase?: number;
  hint?: string;
  href?: string;
  external?: boolean;
};

export type SeoChecklistGroup = {
  id: string;
  title: string;
  items: SeoChecklistItem[];
};

export type SeoRoadmapPhaseSummary = {
  phase: number;
  title: string;
  summary: string;
  totalItems: number;
  passItems: number;
};

export type SeoTechnicalFile = {
  id: string;
  label: string;
  path: string;
  url: string;
  status: "active" | "placeholder";
  description: string;
  source?: string;
  priority: SeoPriority;
};

export type SeoDashboardData = {
  siteUrl: string;
  sitemapUrlCount: number;
  publishedPostCount: number;
  postsMissingMetaDescription: number;
  publishedServiceAreaCount: number;
  serviceAreasMissingMetaDescription: number;
  ga4Configured: boolean;
  clarityConfigured: boolean;
  checklist: SeoChecklistGroup[];
  roadmap: SeoRoadmapPhaseSummary[];
  technicalFiles: SeoTechnicalFile[];
  priorityCounts: Record<SeoPriority, { total: number; pass: number }>;
};

function buildChecklist(context: {
  sitemapUrlCount: number;
  publishedPostCount: number;
  postsMissingMetaDescription: number;
  publishedServiceAreaCount: number;
  serviceAreasMissingMetaDescription: number;
  ga4Configured: boolean;
  clarityConfigured: boolean;
}): SeoChecklistGroup[] {
  const statusContext = {
    ...context,
    analyticsEventsEnabled: context.ga4Configured,
  };

  return SEO_CHECKLIST_CATALOG.map((group) => ({
    id: group.id,
    title: group.title,
    items: group.items.map((item) => ({
      id: item.id,
      label: item.label,
      description: item.description,
      priority: item.priority,
      phase: item.phase,
      href: item.href,
      external: item.external,
      status: resolveSeoItemStatus(item.id, statusContext),
      hint: resolveSeoItemHint(item.id, statusContext),
    })),
  }));
}

function buildRoadmap(checklist: SeoChecklistGroup[]): SeoRoadmapPhaseSummary[] {
  const itemsById = new Map<string, SeoChecklistItem>();

  for (const group of checklist) {
    for (const item of group.items) {
      itemsById.set(item.id, item);
    }
  }

  return SEO_ROADMAP_PHASES.map((phase) => {
    const phaseItems = phase.itemIds
      .map((id) => itemsById.get(id))
      .filter((item): item is SeoChecklistItem => Boolean(item));

    return {
      phase: phase.phase,
      title: phase.title,
      summary: phase.summary,
      totalItems: phaseItems.length,
      passItems: phaseItems.filter((item) => item.status === "pass").length,
    };
  });
}

function buildPriorityCounts(checklist: SeoChecklistGroup[]): SeoDashboardData["priorityCounts"] {
  const counts: SeoDashboardData["priorityCounts"] = {
    critical: { total: 0, pass: 0 },
    important: { total: 0, pass: 0 },
    helpful: { total: 0, pass: 0 },
    optional: { total: 0, pass: 0 },
  };

  for (const group of checklist) {
    for (const item of group.items) {
      counts[item.priority].total += 1;
      if (item.status === "pass") {
        counts[item.priority].pass += 1;
      }
    }
  }

  return counts;
}

function buildTechnicalFiles(sitemapUrlCount: number): SeoTechnicalFile[] {
  return [
    {
      id: "sitemap",
      label: "Sitemap",
      path: "/sitemap.xml",
      url: `${SITE_URL}/sitemap.xml`,
      status: "active",
      description: `Auto-generated — ${sitemapUrlCount} URLs`,
      source: "src/app/sitemap.ts",
      priority: "critical",
    },
    {
      id: "robots",
      label: "Robots.txt",
      path: "/robots.txt",
      url: `${SITE_URL}/robots.txt`,
      status: "active",
      description: "Allows public pages; blocks /admin/ and /api/",
      source: "src/app/robots.ts",
      priority: "critical",
    },
    {
      id: "manifest",
      label: "Web app manifest",
      path: "/manifest.webmanifest",
      url: `${SITE_URL}/manifest.webmanifest`,
      status: "active",
      description: "PWA manifest with name, icons, and theme colors",
      source: "public/manifest.webmanifest",
      priority: "optional",
    },
    {
      id: "favicon",
      label: "Favicon",
      path: "/favicon.ico",
      url: `${SITE_URL}/favicon.ico`,
      status: "active",
      description: "Browser tab icon",
      source: "src/app/favicon.ico",
      priority: "critical",
    },
    {
      id: "apple-icon",
      label: "Apple touch icon",
      path: "/apple-icon.png",
      url: `${SITE_URL}/apple-icon.png`,
      status: "active",
      description: "iOS home screen icon",
      source: "src/app/apple-icon.png",
      priority: "helpful",
    },
    {
      id: "llms-txt",
      label: "LLMs.txt",
      path: "/llms.txt",
      url: `${SITE_URL}/llms.txt`,
      status: "placeholder",
      description: "Optional AI crawler guidance — not deployed yet",
      priority: "helpful",
    },
    {
      id: "image-sitemap",
      label: "Image sitemap",
      path: "/image-sitemap.xml",
      url: `${SITE_URL}/image-sitemap.xml`,
      status: "placeholder",
      description: "Optional image discovery — not deployed yet",
      priority: "optional",
    },
    {
      id: "video-sitemap",
      label: "Video sitemap",
      path: "/video-sitemap.xml",
      url: `${SITE_URL}/video-sitemap.xml`,
      status: "placeholder",
      description: "Optional video discovery — not deployed yet",
      priority: "optional",
    },
    {
      id: "rss-feed",
      label: "RSS feed",
      path: "/feed.xml",
      url: `${SITE_URL}/feed.xml`,
      status: "placeholder",
      description: "Optional blog RSS — not deployed yet",
      priority: "optional",
    },
    {
      id: "security-txt",
      label: "Security.txt",
      path: "/.well-known/security.txt",
      url: `${SITE_URL}/.well-known/security.txt`,
      status: "placeholder",
      description: "Optional security contact file",
      priority: "optional",
    },
  ];
}

export async function loadSeoDashboardData(): Promise<SeoDashboardData> {
  const [sitemapEntries, publishedPosts, serviceAreasStore] = await Promise.all([
    buildSitemapEntries(),
    listPublishedPublicPosts(),
    loadServiceAreasStore().catch(() => null),
  ]);

  const publishedServiceAreas =
    serviceAreasStore?.areas.filter(
      (area) => area.status === "published" && !area.hidden && !area.unused,
    ) ?? [];

  const postsMissingMetaDescription = publishedPosts.filter(
    (post) => !post.metaDescription?.trim(),
  ).length;

  const serviceAreasMissingMetaDescription = publishedServiceAreas.filter(
    (area) => !area.metaDescription?.trim(),
  ).length;

  const ga4Configured = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
  const clarityConfigured = Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim());
  const sitemapUrlCount = sitemapEntries.length;

  const context = {
    sitemapUrlCount,
    publishedPostCount: publishedPosts.length,
    postsMissingMetaDescription,
    publishedServiceAreaCount: publishedServiceAreas.length,
    serviceAreasMissingMetaDescription,
    ga4Configured,
    clarityConfigured,
  };

  const checklist = buildChecklist(context);

  return {
    siteUrl: SITE_URL,
    sitemapUrlCount,
    publishedPostCount: publishedPosts.length,
    postsMissingMetaDescription,
    publishedServiceAreaCount: publishedServiceAreas.length,
    serviceAreasMissingMetaDescription,
    ga4Configured,
    clarityConfigured,
    checklist,
    roadmap: buildRoadmap(checklist),
    technicalFiles: buildTechnicalFiles(sitemapUrlCount),
    priorityCounts: buildPriorityCounts(checklist),
  };
}
