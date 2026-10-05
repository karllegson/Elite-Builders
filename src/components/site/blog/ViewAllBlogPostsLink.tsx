import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ViewAllBlogPostsLink() {
  return (
    <div className="site-container pt-4 text-center">
      <Link href="/blog" className="link-arrow">
        <ArrowLeft size={16} aria-hidden />
        View All Blog Posts
      </Link>
    </div>
  );
}
