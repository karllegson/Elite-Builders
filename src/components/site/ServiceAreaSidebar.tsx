"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Phone, Star } from "lucide-react";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
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
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
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
      ? `Planning a project in ${city}? Tell us about your framing or home building needs and our team will follow up within one business day.`
      : "Planning a project? Tell us about your framing or home building needs and our team will follow up within one business day.");

  return (
    <aside
      className="flex w-full flex-col gap-5 lg:sticky lg:top-28 lg:self-start"
      aria-label="Service area sidebar"
    >
      <div className="bg-ink bg-blueprint overflow-hidden rounded-3xl p-6 sm:p-7">
        <p className="eyebrow eyebrow-light">Free Estimate</p>
        <h2 className="mt-3 font-display text-xl font-bold text-white">Request a Free Estimate</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/70">{estimateCopy}</p>
        <div className="mt-6 grid gap-2.5">
          <EstimateCtaLink href="/#estimate" className="btn btn-primary w-full">
            Request a Free Estimate
            <ArrowRight size={16} aria-hidden className="btn-arrow" />
          </EstimateCtaLink>
          <a href={business.phoneHref} className="btn btn-glass w-full">
            <Phone size={16} aria-hidden />
            {business.phone}
          </a>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-solid border-site-line bg-white">
          <h3 className="px-6 pb-2 pt-6 font-display text-lg font-semibold">Recent Posts</h3>
          <ul className="px-3 pb-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={post.href}
                  className="group grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-site-surface"
                >
                  <span className="relative block size-16 shrink-0 overflow-hidden rounded-xl bg-site-surface">
                    <Image
                      src={post.imageSrc}
                      alt={post.imageAlt}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <span className="line-clamp-2 text-sm font-semibold leading-snug text-brand-ink">
                    {post.title}
                  </span>
                  <ChevronRight
                    size={16}
                    aria-hidden
                    className="shrink-0 text-site-text-muted transition-all group-hover:translate-x-0.5 group-hover:text-brand-red"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <figure className="rounded-3xl border border-solid border-site-line bg-site-surface p-6">
        <StarRating rating={review.rating} />
        <blockquote className="mt-4 text-[0.9375rem] leading-relaxed text-site-text-dark">
          &ldquo;{review.excerpt}&rdquo;
        </blockquote>
        <figcaption className="mt-5 flex items-center gap-3">
          <span
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy font-display font-semibold text-white"
            aria-hidden
          >
            {review.reviewerName.charAt(0)}
          </span>
          <span className="min-w-0 flex-1 font-display font-semibold text-brand-ink">
            {review.reviewerName}
          </span>
          <Link href={review.href} className="link-arrow text-sm">
            Reviews
            <ArrowRight size={14} aria-hidden />
          </Link>
        </figcaption>
      </figure>
    </aside>
  );
}
