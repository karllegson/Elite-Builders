import { listPublishedPublicFaqsForCategoryRef } from "@/lib/admin/faqs.server";
import { ServiceAreaContentPanel } from "@/components/site/ServiceAreaContentPanel";
import { ServiceAreaFeaturedImage } from "@/components/site/ServiceAreaFeaturedImage";
import type { PostFeaturedImage } from "@/lib/admin/resolveMediaById";
import { shouldShowPostExcerpt } from "@/lib/site/postContent";
import { parseServiceAreaContent } from "@/lib/site/serviceAreaContent";

type BlogPostBodyProps = {
  content: string;
  excerpt?: string;
  featuredImage?: PostFeaturedImage | null;
};

export async function BlogPostBody({
  content,
  excerpt = "",
  featuredImage = null,
}: BlogPostBodyProps) {
  const showExcerpt = shouldShowPostExcerpt(content, excerpt);
  const parsed = parseServiceAreaContent(content);
  const faqItems = parsed.faqCategoryRef
    ? await listPublishedPublicFaqsForCategoryRef(parsed.faqCategoryRef).catch(() => [])
    : undefined;

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

      {showExcerpt ? (
        <div className="service-area-html-content service-area-default-intro">
          <p>{excerpt.trim()}</p>
        </div>
      ) : null}

      <ServiceAreaContentPanel content={content} faqItems={faqItems} />
    </div>
  );
}
