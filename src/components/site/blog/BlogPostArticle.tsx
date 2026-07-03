import { BlogPostContent } from "@/components/site/BlogPostContent";
import { BlogFeaturedImage } from "@/components/site/blog/BlogFeaturedImage";
import type { PostRecordDTO } from "@/lib/admin/posts.dto";
import type { PostFeaturedImage } from "@/lib/admin/resolveMediaById";

type BlogPostArticleProps = {
  post: PostRecordDTO;
  formattedDate?: string;
  featuredImage?: PostFeaturedImage | null;
};

export function BlogPostArticle({
  post,
  formattedDate,
  featuredImage = null,
}: BlogPostArticleProps) {
  const leadHeading =
    post.seoTitle && post.seoTitle.trim() !== post.title.trim()
      ? post.seoTitle
      : null;

  return (
    <article className="blog-post-article">
      <BlogFeaturedImage
        featuredImage={featuredImage}
        publishedAt={post.publishedAt}
      />

      <header className="blog-post-article-header">
        {leadHeading ? (
          <h2 className="blog-post-lead-heading">{leadHeading}</h2>
        ) : null}
        {formattedDate ? (
          <p className="blog-post-meta-date">{formattedDate}</p>
        ) : null}
        {post.excerpt ? (
          <p className="blog-post-lead-copy">{post.excerpt}</p>
        ) : null}
      </header>

      <BlogPostContent html={post.content} />
    </article>
  );
}
