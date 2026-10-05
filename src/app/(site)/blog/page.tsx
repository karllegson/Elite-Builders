import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import PageHero from "@/components/site/PageHero";
import {
  fetchPublishedPostsForSite,
  fetchRecentPostsForSite,
} from "@/app/admin/(shell)/posts/actions";
import { ServiceAreaSidebar } from "@/components/site/ServiceAreaSidebar";
import {
  blogEstimateDescription,
  mapPostsToSidebarItems,
} from "@/lib/site/blogSidebar";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog",
  description:
    "Framing, home building, and construction tips for homeowners and builders across the Bay Area and Northern California from Elite Builders.",
  path: "/blog",
});

function formatBlogDate(value: string | null): string {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const [posts, recentPosts] = await Promise.all([
    fetchPublishedPostsForSite(),
    fetchRecentPostsForSite({ limit: 3 }),
  ]);

  const sidebarPosts = mapPostsToSidebarItems(recentPosts);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Framing & Construction Insights"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        lede={
          <p>Construction tips, framing guides, and project stories from Elite Builders IX.</p>
        }
      />

      <section className="section-sm bg-white">
        <div className="site-container">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="min-w-0">
              {posts.length === 0 ? (
                <p className="rounded-3xl border border-dashed border-site-line p-10 text-center text-site-text-muted">
                  No published posts yet.
                </p>
              ) : (
                <ul className="grid gap-5">
                  {posts.map((post) => (
                    <li key={post.id}>
                      <article className="group relative rounded-3xl border border-solid border-site-line bg-white p-7 transition-all hover:border-brand-ink/25 hover:shadow-[0_20px_40px_-28px_rgba(7,21,48,0.45)] sm:p-8">
                        {post.publishedAt ? (
                          <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">
                            {formatBlogDate(post.publishedAt)}
                          </p>
                        ) : null}
                        <h2 className="mt-3 font-display text-xl font-bold sm:text-2xl">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="transition-colors after:absolute after:inset-0 after:rounded-3xl group-hover:text-brand-blue"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-3 line-clamp-3 leading-relaxed text-site-text">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <span className="link-arrow mt-5" aria-hidden>
                          Read more
                          <ArrowRight size={16} />
                        </span>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ServiceAreaSidebar
              estimateDescription={blogEstimateDescription}
              recentPosts={sidebarPosts}
            />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
