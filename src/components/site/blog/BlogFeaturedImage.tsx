import ContentImage from "@/components/site/ContentImage";
import { BlogFeaturedImagePlaceholder } from "@/components/site/blog/BlogFeaturedImagePlaceholder";
import {
  formatBlogFeaturedDateTag,
  type BlogFeaturedDateTag,
} from "@/lib/site/formatBlogDate";
import type { PostFeaturedImage } from "@/lib/admin/resolveMediaById";

type BlogFeaturedImageProps = {
  featuredImage: PostFeaturedImage | null;
  publishedAt?: string | null;
};

function FeaturedImageDateTag({ dateTag }: { dateTag: BlogFeaturedDateTag }) {
  return (
    <time className="blog-featured-image-date" dateTime={dateTag.iso}>
      <span className="blog-featured-image-date-month">{dateTag.month}</span>
      <span className="blog-featured-image-date-day">{dateTag.day}</span>
      <span className="blog-featured-image-date-year">{dateTag.year}</span>
    </time>
  );
}

export function BlogFeaturedImage({
  featuredImage,
  publishedAt = null,
}: BlogFeaturedImageProps) {
  const dateTag = formatBlogFeaturedDateTag(publishedAt);

  if (!featuredImage?.src) {
    return <BlogFeaturedImagePlaceholder />;
  }

  return (
    <figure className="blog-featured-image">
      <div className="blog-featured-image-frame">
        <ContentImage
          src={featuredImage.src}
          alt={featuredImage.alt}
          className="blog-featured-image-media"
          sizes="(max-width: 1024px) 100vw, 720px"
          quality={90}
          priority
        />
        {dateTag ? <FeaturedImageDateTag dateTag={dateTag} /> : null}
      </div>
      {featuredImage.caption ? (
        <figcaption className="blog-featured-image-caption">
          {featuredImage.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
