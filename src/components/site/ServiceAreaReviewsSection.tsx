"use client";

import { useMemo } from "react";
import { listPublishedReviewsForCategory } from "@/lib/site/reviewsPublic";
import type { ServiceAreaReviewsBlockConfig } from "@/lib/site/serviceAreaContent";

type ServiceAreaReviewsSectionProps = {
  config: ServiceAreaReviewsBlockConfig;
};

function StarRating({ rating }: { rating: number }) {
  const stars = Array.from({ length: 5 }, (_, index) => index < rating);

  return (
    <span className="service-area-reviews__stars" aria-label={`${rating} out of 5 stars`}>
      {stars.map((filled, index) => (
        <span key={index} className={filled ? "is-filled" : ""} aria-hidden>
          ★
        </span>
      ))}
    </span>
  );
}

export function ServiceAreaReviewsSection({ config }: ServiceAreaReviewsSectionProps) {
  const reviews = useMemo(
    () => listPublishedReviewsForCategory(config.categoryRef, config.amount),
    [config.amount, config.categoryRef],
  );

  return (
    <section
      data-quick-link-id="reviews"
      className="service-area-reviews"
      aria-labelledby="service-area-reviews-heading"
    >
      <h2 id="service-area-reviews-heading" className="sr-only">
        Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="service-area-reviews__empty" role="status">
          No reviews found.
        </p>
      ) : (
        <div className="service-area-reviews__grid">
          {reviews.map((review) => (
            <article key={review.id} className="service-area-reviews__card">
              <StarRating rating={review.rating} />
              <p className="service-area-reviews__reviewer">{review.reviewerName}</p>
              <p className="service-area-reviews__excerpt">{review.excerpt}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
