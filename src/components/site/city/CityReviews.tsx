import { Star } from "lucide-react";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import { clientTodo } from "@/lib/site/cityPages";
import type { PublicReviewItem } from "@/lib/site/reviewsPublic";

const reviewsTodo = clientTodo(
  "Reviews appear here automatically once they're published in the admin Reviews module. This section stays hidden from visitors until then.",
);

function Stars({ rating }: { rating: number }) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          aria-hidden
          className={index < value ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
    </span>
  );
}

type CityReviewsProps = {
  city: string;
  reviews: PublicReviewItem[];
  showDrafts: boolean;
};

export function CityReviews({ city, reviews, showDrafts }: CityReviewsProps) {
  if (reviews.length === 0) {
    return showDrafts ? (
      <section className="section-sm bg-white" aria-label="Reviews (admin preview)">
        <div className="site-container">
          <p className="spec-label">Reviews</p>
          <ClientTodoNote todo={reviewsTodo} show className="mt-4" />
        </div>
      </section>
    ) : null;
  }

  return (
    <section className="section bg-white" aria-labelledby="city-reviews-heading">
      <div className="site-container">
        <p className="spec-label">Reviews</p>
        <h2 id="city-reviews-heading" className="section-title mt-4">
          What {city} clients say
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id}>
              <figure className="flex h-full flex-col rounded-3xl border border-solid border-site-line bg-site-surface p-6 sm:p-7">
                <Stars rating={review.rating} />
                <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-site-text-dark">
                  &ldquo;{review.excerpt}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-solid border-site-line pt-4 text-sm">
                  <span className="font-display font-semibold text-brand-ink">{review.reviewerName}</span>
                  {review.source ? <span className="text-site-text-muted">via {review.source}</span> : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
