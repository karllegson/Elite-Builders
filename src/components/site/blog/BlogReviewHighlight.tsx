import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { blogSidebarReview } from "@/lib/site/blogSidebar";

export function BlogReviewHighlight() {
  return (
    <aside className="blog-widget blog-review-widget">
      <div className="blog-review-header">
        <span className="blog-review-avatar" aria-hidden>
          {blogSidebarReview.initial}
        </span>
        <div>
          <p className="blog-review-name">{blogSidebarReview.name}</p>
          <div className="blog-review-stars" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={14}
                strokeWidth={0}
                fill="currentColor"
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>
      <p className="blog-review-quote">&ldquo;{blogSidebarReview.quote}&rdquo;</p>
      <Link href={blogSidebarReview.reviewsHref} className="blog-review-link">
        Reviews
        <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
      </Link>
    </aside>
  );
}
