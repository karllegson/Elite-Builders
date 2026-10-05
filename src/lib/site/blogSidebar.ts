import type { PostRecordDTO } from "@/lib/admin/posts.dto";
import {
  getServiceAreaSidebarReview,
  type SidebarPostItem,
} from "@/lib/site/serviceAreaSidebar";
import { homeImages } from "@/lib/site/images";

export const blogEstimateDescription =
  "Planning a remodel or new build? Tell us about your framing or home building needs and our team will follow up within one business day.";

const sidebarReview = getServiceAreaSidebarReview();

export const blogSidebarReview = {
  initial: sidebarReview.reviewerName.charAt(0),
  name: sidebarReview.reviewerName,
  quote: sidebarReview.excerpt,
  reviewsHref: sidebarReview.href,
} as const;

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
