import type { PostRecordDTO } from "@/lib/admin/posts.dto";
import { homeImages } from "@/lib/site/images";
import type { SidebarPostItem } from "@/lib/site/serviceAreaSidebar";

export const blogEstimateDescription =
  "Planning a remodel or new build? Tell us about your framing, siding, or deck needs and our team will follow up within one business day.";

const FALLBACK_SIDEBAR_IMAGES = [
  homeImages.residentialRoofFraming,
  homeImages.customHomeFramingCrew,
  homeImages.twoStoryHomeFramingExterior,
] as const;

export function mapPostsToSidebarItems(posts: PostRecordDTO[]): SidebarPostItem[] {
  return posts.map((post, index) => {
    const image = FALLBACK_SIDEBAR_IMAGES[index % FALLBACK_SIDEBAR_IMAGES.length];

    return {
      id: post.id,
      title: post.title,
      href: `/blog/${post.slug}`,
      imageSrc: image.src,
      imageAlt: image.alt,
    };
  });
}
