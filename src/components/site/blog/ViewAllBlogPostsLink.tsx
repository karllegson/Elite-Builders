import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ViewAllBlogPostsLink() {
  return (
    <div className="blog-view-all-wrap">
      <Link href="/blog" className="blog-view-all-link">
        View All Blog Posts
        <ArrowRight size={16} strokeWidth={2.5} aria-hidden />
      </Link>
    </div>
  );
}
