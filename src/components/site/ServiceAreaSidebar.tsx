"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Phone, Star } from "lucide-react";
import {
  getServiceAreaSidebarPosts,
  getServiceAreaSidebarReview,
} from "@/lib/site/serviceAreaSidebar";
import { business } from "@/lib/site/config";

type ServiceAreaSidebarProps = {
  city?: string;
  estimateDescription?: string;
  recentPosts?: ReturnType<typeof getServiceAreaSidebarPosts>;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="mt-0.5 flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={14}
          aria-hidden
          className={
            index < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

export function ServiceAreaSidebar({
  city,
  estimateDescription,
  recentPosts,
}: ServiceAreaSidebarProps) {
  const posts = recentPosts ?? getServiceAreaSidebarPosts();
  const review = getServiceAreaSidebarReview();
  const estimateCopy =
    estimateDescription ??
    (city
      ? `Planning a project in ${city}? Tell us about your framing, siding, or deck needs and our team will follow up within one business day.`
      : "Planning a project? Tell us about your framing, siding, or deck needs and our team will follow up within one business day.");

  return (
    <aside
      className="flex w-full flex-col gap-5 lg:sticky lg:top-28 lg:self-start"
      aria-label="Service area sidebar"
    >
      <div className="overflow-hidden rounded-lg border border-solid border-gray-200 bg-white">
        <h2 className="bg-brand-red px-4 py-3 text-base font-bold text-white">
          Request a Free Estimate
        </h2>
        <p className="px-4 pt-4 text-sm leading-relaxed text-gray-600">{estimateCopy}</p>
        <Link
          href="/#estimate"
          className="mx-4 mt-4 block rounded-md bg-brand-red px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-brand-red-dark"
        >
          Request a Free Estimate
        </Link>
        <a
          href={business.phoneHref}
          className="mx-4 mb-4 mt-3 flex items-center justify-center gap-2 rounded-md border border-solid border-gray-300 px-4 py-3 text-sm font-bold text-brand-navy"
        >
          <Phone size={16} aria-hidden className="shrink-0" />
          {business.phone}
        </a>
      </div>

      <div className="overflow-hidden rounded-lg border border-solid border-gray-200 bg-white">
        <h3 className="border-b border-solid border-gray-200 px-4 py-3 text-base font-bold text-brand-navy">
          Recent Posts
        </h3>
        <ul>
          {posts.map((post, index) => (
            <li
              key={post.id}
              className={index > 0 ? "border-t border-solid border-gray-100" : undefined}
            >
              <Link
                href={post.href}
                className="grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 no-underline"
              >
                <span className="relative block h-[72px] w-[72px] shrink-0 overflow-hidden rounded bg-gray-100">
                  <Image
                    src={post.imageSrc}
                    alt={post.imageAlt}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </span>
                <span className="text-sm font-semibold leading-snug text-gray-700">
                  {post.title}
                </span>
                <ChevronRight
                  size={16}
                  aria-hidden
                  className="shrink-0 text-brand-red"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-base font-bold text-white"
            aria-hidden
          >
            {review.reviewerName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900">{review.reviewerName}</p>
            <StarRating rating={review.rating} />
          </div>
        </div>
        <p className="mt-4 border-t border-solid border-gray-200 pt-4 text-sm leading-relaxed text-gray-500">
          {review.excerpt}
        </p>
        <Link
          href={review.href}
          className="mt-4 inline-flex items-center gap-1 rounded border border-solid border-brand-red px-3 py-1.5 text-sm font-bold text-brand-red no-underline"
        >
          Reviews
          <ChevronRight size={14} aria-hidden className="shrink-0" />
        </Link>
      </div>
    </aside>
  );
}
