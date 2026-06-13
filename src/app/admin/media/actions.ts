"use server";

import {
  deleteMediaAsset,
  listMediaAssets,
  updateMediaAsset,
  uploadMediaAsset,
} from "@/lib/admin/media.server";
import { fromMediaDTO, toMediaDTO, type MediaAttachmentDTO } from "@/lib/admin/media.dto";
import { getDefaultMediaLibrary } from "@/lib/admin/mediaLibrary";
import { hasAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function fetchMediaLibrary(): Promise<{
  items: MediaAttachmentDTO[];
  source: "supabase" | "local";
}> {
  if (!isSupabaseConfigured() || !hasAdminClient()) {
    return {
      items: getDefaultMediaLibrary().map(toMediaDTO),
      source: "local",
    };
  }

  try {
    const items = await listMediaAssets();

    if (items.length === 0) {
      return {
        items: getDefaultMediaLibrary().map(toMediaDTO),
        source: "local",
      };
    }

    return {
      items: items.map(toMediaDTO),
      source: "supabase",
    };
  } catch {
    return {
      items: getDefaultMediaLibrary().map(toMediaDTO),
      source: "local",
    };
  }
}

export async function uploadMedia(formData: FormData): Promise<{
  item?: MediaAttachmentDTO;
  error?: string;
}> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image file." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "Only image uploads are supported." };
  }

  if (!hasAdminClient()) {
    return {
      error:
        "Add SUPABASE_SERVICE_ROLE_KEY to .env.local to enable Supabase media uploads.",
    };
  }

  try {
    const item = await uploadMediaAsset(file);
    return { item: toMediaDTO(item) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Upload failed.",
    };
  }
}

export async function saveMediaDetails(
  attachment: MediaAttachmentDTO,
): Promise<{ item?: MediaAttachmentDTO; error?: string }> {
  if (!hasAdminClient()) {
    return { item: attachment };
  }

  try {
    const item = await updateMediaAsset(attachment.id, {
      title: attachment.title,
      alt: attachment.alt,
      caption: attachment.caption,
      description: attachment.description,
    });

    return { item: toMediaDTO(item) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save details.",
    };
  }
}

export async function removeMedia(id: string): Promise<{ error?: string }> {
  if (!hasAdminClient()) {
    return { error: "Supabase admin storage is not configured." };
  }

  try {
    await deleteMediaAsset(id);
    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Delete failed.",
    };
  }
}