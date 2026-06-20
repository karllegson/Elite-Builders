import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchPublishedPostsForSite,
  fetchRecentPostsForSite,
} from "@/app/admin/(shell)/posts/actions";
import { ServiceAreaSidebar } from "@/components/site/ServiceAreaSidebar";
import {
  blogEstimateDescription,
  mapPostsToSidebarItems,
} from "@/lib/site/blogSidebar";

export const metadata: Metadata = {
  title: "Blog | Elite Builders IX",
  description:
    "Framing, siding, and construction tips for homeowners across the Bay Area and Northern California.",
};

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
    <section className="bg-white pb-16 pt-10">
      <div className="site-container">
        <div className="mt-0 grid grid-cols-1 items-start gap-8 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          <div className="min-w-0">
            <div className="service-area-page-header">
              <h1 className="service-area-page-title">Blog</h1>
              <nav className="service-area-breadcrumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                <span aria-current="page">Blog</span>
              </nav>
            </div>

            <div className="service-area-featured-intro">
              <div className="service-area-html-content service-area-default-intro">
                <p>
                  Construction tips, framing guides, and project stories from Elite
                  Builders IX.
                </p>
              </div>

              {posts.length === 0 ? (
                <p className="mt-8 text-gray-600">No published posts yet.</p>
              ) : (
                <ul className="mt-8 space-y-8">
                  {posts.map((post) => (
                    <li
                      key={post.id}
                      className="border-b border-solid border-gray-100 pb-8 last:border-b-0 last:pb-0"
                    >
                      <h2 className="text-2xl font-bold text-brand-navy">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="hover:text-brand-blue"
                        >
                          {post.title}
                        </Link>
                      </h2>
                      {post.publishedAt ? (
                        <p className="mt-2 text-sm text-gray-500">
                          {formatBlogDate(post.publishedAt)}
                        </p>
                      ) : null}
                      {post.excerpt ? (
                        <p className="mt-3 text-gray-600">{post.excerpt}</p>
                      ) : null}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-4 inline-block font-semibold text-brand-blue hover:underline"
                      >
                        Read more
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <ServiceAreaSidebar
            estimateDescription={blogEstimateDescription}
            recentPosts={sidebarPosts}
          />
        </div>
      </div>
    </section>
  );
}
