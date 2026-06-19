import type { Metadata } from "next";
import Link from "next/link";
import {
  fetchPublishedPostsForSite,
  fetchRecentPostsForSite,
} from "@/app/admin/(shell)/posts/actions";
import { BlogSidebar } from "@/components/site/blog/BlogSidebar";
import { SitePageTitleBar } from "@/components/site/SitePageTitleBar";

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

  return (
    <section className="blog-page-section">
      <div className="site-container blog-page-container">
        <div className="blog-layout">
          <div className="blog-layout-main">
            <SitePageTitleBar
              title="Blog"
              breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Blog" },
              ]}
            />

            <div className="blog-index-main flex flex-col gap-6">
            <p className="text-base text-gray-600">
              Construction tips, framing guides, and project stories from Elite
              Builders IX.
            </p>

            {posts.length === 0 ? (
              <p className="text-gray-600">No published posts yet.</p>
            ) : (
              <ul className="blog-post-list">
                {posts.map((post) => (
                  <li key={post.id} className="blog-post-card">
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

          <BlogSidebar recentPosts={recentPosts} />
        </div>
      </div>
    </section>
  );
}
