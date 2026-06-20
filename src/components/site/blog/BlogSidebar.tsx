import { BlogEstimateWidget } from "@/components/site/blog/BlogEstimateWidget";
import { BlogRecentPostsWidget } from "@/components/site/blog/BlogRecentPostsWidget";
import { BlogReviewHighlight } from "@/components/site/blog/BlogReviewHighlight";
import type { PostRecordDTO } from "@/lib/admin/posts.dto";

type BlogSidebarProps = {
  recentPosts: PostRecordDTO[];
};

export function BlogSidebar({ recentPosts }: BlogSidebarProps) {
  return (
    <div className="blog-sidebar">
      <BlogEstimateWidget />
      <BlogRecentPostsWidget posts={recentPosts} />
      <BlogReviewHighlight />
    </div>
  );
}
