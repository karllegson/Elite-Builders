import { cache } from "react";
import { getSiteAdminSession } from "@/lib/admin/getSiteAdminSession";
import { toPostDTO, type PostRecordDTO } from "@/lib/admin/posts.dto";
import {
  getPostBySlug,
  getPostPreviewReason,
  type PostPreviewReason,
} from "@/lib/admin/posts.server";

export type BlogPostView = {
  post: PostRecordDTO;
  /** Set when the post is only visible because an admin is signed in. */
  previewReason: PostPreviewReason | null;
};

/**
 * Loads a blog post for `/blog/[slug]`.
 *
 * Published posts are returned to everyone. Drafts, future-scheduled and private
 * posts are returned only to signed-in admins so they can preview them before
 * publishing; everyone else gets null (→ 404). Trashed posts are never returned.
 *
 * Memoized per request so `generateMetadata` and the page share one lookup.
 */
export const getBlogPostView = cache(
  async (slug: string): Promise<BlogPostView | null> => {
    let post: Awaited<ReturnType<typeof getPostBySlug>>;

    try {
      post = await getPostBySlug(slug);
    } catch {
      return null;
    }

    if (!post || post.status === "trash") {
      return null;
    }

    const previewReason = getPostPreviewReason(post);

    if (previewReason) {
      const session = await getSiteAdminSession();

      if (!session.isAdmin) {
        return null;
      }
    }

    return { post: toPostDTO(post), previewReason };
  },
);
