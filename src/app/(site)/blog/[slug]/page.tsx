import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchFeaturedImageForPost,
  fetchPublicPostBySlug,
  fetchRecentPostsForSite,
} from "@/app/admin/(shell)/posts/actions";
import { PasswordProtectedPost } from "@/components/site/BlogPostPasswordGate";
import { BlogPostBody } from "@/components/site/blog/BlogPostBody";
import { ViewAllBlogPostsLink } from "@/components/site/blog/ViewAllBlogPostsLink";
import { ServiceAreaSidebar } from "@/components/site/ServiceAreaSidebar";
import {
  blogEstimateDescription,
  mapPostsToSidebarItems,
} from "@/lib/site/blogSidebar";
import { buildPageMetadata } from "@/lib/site/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublicPostBySlug(slug);

  if (!post) {
    return buildPageMetadata({
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const title = post.seoTitle?.trim() || post.title;
  const description =
    post.metaDescription?.trim() ||
    post.excerpt?.trim() ||
    `${post.title} — construction and framing insights from Elite Builders.`;

  return buildPageMetadata({
    title,
    description,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [post, recentPosts] = await Promise.all([
    fetchPublicPostBySlug(slug),
    fetchRecentPostsForSite({ limit: 3, excludeSlug: slug }),
  ]);

  if (!post) {
    notFound();
  }

  const featuredImage = await fetchFeaturedImageForPost(post.featuredImageId);

  if (post.visibility === "private") {
    notFound();
  }

  const pageTitle = post.seoTitle?.trim() || post.title;
  const sidebarPosts = mapPostsToSidebarItems(recentPosts);

  const article = (
    <>
      <section className="bg-white pb-16 pt-10">
        <div className="site-container">
          <div className="mt-0 grid grid-cols-1 items-start gap-8 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <div className="min-w-0">
              <div className="service-area-page-header">
                <h1 className="service-area-page-title">{pageTitle}</h1>
                <nav className="service-area-breadcrumbs" aria-label="Breadcrumb">
                  <Link href="/">Home</Link>
                  <span aria-hidden>/</span>
                  <Link href="/blog">Blog</Link>
                  <span aria-hidden>/</span>
                  <span aria-current="page">{post.title}</span>
                </nav>
              </div>

              <BlogPostBody
                content={post.content}
                excerpt={post.excerpt}
                featuredImage={featuredImage}
              />
            </div>

            <ServiceAreaSidebar
              estimateDescription={blogEstimateDescription}
              recentPosts={sidebarPosts}
            />
          </div>
        </div>
      </section>

      <ViewAllBlogPostsLink />
    </>
  );

  if (post.visibility === "password") {
    return (
      <PasswordProtectedPost slug={post.slug} title={post.title}>
        {article}
      </PasswordProtectedPost>
    );
  }

  return article;
}
