import type { SeoCheckStatus } from "@/lib/admin/seoDashboard.server";

export type SeoPriority = "critical" | "important" | "helpful" | "optional";

export type SeoChecklistItemDef = {
  id: string;
  label: string;
  description: string;
  priority: SeoPriority;
  phase?: number;
  href?: string;
  external?: boolean;
};

export type SeoChecklistGroupDef = {
  id: string;
  title: string;
  items: SeoChecklistItemDef[];
};

export type SeoRoadmapPhase = {
  phase: number;
  title: string;
  summary: string;
  itemIds: string[];
};

export const SEO_PRIORITY_LABELS: Record<SeoPriority, string> = {
  critical: "Critical",
  important: "Important",
  helpful: "Helpful",
  optional: "Optional",
};

function item(
  id: string,
  label: string,
  options: Omit<SeoChecklistItemDef, "id" | "label">,
): SeoChecklistItemDef {
  return { id, label, ...options };
}

/** Full Elite Builders SEO checklist — static catalog; status resolved at runtime. */
export const SEO_CHECKLIST_CATALOG: SeoChecklistGroupDef[] = [
  {
    id: "technical",
    title: "1. Technical SEO",
    items: [
      item("https-ssl", "HTTPS (SSL)", {
        description: "Site served over HTTPS with a valid certificate.",
        priority: "critical",
        phase: 1,
        external: true,
        href: "https://search.google.com/search-console",
      }),
      item("fast-loading", "Fast loading pages", {
        description: "Target 2–3 second loads; compress images and enable caching.",
        priority: "critical",
        phase: 1,
        external: true,
        href: "https://pagespeed.web.dev/",
      }),
      item("mobile-friendly", "Mobile-friendly design", {
        description: "Google primarily ranks the mobile version of your site.",
        priority: "critical",
        phase: 1,
        external: true,
        href: "https://search.google.com/search-console",
      }),
      item("responsive-layout", "Responsive layout", {
        description: "Layout adapts across phone, tablet, and desktop breakpoints.",
        priority: "critical",
        phase: 1,
      }),
      item("clean-urls", "Clean URL structure", {
        description: "Short, descriptive paths (/services/framing, not /page?id=123).",
        priority: "critical",
        phase: 1,
      }),
      item("xml-sitemap", "XML sitemap", {
        description: "List of indexable URLs submitted to Search Console.",
        priority: "critical",
        phase: 1,
        href: "/sitemap.xml",
        external: true,
      }),
      item("robots-txt", "robots.txt", {
        description: "Crawl rules and sitemap pointer for search engines.",
        priority: "critical",
        phase: 1,
        href: "/robots.txt",
        external: true,
      }),
      item("favicon", "Favicon", {
        description: "Browser tab icon for brand recognition.",
        priority: "critical",
        href: "/favicon.ico",
        external: true,
      }),
      item("canonical-tags", "Canonical tags", {
        description: "Preferred URL on every indexable page.",
        priority: "important",
        phase: 5,
      }),
      item("meta-robots", "Meta robots tags", {
        description: "index/follow defaults; noindex only where intended.",
        priority: "important",
        phase: 5,
      }),
      item("404-page", "404 page", {
        description: "Helpful not-found page when content is missing.",
        priority: "important",
        phase: 5,
      }),
      item("301-redirects", "301 redirects", {
        description: "Permanent redirects from old URLs to new ones.",
        priority: "important",
        phase: 5,
      }),
      item("no-broken-links", "No broken links", {
        description: "Audit internal and external links regularly.",
        priority: "important",
        phase: 5,
      }),
      item("http-status-codes", "Correct HTTP status codes", {
        description: "200 for OK, 301 for redirects, 404 for missing pages.",
        priority: "important",
        phase: 5,
      }),
      item("compression", "GZIP / Brotli compression", {
        description: "Compress responses before sending to visitors.",
        priority: "important",
        phase: 5,
      }),
      item("browser-caching", "Browser caching", {
        description: "Cache static assets for returning visitors.",
        priority: "important",
        phase: 5,
      }),
      item("image-compression", "Image compression", {
        description: "Compress uploads before publishing.",
        priority: "important",
        href: "/admin/media",
      }),
      item("lazy-loading", "Lazy loading", {
        description: "Defer off-screen images until needed.",
        priority: "important",
        phase: 5,
      }),
      item("webp-avif", "WebP / AVIF images", {
        description: "Modern formats for smaller file sizes.",
        priority: "important",
        phase: 5,
      }),
      item("minified-assets", "Minified CSS / JS", {
        description: "Production builds minify and tree-shake assets.",
        priority: "helpful",
        phase: 5,
      }),
      item("cdn", "CDN (optional)", {
        description: "Edge delivery for global or high-traffic sites.",
        priority: "optional",
      }),
      item("heading-hierarchy", "Proper heading hierarchy (H1, H2, H3)", {
        description: "One H1 per page; logical section structure.",
        priority: "important",
        phase: 2,
      }),
      item("utf8-encoding", "UTF-8 encoding", {
        description: "Character set declared for all pages.",
        priority: "helpful",
      }),
    ],
  },
  {
    id: "google-tools",
    title: "2. Google Tools",
    items: [
      item("google-search-console", "Google Search Console", {
        description: "Keywords, clicks, indexing, and crawl errors.",
        priority: "critical",
        phase: 1,
        external: true,
        href: "https://search.google.com/search-console",
      }),
      item("google-analytics-4", "Google Analytics 4", {
        description: "Traffic sources, behavior, and conversions.",
        priority: "critical",
        phase: 1,
        href: "/admin/analytics",
      }),
      item("google-business-profile", "Google Business Profile", {
        description: "Maps visibility, reviews, hours, and photos.",
        priority: "critical",
        phase: 1,
        external: true,
        href: "https://business.google.com/",
      }),
      item("google-tag-manager", "Google Tag Manager (optional)", {
        description: "Central tag management without code deploys.",
        priority: "optional",
      }),
      item("bing-webmaster", "Bing Webmaster Tools", {
        description: "Bing indexing and search performance.",
        priority: "optional",
        external: true,
        href: "https://www.bing.com/webmasters",
      }),
    ],
  },
  {
    id: "core-web-vitals",
    title: "3. Core Web Vitals",
    items: [
      item("lcp", "Largest Contentful Paint (LCP)", {
        description: "Loading performance — target under 2.5s.",
        priority: "important",
        phase: 5,
        external: true,
        href: "https://pagespeed.web.dev/",
      }),
      item("inp", "Interaction to Next Paint (INP)", {
        description: "Responsiveness — target under 200ms.",
        priority: "important",
        phase: 5,
        external: true,
        href: "https://pagespeed.web.dev/",
      }),
      item("cls", "Cumulative Layout Shift (CLS)", {
        description: "Visual stability — target under 0.1.",
        priority: "important",
        phase: 5,
        external: true,
        href: "https://pagespeed.web.dev/",
      }),
    ],
  },
  {
    id: "on-page",
    title: "4. On-Page SEO",
    items: [
      item("unique-title", "Unique title tag", {
        description: "Every page has a distinct blue-link title in Google.",
        priority: "critical",
        phase: 2,
        href: "/admin/posts",
      }),
      item("meta-description", "Meta description", {
        description: "Compelling summary below the title in search results.",
        priority: "critical",
        phase: 2,
        href: "/admin/posts",
      }),
      item("one-h1", "One H1", {
        description: "Single main heading per page.",
        priority: "critical",
        phase: 2,
      }),
      item("h2-h3", "H2s and H3s", {
        description: "Organize content into scannable sections.",
        priority: "important",
        phase: 2,
      }),
      item("keyword-title", "Keyword in title", {
        description: "Primary keyword appears naturally in the title tag.",
        priority: "important",
        phase: 2,
      }),
      item("keyword-url", "Keyword in URL", {
        description: "Slug reflects the primary topic or service.",
        priority: "important",
        phase: 2,
      }),
      item("keyword-first-paragraph", "Keyword in first paragraph", {
        description: "Early, natural use of the primary keyword.",
        priority: "important",
        phase: 2,
      }),
      item("internal-links-onpage", "Internal links", {
        description: "Link to related services, areas, and blog posts.",
        priority: "critical",
        phase: 2,
      }),
      item("external-links", "External links (when appropriate)", {
        description: "Link to trustworthy sources for credibility.",
        priority: "helpful",
        phase: 2,
      }),
      item("optimized-images-onpage", "Optimized images", {
        description: "Compressed, appropriately sized images on every page.",
        priority: "important",
        href: "/admin/media",
      }),
      item("alt-text-onpage", "Alt text", {
        description: "Describe image content for SEO and accessibility.",
        priority: "important",
        href: "/admin/media",
      }),
      item("descriptive-filenames", "Descriptive filenames", {
        description: "e.g. modesto-house-framing.webp not IMG_2938.jpg",
        priority: "important",
        href: "/admin/media",
      }),
      item("readability", "Good readability", {
        description: "Short paragraphs, clear language, scannable layout.",
        priority: "helpful",
        phase: 2,
      }),
      item("ctas", "Calls to action", {
        description: "Call, quote request, or estimate on every key page.",
        priority: "important",
        phase: 2,
      }),
      item("faqs-onpage", "FAQs (where appropriate)", {
        description: "Answer common questions on service and area pages.",
        priority: "important",
        href: "/admin/faqs",
      }),
    ],
  },
  {
    id: "local",
    title: "5. Local SEO",
    items: [
      item("gbp-local", "Google Business Profile", {
        description: "Claim, verify, and keep GBP accurate and active.",
        priority: "critical",
        phase: 3,
        external: true,
        href: "https://business.google.com/",
      }),
      item("nap-consistency", "Consistent NAP (name, address, phone)", {
        description: "Identical business info everywhere online.",
        priority: "critical",
        phase: 3,
        href: "/admin/site-config",
      }),
      item("service-area-pages", "Service area pages", {
        description: "Dedicated city / market landing pages.",
        priority: "critical",
        phase: 3,
        href: "/admin/service-areas",
      }),
      item("customer-reviews", "Customer reviews", {
        description: "Google reviews from happy customers.",
        priority: "critical",
        phase: 3,
        href: "/admin/reviews",
      }),
      item("review-responses", "Review responses", {
        description: "Reply professionally to every review.",
        priority: "important",
        phase: 3,
        href: "/admin/reviews",
      }),
      item("localbusiness-schema-local", "LocalBusiness schema", {
        description: "Structured data describing your local business.",
        priority: "critical",
        phase: 4,
      }),
      item("embedded-map", "Embedded Google Map", {
        description: "Map on contact or location pages when applicable.",
        priority: "important",
        phase: 3,
        href: "/contact",
        external: true,
      }),
      item("city-content", "City-specific content", {
        description: "Unique copy per service area, not duplicate templates.",
        priority: "important",
        phase: 3,
        href: "/admin/service-areas",
      }),
      item("business-hours", "Business hours", {
        description: "Hours on contact page and GBP.",
        priority: "important",
        phase: 3,
        href: "/admin/site-config",
      }),
      item("phone-every-page", "Phone number on every page", {
        description: "Clickable tel: link in header, footer, or mobile bar.",
        priority: "important",
        phase: 3,
      }),
      item("contact-page", "Contact page", {
        description: "Phone, email, service area, form, and hours.",
        priority: "critical",
        phase: 3,
        href: "/contact",
        external: true,
      }),
    ],
  },
  {
    id: "schema",
    title: "6. Schema (Structured Data)",
    items: [
      item("schema-localbusiness", "LocalBusiness", { description: "Local business entity.", priority: "critical", phase: 4 }),
      item("schema-organization", "Organization", { description: "Company identity and logo.", priority: "critical", phase: 4 }),
      item("schema-contractor", "Contractor", { description: "Contractor-specific type where applicable.", priority: "important", phase: 4 }),
      item("schema-home-construction", "HomeAndConstructionBusiness", { description: "Construction business subtype.", priority: "important", phase: 4 }),
      item("schema-service", "Service", { description: "Each primary service offering.", priority: "critical", phase: 4 }),
      item("schema-breadcrumb", "BreadcrumbList", { description: "Page hierarchy in search results.", priority: "important", phase: 4 }),
      item("schema-faq", "FAQPage", { description: "FAQ rich results on service and area pages.", priority: "important", phase: 4, href: "/admin/faqs" }),
      item("schema-review", "Review", { description: "Individual customer review markup.", priority: "important", phase: 4, href: "/admin/reviews" }),
      item("schema-aggregate-rating", "AggregateRating", { description: "Average rating when eligible.", priority: "important", phase: 4, href: "/admin/reviews" }),
      item("schema-imageobject", "ImageObject", { description: "Logo and key images in schema.", priority: "helpful", phase: 4 }),
      item("schema-website", "WebSite", { description: "Site-level entity.", priority: "helpful", phase: 4 }),
      item("schema-webpage", "WebPage", { description: "Generic page type.", priority: "helpful", phase: 4 }),
      item("schema-contactpage", "ContactPage", { description: "Contact page identification.", priority: "helpful", phase: 4 }),
      item("schema-aboutpage", "AboutPage", { description: "About page identification.", priority: "helpful", phase: 4 }),
      item("schema-person", "Person (team pages)", { description: "Team member profiles.", priority: "optional", phase: 4 }),
      item("schema-postaladdress", "PostalAddress", { description: "Structured business address.", priority: "important", phase: 4 }),
      item("schema-geocoordinates", "GeoCoordinates", { description: "Lat/long when applicable.", priority: "optional", phase: 4 }),
      item("schema-openinghours", "OpeningHoursSpecification", { description: "Business hours in schema.", priority: "optional", phase: 4 }),
      item("schema-offer", "Offer (if applicable)", { description: "Promotions or service offers.", priority: "optional", phase: 4 }),
      item("schema-videoobject", "VideoObject (if you have videos)", { description: "Video rich results.", priority: "helpful", phase: 4 }),
      item("schema-article", "Article (blog posts)", { description: "Blog post structured data.", priority: "important", phase: 4, href: "/admin/posts" }),
      item("schema-blogposting", "BlogPosting", { description: "Blog-specific article subtype.", priority: "helpful", phase: 4, href: "/admin/posts" }),
      item("schema-howto", "HowTo (where appropriate)", { description: "Step-by-step content markup.", priority: "optional", phase: 4 }),
      item("schema-searchaction", "SearchAction (site search)", { description: "Sitelinks search box — if site search exists.", priority: "optional", phase: 4 }),
    ],
  },
  {
    id: "images",
    title: "7. Images",
    items: [
      item("images-webp-avif", "WebP or AVIF format", { description: "Modern delivery formats.", priority: "important" }),
      item("images-alt", "Alt text", { description: "Descriptive alt on every meaningful image.", priority: "important", href: "/admin/media" }),
      item("images-compressed", "Compressed images", { description: "Optimize before upload.", priority: "important", href: "/admin/media" }),
      item("images-filenames", "Descriptive filenames", { description: "Keyword-rich, readable file names.", priority: "important", href: "/admin/media" }),
      item("images-sitemap", "Image sitemap (optional)", { description: "Optional discovery for image search.", priority: "optional" }),
      item("images-dimensions", "Width and height specified", { description: "Prevent layout shift (CLS).", priority: "important" }),
      item("images-captions", "Captions when useful", { description: "Context for gallery and project photos.", priority: "helpful" }),
    ],
  },
  {
    id: "videos",
    title: "8. Videos",
    items: [
      item("video-schema", "VideoObject schema", { description: "Markup for embedded or hosted videos.", priority: "helpful", phase: 4 }),
      item("video-sitemap", "Video sitemap (optional)", { description: "Optional video discovery.", priority: "optional" }),
      item("video-transcripts", "Transcripts", { description: "Text alternative for video content.", priority: "helpful" }),
      item("video-thumbnails", "Custom thumbnails", { description: "Branded preview images.", priority: "helpful" }),
      item("video-titles", "Titles and descriptions", { description: "SEO-friendly video metadata.", priority: "helpful" }),
    ],
  },
  {
    id: "content",
    title: "9. Content",
    items: [
      item("content-service-pages", "Service pages", { description: "One page per core service.", priority: "critical", phase: 3, href: "/admin/services/framing" }),
      item("content-about", "About page", { description: "Company story and trust signals.", priority: "important", href: "/about", external: true }),
      item("content-contact", "Contact page", { description: "Lead capture and business info.", priority: "critical", href: "/contact", external: true }),
      item("content-portfolio", "Portfolio / projects", { description: "Before-and-after and completed work.", priority: "important", href: "/projects", external: true }),
      item("content-testimonials", "Testimonials", { description: "Real customer feedback on site.", priority: "important", href: "/admin/reviews" }),
      item("content-faqs", "FAQs", { description: "Answer top customer questions.", priority: "important", href: "/admin/faqs" }),
      item("content-blog", "Blog", { description: "Useful articles targeting search intent.", priority: "important", phase: 6, href: "/admin/posts" }),
      item("content-location-pages", "Location pages", { description: "City-specific service area content.", priority: "critical", href: "/admin/service-areas" }),
      item("content-team", "Team page", { description: "Faces and credentials build trust.", priority: "helpful", href: "/about", external: true }),
      item("content-financing", "Financing information (if applicable)", { description: "Payment and financing options.", priority: "optional" }),
      item("content-warranties", "Warranties", { description: "Workmanship and product warranties.", priority: "helpful" }),
      item("content-process", "Process / how it works", { description: "Consultation through completion.", priority: "helpful" }),
      item("content-galleries", "Before-and-after galleries", { description: "Visual proof of quality work.", priority: "important", href: "/projects", external: true }),
    ],
  },
  {
    id: "internal-linking",
    title: "10. Internal Linking",
    items: [
      item("link-related-services", "Link related services together", { description: "Framing ↔ siding ↔ decks.", priority: "critical", phase: 2 }),
      item("link-blog-services", "Link blog posts to services", { description: "Contextual links from articles to money pages.", priority: "important", phase: 6, href: "/admin/posts" }),
      item("link-breadcrumbs", "Breadcrumb navigation", { description: "Hierarchy on interior pages.", priority: "important", phase: 4 }),
      item("link-footer", "Footer navigation", { description: "Key pages linked site-wide.", priority: "important" }),
      item("link-html-sitemap", "HTML sitemap (optional)", { description: "Human-readable page index.", priority: "optional" }),
    ],
  },
  {
    id: "off-page",
    title: "11. Off-Page SEO",
    items: [
      item("offpage-google-reviews", "Google reviews", { description: "Reviews on GBP and optionally on site.", priority: "critical", href: "/admin/reviews" }),
      item("offpage-backlinks", "Backlinks", { description: "Links from reputable sites.", priority: "important", phase: 7 }),
      item("offpage-directories", "Local directories", { description: "Consistent listings on trusted directories.", priority: "important", phase: 7 }),
      item("offpage-chamber", "Chamber of Commerce listings", { description: "Local chamber membership when relevant.", priority: "helpful", phase: 7 }),
      item("offpage-associations", "Industry associations", { description: "Contractor and trade group listings.", priority: "helpful", phase: 7 }),
      item("offpage-social", "Social profiles", { description: "Active Facebook, Instagram, LinkedIn.", priority: "helpful", phase: 7 }),
      item("offpage-press", "Press mentions", { description: "Local media and project features.", priority: "helpful", phase: 7 }),
      item("offpage-partnerships", "Partnerships", { description: "Builder and supplier relationships.", priority: "helpful", phase: 7 }),
    ],
  },
  {
    id: "ai-crawlers",
    title: "12. AI & Crawlers",
    items: [
      item("ai-robots", "robots.txt", { description: "Crawl guidance for all bots.", priority: "critical", href: "/robots.txt", external: true }),
      item("ai-sitemap", "XML sitemap", { description: "URL discovery for crawlers.", priority: "critical", href: "/sitemap.xml", external: true }),
      item("ai-llms-txt", "llms.txt (optional)", { description: "Points AI systems to key content.", priority: "helpful", phase: 8 }),
      item("ai-clean-html", "Clean HTML structure", { description: "Valid, readable markup.", priority: "important" }),
      item("ai-semantic-html", "Semantic HTML", { description: "main, article, section, nav, footer.", priority: "important", phase: 8 }),
      item("ai-headings", "Descriptive headings", { description: "Clear H1–H3 outline.", priority: "important" }),
      item("ai-internal-linking", "Good internal linking", { description: "Helps crawlers and AI understand site structure.", priority: "important" }),
    ],
  },
  {
    id: "social",
    title: "13. Social Sharing",
    items: [
      item("social-og", "Open Graph tags", { description: "Facebook and LinkedIn share previews.", priority: "helpful", phase: 9 }),
      item("social-twitter", "X (Twitter) Cards", { description: "X share previews.", priority: "helpful", phase: 9 }),
      item("social-profiles", "Social profile links", { description: "Linked profiles in footer or contact.", priority: "helpful", phase: 7 }),
    ],
  },
  {
    id: "security",
    title: "14. Security",
    items: [
      item("security-https", "HTTPS", { description: "Encrypted connections site-wide.", priority: "critical" }),
      item("security-headers", "Security headers", { description: "CSP, X-Content-Type-Options, etc.", priority: "optional" }),
      item("security-backups", "Automatic backups", { description: "Hosting and database backups.", priority: "important" }),
      item("security-malware", "Malware scanning", { description: "Monitor for compromised files.", priority: "optional" }),
      item("security-passwords", "Strong passwords", { description: "Admin and hosting account hygiene.", priority: "important", href: "/admin/settings" }),
      item("security-2fa", "Two-factor authentication for admin", { description: "2FA on admin and hosting accounts.", priority: "important", href: "/admin/settings" }),
    ],
  },
  {
    id: "accessibility",
    title: "15. Accessibility (also helps SEO)",
    items: [
      item("a11y-alt", "Alt text", { description: "Non-decorative images described.", priority: "important", href: "/admin/media" }),
      item("a11y-headings", "Proper heading order", { description: "No skipped levels; one H1.", priority: "important" }),
      item("a11y-keyboard", "Keyboard navigation", { description: "All interactive elements reachable.", priority: "important" }),
      item("a11y-contrast", "Color contrast", { description: "Readable text against backgrounds.", priority: "important" }),
      item("a11y-form-labels", "Form labels", { description: "Every input has an associated label.", priority: "important", href: "/admin/forms" }),
      item("a11y-aria", "ARIA attributes where needed", { description: "Menus, modals, and live regions.", priority: "helpful" }),
      item("a11y-link-text", "Descriptive link text", { description: "Avoid generic “click here”.", priority: "important" }),
    ],
  },
  {
    id: "analytics",
    title: "16. Analytics & Tracking",
    items: [
      item("analytics-ga4-events", "GA4 events", { description: "Custom events beyond pageviews.", priority: "important", href: "/admin/analytics" }),
      item("analytics-form-tracking", "Contact form tracking", { description: "Submissions as conversions.", priority: "important", href: "/admin/analytics" }),
      item("analytics-phone-clicks", "Phone click tracking", { description: "tel: link click events.", priority: "important", href: "/admin/analytics" }),
      item("analytics-quote-tracking", "Quote request tracking", { description: "Estimate / quote form submits.", priority: "important", href: "/admin/analytics" }),
      item("analytics-scroll-depth", "Scroll depth (optional)", { description: "How far users scroll on key pages.", priority: "optional" }),
      item("analytics-gsc-monitoring", "Search Console monitoring", { description: "Weekly checks for indexing and queries.", priority: "critical", phase: 10, external: true, href: "https://search.google.com/search-console" }),
    ],
  },
  {
    id: "performance",
    title: "17. Performance",
    items: [
      item("perf-caching", "Caching", { description: "Static and data caching strategy.", priority: "important", phase: 5 }),
      item("perf-fonts", "Optimized fonts", { description: "Subset and preload critical fonts.", priority: "important" }),
      item("perf-preload", "Preload important assets", { description: "Hero images, fonts, critical CSS.", priority: "helpful" }),
      item("perf-dns-prefetch", "DNS prefetch / preconnect", { description: "Third-party origins warmed early.", priority: "helpful" }),
      item("perf-reduce-js", "Reduced JavaScript", { description: "Minimal client bundles per route.", priority: "important" }),
      item("perf-reduce-css", "Reduced CSS", { description: "Tailwind purge / scoped styles.", priority: "helpful" }),
      item("perf-defer-scripts", "Deferred non-critical scripts", { description: "Analytics and widgets after paint.", priority: "important", href: "/admin/analytics" }),
    ],
  },
  {
    id: "indexing",
    title: "18. Indexing",
    items: [
      item("index-url-inspection", "URL Inspection in Search Console", { description: "Verify how Google sees each URL.", priority: "important", phase: 10, external: true, href: "https://search.google.com/search-console" }),
      item("index-request", "Request indexing for important new pages", { description: "After publishing key pages.", priority: "important", phase: 10, external: true, href: "https://search.google.com/search-console" }),
      item("index-crawl-errors", "Fix crawl errors", { description: "Resolve 404s and server errors in GSC.", priority: "important", phase: 10, external: true, href: "https://search.google.com/search-console" }),
      item("index-remove-unwanted", "Remove unwanted indexed pages", { description: "noindex or removal for thin/duplicate URLs.", priority: "important", phase: 10 }),
      item("index-no-duplicate", "Avoid duplicate content", { description: "Canonicals and unique copy per URL.", priority: "important", phase: 10 }),
    ],
  },
  {
    id: "metadata",
    title: "19. Metadata",
    items: [
      item("meta-title-tags", "Title tags", { description: "Unique per page.", priority: "critical", href: "/admin/posts" }),
      item("meta-descriptions", "Meta descriptions", { description: "Unique per page.", priority: "critical", href: "/admin/posts" }),
      item("meta-canonical", "Canonical tags", { description: "Preferred URL declared.", priority: "important" }),
      item("meta-robots-tags", "Robots tags", { description: "index, follow by default.", priority: "important" }),
      item("meta-lang", "Language attribute (lang)", { description: "html lang=\"en\" (or appropriate).", priority: "helpful" }),
      item("meta-charset", "Charset (UTF-8)", { description: "UTF-8 character encoding.", priority: "helpful" }),
      item("meta-viewport", "Viewport meta tag", { description: "Responsive viewport for mobile.", priority: "critical" }),
    ],
  },
  {
    id: "files",
    title: "20. Files",
    items: [
      item("file-robots", "/robots.txt", { description: "Crawl rules file.", priority: "critical", href: "/robots.txt", external: true }),
      item("file-sitemap", "/sitemap.xml", { description: "XML URL list.", priority: "critical", href: "/sitemap.xml", external: true }),
      item("file-favicon", "/favicon.ico", { description: "Favicon.", priority: "critical", href: "/favicon.ico", external: true }),
      item("file-manifest", "/manifest.json (PWA)", { description: "Web app manifest for installable PWA.", priority: "optional", href: "/manifest.webmanifest", external: true }),
      item("file-llms", "llms.txt (optional)", { description: "AI crawler guidance file.", priority: "helpful" }),
    ],
  },
];

export const SEO_ROADMAP_PHASES: SeoRoadmapPhase[] = [
  {
    phase: 1,
    title: "Build the foundation",
    summary: "HTTPS, mobile, speed, sitemap, robots.txt, Search Console, GA4, GBP.",
    itemIds: [
      "https-ssl",
      "mobile-friendly",
      "fast-loading",
      "clean-urls",
      "xml-sitemap",
      "robots-txt",
      "google-search-console",
      "google-analytics-4",
      "google-business-profile",
    ],
  },
  {
    phase: 2,
    title: "Optimize every page",
    summary: "Titles, descriptions, headings, keywords, internal links, images, CTAs.",
    itemIds: [
      "unique-title",
      "meta-description",
      "one-h1",
      "h2-h3",
      "keyword-title",
      "internal-links-onpage",
      "alt-text-onpage",
      "ctas",
    ],
  },
  {
    phase: 3,
    title: "Local SEO",
    summary: "NAP, service pages, location pages, reviews, contact, maps.",
    itemIds: [
      "nap-consistency",
      "content-service-pages",
      "content-location-pages",
      "customer-reviews",
      "contact-page",
      "embedded-map",
    ],
  },
  {
    phase: 4,
    title: "Structured data",
    summary: "LocalBusiness, Organization, Service, FAQ, Breadcrumb, Review schema.",
    itemIds: [
      "schema-localbusiness",
      "schema-organization",
      "schema-service",
      "schema-faq",
      "schema-breadcrumb",
      "schema-review",
      "schema-article",
    ],
  },
  {
    phase: 5,
    title: "Technical SEO",
    summary: "Canonicals, robots meta, 404, redirects, Core Web Vitals, caching, images.",
    itemIds: [
      "canonical-tags",
      "404-page",
      "301-redirects",
      "lcp",
      "inp",
      "cls",
      "lazy-loading",
      "webp-avif",
    ],
  },
  {
    phase: 6,
    title: "Content strategy",
    summary: "Blog, portfolio, testimonials, FAQs, about, process.",
    itemIds: ["content-blog", "content-portfolio", "content-testimonials", "content-faqs", "content-about", "link-blog-services"],
  },
  {
    phase: 7,
    title: "Off-page SEO",
    summary: "Backlinks, directories, chamber, social, press.",
    itemIds: ["offpage-backlinks", "offpage-directories", "offpage-social", "offpage-chamber"],
  },
  {
    phase: 8,
    title: "AI optimization",
    summary: "llms.txt, semantic HTML, clear structure.",
    itemIds: ["ai-llms-txt", "ai-semantic-html", "ai-clean-html"],
  },
  {
    phase: 9,
    title: "Social sharing",
    summary: "Open Graph, X Cards, social profile links.",
    itemIds: ["social-og", "social-twitter", "social-profiles"],
  },
  {
    phase: 10,
    title: "Monitoring & maintenance",
    summary: "GSC weekly, update old pages, indexing requests, reviews, new content.",
    itemIds: [
      "analytics-gsc-monitoring",
      "index-url-inspection",
      "index-request",
      "review-responses",
      "content-blog",
    ],
  },
];

export type SeoStatusContext = {
  sitemapUrlCount: number;
  publishedPostCount: number;
  postsMissingMetaDescription: number;
  publishedServiceAreaCount: number;
  serviceAreasMissingMetaDescription: number;
  ga4Configured: boolean;
  clarityConfigured: boolean;
  analyticsEventsEnabled: boolean;
};

/** Runtime status overrides keyed by checklist item id. */
export function resolveSeoItemStatus(id: string, ctx: SeoStatusContext): SeoCheckStatus {
  const overrides: Record<string, SeoCheckStatus> = {
    // Implemented in codebase
    "clean-urls": "pass",
    "xml-sitemap": ctx.sitemapUrlCount > 0 ? "pass" : "warn",
    "robots-txt": "pass",
    "favicon": "pass",
    "canonical-tags": "pass",
    "meta-robots": "pass",
    "meta-robots-tags": "pass",
    "meta-canonical": "pass",
    "responsive-layout": "pass",
    "compression": "pass",
    "browser-caching": "pass",
    "lazy-loading": "pass",
    "webp-avif": "pass",
    "images-webp-avif": "pass",
    "minified-assets": "pass",
    "utf8-encoding": "pass",
    "meta-charset": "pass",
    "meta-viewport": "pass",
    "meta-lang": "pass",
    "http-status-codes": "pass",
    "ai-robots": "pass",
    "ai-sitemap": "pass",
    "file-robots": "pass",
    "file-sitemap": "pass",
    "file-favicon": "pass",
    "file-manifest": "pass",
    "social-og": "pass",
    "social-twitter": "pass",
    "schema-organization": "pass",
    "schema-localbusiness": "pass",
    "schema-localbusiness-local": "pass",
    "localbusiness-schema-local": "pass",
    "schema-service": "pass",
    "schema-faq": "pass",
    "schema-postaladdress": "pass",
    "schema-imageobject": "pass",
    "schema-website": "pass",
    "schema-article": ctx.publishedPostCount > 0 ? "pass" : "pending",
    "schema-blogposting": ctx.publishedPostCount > 0 ? "pass" : "pending",
    "nap-consistency": "pass",
    "phone-every-page": "pass",
    "link-footer": "pass",
    "content-about": "pass",
    "content-contact": "pass",
    "content-portfolio": "pass",
    "content-service-pages": "pass",
    "ai-clean-html": "pass",
    "ai-semantic-html": "pass",
    "perf-reduce-js": "pass",
    "perf-defer-scripts": ctx.analyticsEventsEnabled ? "pass" : "pending",
    "analytics-ga4-events": ctx.analyticsEventsEnabled ? "pass" : "pending",
    "analytics-form-tracking": ctx.analyticsEventsEnabled ? "pass" : "pending",
    "analytics-phone-clicks": ctx.analyticsEventsEnabled ? "pass" : "pending",
    "analytics-quote-tracking": ctx.analyticsEventsEnabled ? "pass" : "pending",
    "google-analytics-4": ctx.ga4Configured ? "pass" : "pending",
    "service-area-pages": ctx.publishedServiceAreaCount > 0 ? "pass" : "warn",
    "content-location-pages": ctx.publishedServiceAreaCount > 0 ? "pass" : "warn",
    "meta-description": ctx.postsMissingMetaDescription + ctx.serviceAreasMissingMetaDescription === 0 && ctx.publishedPostCount + ctx.publishedServiceAreaCount > 0 ? "pass" : ctx.publishedPostCount + ctx.publishedServiceAreaCount > 0 ? "warn" : "pending",
    "meta-descriptions": ctx.postsMissingMetaDescription + ctx.serviceAreasMissingMetaDescription === 0 && ctx.publishedPostCount + ctx.publishedServiceAreaCount > 0 ? "pass" : ctx.publishedPostCount + ctx.publishedServiceAreaCount > 0 ? "warn" : "pending",
    "unique-title": ctx.publishedPostCount + ctx.publishedServiceAreaCount > 0 ? "warn" : "pending",
    "meta-title-tags": ctx.publishedPostCount + ctx.publishedServiceAreaCount > 0 ? "warn" : "pending",
    "404-page": "pending",
    "embedded-map": "pass",
    "content-faqs": "pass",
    "faqs-onpage": "pass",
    "schema-videoobject": "pass",
    "video-schema": "pass",
    "content-team": "pass",
    "security-https": "placeholder",
    "https-ssl": "placeholder",
  };

  if (overrides[id]) {
    return overrides[id];
  }

  // External / manual / not yet automated
  const manualIds = new Set([
    "google-search-console",
    "google-business-profile",
    "gbp-local",
    "bing-webmaster",
    "google-tag-manager",
    "fast-loading",
    "mobile-friendly",
    "lcp",
    "inp",
    "cls",
    "301-redirects",
    "no-broken-links",
    "one-h1",
    "h2-h3",
    "keyword-title",
    "keyword-url",
    "keyword-first-paragraph",
    "internal-links-onpage",
    "external-links",
    "optimized-images-onpage",
    "alt-text-onpage",
    "descriptive-filenames",
    "readability",
    "ctas",
    "customer-reviews",
    "review-responses",
    "city-content",
    "business-hours",
    "schema-contractor",
    "schema-home-construction",
    "schema-breadcrumb",
    "schema-review",
    "schema-aggregate-rating",
    "schema-contactpage",
    "schema-aboutpage",
    "schema-person",
    "schema-geocoordinates",
    "schema-openinghours",
    "schema-offer",
    "schema-howto",
    "schema-searchaction",
    "images-alt",
    "images-compressed",
    "images-filenames",
    "images-sitemap",
    "images-dimensions",
    "images-captions",
    "video-sitemap",
    "video-transcripts",
    "video-thumbnails",
    "video-titles",
    "content-testimonials",
    "content-blog",
    "content-financing",
    "content-warranties",
    "content-process",
    "content-galleries",
    "link-related-services",
    "link-blog-services",
    "link-breadcrumbs",
    "link-html-sitemap",
    "offpage-google-reviews",
    "offpage-backlinks",
    "offpage-directories",
    "offpage-chamber",
    "offpage-associations",
    "offpage-social",
    "offpage-press",
    "offpage-partnerships",
    "ai-llms-txt",
    "file-llms",
    "ai-headings",
    "ai-internal-linking",
    "social-profiles",
    "security-headers",
    "security-backups",
    "security-malware",
    "security-passwords",
    "security-2fa",
    "a11y-alt",
    "a11y-headings",
    "a11y-keyboard",
    "a11y-contrast",
    "a11y-form-labels",
    "a11y-aria",
    "a11y-link-text",
    "analytics-scroll-depth",
    "analytics-gsc-monitoring",
    "index-url-inspection",
    "index-request",
    "index-crawl-errors",
    "index-remove-unwanted",
    "index-no-duplicate",
    "perf-caching",
    "perf-fonts",
    "perf-preload",
    "perf-dns-prefetch",
    "perf-reduce-css",
    "heading-hierarchy",
    "image-compression",
    "cdn",
  ]);

  if (manualIds.has(id)) {
    return "placeholder";
  }

  return "placeholder";
}

export function resolveSeoItemHint(id: string, ctx: SeoStatusContext): string | undefined {
  const hints: Record<string, string> = {
    "xml-sitemap": `${ctx.sitemapUrlCount} URLs`,
    "ai-sitemap": `${ctx.sitemapUrlCount} URLs`,
    "file-sitemap": `${ctx.sitemapUrlCount} URLs`,
    "google-analytics-4": ctx.ga4Configured
      ? "NEXT_PUBLIC_GA_MEASUREMENT_ID is set"
      : "Configure in Analytics → Settings",
    "meta-description": `${ctx.postsMissingMetaDescription + ctx.serviceAreasMissingMetaDescription} pages missing descriptions`,
    "meta-descriptions": `${ctx.postsMissingMetaDescription + ctx.serviceAreasMissingMetaDescription} pages missing descriptions`,
    "service-area-pages": `${ctx.publishedServiceAreaCount} published areas`,
    "content-location-pages": `${ctx.publishedServiceAreaCount} published areas`,
    "schema-article": `${ctx.publishedPostCount} published posts`,
    "404-page": "Custom not-found page not detected yet",
    "ai-llms-txt": "Optional — not deployed",
    "file-llms": "Optional — not deployed",
    "analytics-phone-clicks": ctx.analyticsEventsEnabled
      ? "Phone, form, and outbound events enabled"
      : "Enable in Analytics settings",
  };

  return hints[id];
}
