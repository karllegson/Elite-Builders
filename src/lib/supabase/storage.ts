import { getSupabaseEnv } from "./env";

/** Public bucket for CMS-managed images (gallery, posts, homepage content). */
export const MEDIA_BUCKET = "media";

export function getMediaPublicUrl(storagePath: string): string {
  const { url } = getSupabaseEnv();
  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${url}/storage/v1/object/public/${MEDIA_BUCKET}/${encodedPath}`;
}

export function getSupabaseStorageHostname(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
}
