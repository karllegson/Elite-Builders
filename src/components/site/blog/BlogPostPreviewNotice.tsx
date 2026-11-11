import Link from "next/link";
import { Eye, PencilLine } from "lucide-react";
import type { PostPreviewReason } from "@/lib/admin/posts.server";
import { formatBlogDateLong } from "@/lib/site/formatBlogDate";

type BlogPostPreviewNoticeProps = {
  postId: string;
  reason: PostPreviewReason;
  publishedAt: string | null;
};

function describeReason(reason: PostPreviewReason, publishedAt: string | null): string {
  if (reason === "scheduled") {
    const date = formatBlogDateLong(publishedAt);
    return date
      ? `This post is scheduled for ${date} and is not live yet.`
      : "This post is scheduled and is not live yet.";
  }

  if (reason === "private") {
    return "This post is private and hidden from the public.";
  }

  return "This post is a draft and has not been published.";
}

/** Banner shown above a blog post that only signed-in admins can see. */
export function BlogPostPreviewNotice({
  postId,
  reason,
  publishedAt,
}: BlogPostPreviewNoticeProps) {
  return (
    <div role="status" className="border-b border-amber-300 bg-amber-50 text-amber-950">
      <div className="site-container flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200 px-2.5 py-0.5 font-display text-xs font-bold uppercase tracking-[0.12em]">
          <Eye size={14} aria-hidden />
          Preview
        </span>
        <p className="min-w-0 flex-1">
          {describeReason(reason, publishedAt)} Only signed-in admins can see this page.
        </p>
        <Link
          href={`/admin/posts/new?post=${encodeURIComponent(postId)}`}
          className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2 hover:text-amber-800"
        >
          <PencilLine size={14} aria-hidden />
          Edit post
        </Link>
      </div>
    </div>
  );
}
