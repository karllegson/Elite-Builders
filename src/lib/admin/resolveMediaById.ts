import { getDefaultMediaLibrary } from "@/lib/admin/mediaLibrary";
import { getMediaAssetById } from "@/lib/admin/media.server";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";

export async function resolveMediaById(id: string): Promise<MediaAttachment | null> {
  if (!id) {
    return null;
  }

  try {
    const asset = await getMediaAssetById(id);

    if (asset) {
      return asset;
    }
  } catch {
    // Fall back to bundled library items when Supabase is unavailable.
  }

  return getDefaultMediaLibrary().find((item) => item.id === id) ?? null;
}

export type PostFeaturedImage = {
  src: string;
  alt: string;
  title: string;
  caption: string;
  width: number;
  height: number;
};

export function toPostFeaturedImage(
  attachment: MediaAttachment,
): PostFeaturedImage {
  return {
    src: attachment.src,
    alt: attachment.alt || attachment.title,
    title: attachment.title,
    caption: attachment.caption,
    width: attachment.width,
    height: attachment.height,
  };
}
