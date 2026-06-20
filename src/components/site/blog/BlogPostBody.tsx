import { ServiceAreaFeaturedImage } from "@/components/site/ServiceAreaFeaturedImage";
import { ServiceAreaHtmlContent } from "@/components/site/ServiceAreaHtmlContent";
import type { PostFeaturedImage } from "@/lib/admin/resolveMediaById";

type BlogPostBodyProps = {
  content: string;
  excerpt?: string;
  featuredImage?: PostFeaturedImage | null;
};

export function BlogPostBody({
  content,
  excerpt = "",
  featuredImage = null,
}: BlogPostBodyProps) {
  return (
    <div className="service-area-featured-intro">
      {featuredImage?.src ? (
        <>
          <ServiceAreaFeaturedImage
            src={featuredImage.src}
            alt={featuredImage.alt || featuredImage.title || "Blog post featured image"}
          />
          <hr className="service-area-featured-divider" />
        </>
      ) : null}

      {excerpt.trim() ? (
        <div className="service-area-html-content service-area-default-intro">
          <p>{excerpt.trim()}</p>
        </div>
      ) : null}

      <ServiceAreaHtmlContent html={content} />
    </div>
  );
}
