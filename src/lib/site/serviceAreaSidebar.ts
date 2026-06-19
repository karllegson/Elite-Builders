import { homeImages } from "@/lib/site/images";

export type SidebarPostItem = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export type SidebarReviewItem = {
  reviewerName: string;
  rating: number;
  excerpt: string;
  href: string;
};

const SIDEBAR_POSTS: SidebarPostItem[] = [
  {
    id: "post-1",
    title: "Rough Framing Tips for Bay Area New Construction",
    href: "/blog",
    imageSrc: homeImages.residentialRoofFraming.src,
    imageAlt: homeImages.residentialRoofFraming.alt,
  },
  {
    id: "post-2",
    title: "What to Expect During a Custom Home Framing Project",
    href: "/blog",
    imageSrc: homeImages.customHomeFramingCrew.src,
    imageAlt: homeImages.customHomeFramingCrew.alt,
  },
  {
    id: "post-3",
    title: "How Production Builders Keep Framing Schedules on Track",
    href: "/blog",
    imageSrc: homeImages.twoStoryHomeFramingExterior.src,
    imageAlt: homeImages.twoStoryHomeFramingExterior.alt,
  },
];

const SIDEBAR_REVIEW: SidebarReviewItem = {
  reviewerName: "Maureen L.",
  rating: 5,
  excerpt:
    "Elite Builders IX handled our framing project with clear communication and dependable scheduling. The crew was professional from start to finish.",
  href: "/#reviews",
};

export function getServiceAreaSidebarPosts(): SidebarPostItem[] {
  return SIDEBAR_POSTS;
}

export function getServiceAreaSidebarReview(): SidebarReviewItem {
  return SIDEBAR_REVIEW;
}
