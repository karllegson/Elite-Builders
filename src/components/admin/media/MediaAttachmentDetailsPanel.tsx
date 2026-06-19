"use client";

import { X } from "lucide-react";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";

type MediaAttachmentDetailsPanelProps = {
  attachment: MediaAttachment;
  onChange: (attachment: MediaAttachment) => void;
  onClose: () => void;
  onSave: (attachment: MediaAttachment) => void;
  onDelete: (id: string) => void;
  formatFileSize: (bytes: number) => string;
  formatMediaDate: (date: Date) => string;
  uploadedBy?: string;
  onCopyUrl?: () => void;
};

export function MediaAttachmentDetailsPanel({
  attachment,
  onChange,
  onClose,
  onSave,
  onDelete,
  formatFileSize,
  formatMediaDate,
  uploadedBy = "Elite Builders",
  onCopyUrl,
}: MediaAttachmentDetailsPanelProps) {
  const updateField = <K extends keyof MediaAttachment>(
    field: K,
    value: MediaAttachment[K],
  ) => {
    onChange({ ...attachment, [field]: value });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(attachment.src);
      onCopyUrl?.();
    } catch {
      // Clipboard may be unavailable.
    }
  };

  return (
    <aside className="admin-media-attachment-details">
      <div className="admin-media-attachment-details-header">
        <h3>Attachment Details</h3>
        <button
          type="button"
          className="admin-media-attachment-details-close"
          aria-label="Close attachment details"
          onClick={onClose}
        >
          <X size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="admin-media-attachment-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={attachment.src} alt={attachment.alt || attachment.title} />
      </div>

      <dl className="admin-media-attachment-upload-meta">
        <div>
          <dt>Uploaded on:</dt>
          <dd>{formatMediaDate(attachment.uploadedAt)}</dd>
        </div>
        <div>
          <dt>Uploaded by:</dt>
          <dd>{uploadedBy}</dd>
        </div>
        <div>
          <dt>File name:</dt>
          <dd>{attachment.filename}</dd>
        </div>
        <div>
          <dt>File type:</dt>
          <dd>{attachment.mimeType}</dd>
        </div>
        <div>
          <dt>File size:</dt>
          <dd>{formatFileSize(attachment.fileSize)}</dd>
        </div>
        <div>
          <dt>Dimensions:</dt>
          <dd>
            {attachment.width > 0 && attachment.height > 0
              ? `${attachment.width} by ${attachment.height} pixels`
              : "Dimensions unavailable"}
          </dd>
        </div>
      </dl>

      <div className="admin-media-attachment-actions">
        <button
          type="button"
          className="admin-inline-link"
          onClick={() => onSave(attachment)}
        >
          Save details
        </button>
        <button
          type="button"
          className="admin-media-delete-link"
          onClick={() => onDelete(attachment.id)}
        >
          Delete permanently
        </button>
      </div>

      <label className="admin-media-field">
        <span>Alt Text</span>
        <textarea
          rows={3}
          value={attachment.alt}
          onChange={(event) => updateField("alt", event.target.value)}
        />
        <span className="admin-media-field-help">
          Leave empty if the image is purely decorative.
        </span>
      </label>

      <label className="admin-media-field">
        <span>Title</span>
        <input
          type="text"
          value={attachment.title}
          onChange={(event) => updateField("title", event.target.value)}
        />
      </label>

      <label className="admin-media-field">
        <span>Caption</span>
        <textarea
          rows={2}
          value={attachment.caption}
          onChange={(event) => updateField("caption", event.target.value)}
        />
      </label>

      <label className="admin-media-field">
        <span>Description</span>
        <textarea
          rows={3}
          value={attachment.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </label>

      <div className="admin-media-attachment-url">
        <label className="admin-media-field">
          <span>File URL</span>
          <input type="text" readOnly value={attachment.src} />
        </label>
        <button type="button" className="admin-btn-secondary" onClick={handleCopyUrl}>
          Copy URL to clipboard
        </button>
      </div>
    </aside>
  );
}
