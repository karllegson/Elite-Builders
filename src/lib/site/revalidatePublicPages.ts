import { revalidatePath } from "next/cache";

/**
 * Public pages are cached (ISR). Call these after a successful dashboard/admin save so the
 * change shows on the live site on the next visit instead of after the hourly refresh.
 */

/** Service areas store: /service-areas pages, dashboard-built /services landing pages, sitemap. */
export function revalidateServiceAreaPages() {
  revalidatePath("/service-areas", "layout");
  revalidatePath("/services", "layout");
  revalidatePath("/sitemap.xml");
}

/** Service pages store: homepage services list and every /services page. */
export function revalidateServicePages() {
  revalidatePath("/");
  revalidatePath("/services", "layout");
}

/** FAQs are embedded in service-area pages, service landing pages and blog posts. */
export function revalidateFaqPages() {
  revalidatePath("/service-areas", "layout");
  revalidatePath("/services", "layout");
  revalidatePath("/blog", "layout");
}

/** Blog posts: blog index, post pages and the sitemap. */
export function revalidateBlogPages() {
  revalidatePath("/blog", "layout");
  revalidatePath("/sitemap.xml");
}

/** Media library details (alt text, files) used by blog featured images. */
export function revalidateMediaPages() {
  revalidatePath("/blog", "layout");
}

/** Showcase TV projects and settings. */
export function revalidateShowcasePage() {
  revalidatePath("/showcase");
}
