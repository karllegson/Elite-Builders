import type { Metadata } from "next";
import CtaBand from "@/components/site/CtaBand";
import JsonLd from "@/components/site/JsonLd";
import PageHero from "@/components/site/PageHero";
import { notFound } from "next/navigation";
import {
  fetchFeaturedImageForPost,
  fetchRecentPostsForSite,
} from "@/app/admin/(shell)/posts/actions";
import { PasswordProtectedPost } from "@/components/site/BlogPostPasswordGate";
import { BlogPostBody } from "@/components/site/blog/BlogPostBody";
import { BlogPostPreviewNotice } from "@/components/site/blog/BlogPostPreviewNotice";
import { ViewAllBlogPostsLink } from "@/components/site/blog/ViewAllBlogPostsLink";
import { ServiceAreaSidebar } from "@/components/site/ServiceAreaSidebar";
import {
  blogEstimateDescription,
  mapPostsToSidebarItems,
} from "@/lib/site/blogSidebar";
import { getBlogPostView } from "@/lib/site/blogPostView";
import { formatBlogDateLong } from "@/lib/site/formatBlogDate";
import { buildPageMetadata } from "@/lib/site/seo";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/site/structuredData";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = await getBlogPostView(slug);

  if (!view) {
    return buildPageMetadata({
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  const { post, previewReason } = view;
  const title = post.seoTitle?.trim() || post.title;
  const description =
    post.metaDescription?.trim() ||
    post.excerpt?.trim() ||
    `${post.title} — construction and framing insights from Elite Builders.`;

  return buildPageMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    // Admin-only previews (drafts, scheduled, private) must never be indexed.
    noIndex: previewReason !== null,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const [view, recentPosts] = await Promise.all([
    getBlogPostView(slug),
    fetchRecentPostsForSite({ limit: 3, excludeSlug: slug }),
  ]);

  if (!view) {
    notFound();
  }

  const { post, previewReason } = view;
  const featuredImage = await fetchFeaturedImageForPost(post.featuredImageId);

  const sidebarPosts = mapPostsToSidebarItems(recentPosts);
  // Posts written with their own <h1> keep it; the header title then isn't a second H1.
  const contentHasH1 = /<h1\b/i.test(post.content);
  const description =
    post.metaDescription?.trim() ||
    post.excerpt?.trim() ||
    `${post.title} — construction and framing insights from Elite Builders.`;

  const previewNotice = previewReason ? (
    <BlogPostPreviewNotice
      postId={post.id}
      reason={previewReason}
      publishedAt={post.publishedAt}
    />
  ) : null;

  const article = (
    <>
      {previewReason ? null : (
        <JsonLd
          data={[
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: post.title, path: `/blog/${slug}` },
            ]),
            blogPostingSchema({
              headline: post.seoTitle?.trim() || post.title,
              path: `/blog/${slug}`,
              description,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              image: featuredImage?.src,
            }),
          ]}
        />
      )}
      <PageHero
        size="compact"
        titleAs={contentHasH1 ? "p" : "h1"}
        eyebrow={formatBlogDateLong(post.publishedAt) || "Blog"}
        // The on-page heading is the post title; the SEO title only feeds <title>/meta.
        title={post.title}
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
      <>
        {previewNotice}
        <PasswordProtectedPost slug={post.slug} title={post.title}>
          {article}
        </PasswordProtectedPost>
      </>
    );
  }

  return (
    <>
      {previewNotice}
      {article}
    </>
  );
}
