import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { getMediaPublicUrl, MEDIA_BUCKET } from "@/lib/supabase/storage";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";

type MediaAssetRow = {
  id: string;
  storage_path: string;
  filename: string;
  title: string;
  alt: string;
  caption: string;
  description: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  source_key: string | null;
  created_at: string;
};

export function rowToMediaAttachment(row: MediaAssetRow): MediaAttachment {
  return {
    id: row.id,
    src: getMediaPublicUrl(row.storage_path),
    filename: row.filename,
    title: row.title,
    alt: row.alt,
    caption: row.caption,
    description: row.description,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    width: row.width ?? 0,
    height: row.height ?? 0,
    uploadedAt: new Date(row.created_at),
  };
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export async function listMediaAssets(): Promise<MediaAttachment[]> {
  if (!hasAdminClient()) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as MediaAssetRow[]).map(rowToMediaAttachment);
}

export async function uploadMediaAsset(
  file: File,
  metadata: {
    title?: string;
    alt?: string;
    caption?: string;
    description?: string;
    sourceKey?: string;
    width?: number;
    height?: number;
  } = {},
): Promise<MediaAttachment> {
  const supabase = createAdminClient();
  const id = crypto.randomUUID();
  const filename = sanitizeFilename(file.name);
  const storagePath = metadata.sourceKey
    ? `content/home/${filename}`
    : `uploads/${id}/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: Boolean(metadata.sourceKey),
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const title =
    metadata.title ??
    filename
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const row = {
    storage_path: storagePath,
    filename,
    title,
    alt: metadata.alt ?? "",
    caption: metadata.caption ?? "",
    description: metadata.description ?? title,
    mime_type: file.type || "image/jpeg",
    file_size: file.size,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    source_key: metadata.sourceKey ?? null,
  };

  const query = metadata.sourceKey
    ? supabase.from("media_assets").upsert(row, { onConflict: "source_key" })
    : supabase.from("media_assets").insert(row);

  const { data, error } = await query.select("*").single();

  if (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    throw new Error(error.message);
  }

  return rowToMediaAttachment(data as MediaAssetRow);
}

export async function updateMediaAsset(
  id: string,
  updates: Pick<MediaAttachment, "title" | "alt" | "caption" | "description">,
): Promise<MediaAttachment> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .update({
      title: updates.title,
      alt: updates.alt,
      caption: updates.caption,
      description: updates.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return rowToMediaAttachment(data as MediaAssetRow);
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { data: asset, error: fetchError } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const { error: storageError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([asset.storage_path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error: deleteError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}

export async function getMediaAssetById(id: string): Promise<MediaAttachment | null> {
  if (!hasAdminClient()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? rowToMediaAttachment(data as MediaAssetRow) : null;
}

export async function getMediaAssetBySourceKey(
  sourceKey: string,
): Promise<MediaAttachment | null> {
  if (!hasAdminClient()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("source_key", sourceKey)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? rowToMediaAttachment(data as MediaAssetRow) : null;
}
