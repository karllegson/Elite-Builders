import type { Metadata } from "next";
import CtaBand from "@/components/site/CtaBand";
import PageHero from "@/components/site/PageHero";
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
import { formatBlogDateLong } from "@/lib/site/formatBlogDate";
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
      <PageHero
        size="compact"
        eyebrow={formatBlogDateLong(post.publishedAt) || "Blog"}
        title={pageTitle}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <section className="section-sm bg-white">
        <div className="site-container">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="min-w-0">
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

      <CtaBand />
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
