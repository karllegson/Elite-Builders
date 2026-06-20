import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ViewAllBlogPostsLink() {
  return (
    <section className="border-t border-solid border-gray-100 bg-gray-50/40 py-12">
      <div className="site-container text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-solid border-brand-navy px-7 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
        >
          View All Blog Posts
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
