import type { MediaAttachment } from "@/lib/admin/mediaLibrary";

export type MediaAttachmentDTO = Omit<MediaAttachment, "uploadedAt"> & {
  uploadedAt: string;
};

export function toMediaDTO(attachment: MediaAttachment): MediaAttachmentDTO {
  return {
    ...attachment,
    uploadedAt: attachment.uploadedAt.toISOString(),
  };
}

export function fromMediaDTO(attachment: MediaAttachmentDTO): MediaAttachment {
  return {
    ...attachment,
    uploadedAt: new Date(attachment.uploadedAt),
  };
}
