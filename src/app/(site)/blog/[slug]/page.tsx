import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchFeaturedImageForPost,
  fetchPublicPostBySlug,
  fetchRecentPostsForSite,
} from "@/app/admin/(shell)/posts/actions";
import { PasswordProtectedPost } from "@/components/site/BlogPostPasswordGate";
import { BlogPostArticle } from "@/components/site/blog/BlogPostArticle";
import { BlogSidebar } from "@/components/site/blog/BlogSidebar";
import { ViewAllBlogPostsLink } from "@/components/site/blog/ViewAllBlogPostsLink";
import { SitePageTitleBar } from "@/components/site/SitePageTitleBar";
import { formatBlogDateLong } from "@/lib/site/formatBlogDate";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublicPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Elite Builders IX",
    };
  }

  return {
    title: post.seoTitle || `${post.title} | Elite Builders IX`,
    description: post.metaDescription || post.excerpt,
  };
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

  const formattedDate = post.publishedAt
    ? formatBlogDateLong(post.publishedAt)
    : undefined;

  const article = (
    <section className="blog-page-section">
      <div className="site-container blog-page-container">
        <div className="blog-layout">
          <div className="blog-layout-main">
            <SitePageTitleBar
              title={post.title}
              breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
            <BlogPostArticle
              post={post}
              formattedDate={formattedDate}
              featuredImage={featuredImage}
            />
          </div>

          <BlogSidebar recentPosts={recentPosts} />
        </div>

        <ViewAllBlogPostsLink />
      </div>
    </section>
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
