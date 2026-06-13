"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent, DragEvent } from "react";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import { useMediaLibrary } from "./useMediaLibrary";

type AttachmentDetailsProps = {
  attachment: MediaAttachment;
  onChange: (attachment: MediaAttachment) => void;
  onClose: () => void;
  onSave: (attachment: MediaAttachment) => void;
  onDelete: (id: string) => void;
  formatFileSize: (bytes: number) => string;
  formatMediaDate: (date: Date) => string;
};

function AttachmentDetailsPanel({
  attachment,
  onChange,
  onClose,
  onSave,
  onDelete,
  formatFileSize,
  formatMediaDate,
}: AttachmentDetailsProps) {
  const updateField = <K extends keyof MediaAttachment>(
    field: K,
    value: MediaAttachment[K],
  ) => {
    onChange({ ...attachment, [field]: value });
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(attachment.src);
    } catch {
      // Clipboard may be unavailable in some browsers.
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

      <p className="admin-media-attachment-filename">{attachment.filename}</p>
      <p className="admin-media-attachment-meta">
        {formatMediaDate(attachment.uploadedAt)}
        <br />
        {formatFileSize(attachment.fileSize)}
        <br />
        {attachment.width > 0 && attachment.height > 0
          ? `${attachment.width} by ${attachment.height} pixels`
          : "Dimensions unavailable"}
      </p>

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
          Copy URL
        </button>
      </div>
    </aside>
  );
}

type AdminMediaLibraryProps = {
  showFooter?: boolean;
  footerLabel?: string;
  onFooterAction?: (attachment: MediaAttachment) => void;
};

export default function AdminMediaLibrary({
  showFooter = false,
  footerLabel = "Use selected image",
  onFooterAction,
}: AdminMediaLibraryProps) {
  const {
    fileInputRef,
    source,
    selectedAttachment,
    selectedId,
    setSelectedId,
    typeFilter,
    setTypeFilter,
    dateFilter,
    setDateFilter,
    searchQuery,
    setSearchQuery,
    isDragging,
    setIsDragging,
    uploadError,
    isLoading,
    statusMessage,
    dateOptions,
    filteredLibraryItems,
    handleSelectAttachment,
    handleAttachmentChange,
    persistAttachment,
    processFiles,
    handleDeleteAttachment,
    formatFileSize,
    formatMediaDate,
  } = useMediaLibrary(true);

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    await processFiles(files);
    event.target.value = "";
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length) {
      await processFiles(event.dataTransfer.files);
    }
  };

  return (
    <div className="admin-media-page">
      <div className="admin-media-page-header">
        <div>
          <p className="admin-media-page-eyebrow">Supabase Storage</p>
          <h1>Media Library</h1>
          <p className="admin-media-page-copy">
            Upload gallery, blog, and homepage content images here. Logo and favicon
            stay in the repo under <code>public/</code>.
          </p>
        </div>
        <div className="admin-media-page-status">
          <span className={`admin-media-source-pill is-${source}`}>
            {source === "supabase" ? "Connected" : "Local fallback"}
          </span>
          {statusMessage ? <span>{statusMessage}</span> : null}
        </div>
      </div>

      <div className="admin-media-page-layout">
        <div className="admin-media-library-main">
          <div
            className={`admin-media-upload-zone admin-media-upload-zone-inline${isDragging ? " is-dragging" : ""}`}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
          >
            <p className="admin-media-upload-title">Drop images to upload to Supabase</p>
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {isLoading ? "Working..." : "Select Files"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="admin-media-file-input"
              onChange={handleFileInputChange}
            />
            {uploadError ? <p className="admin-media-upload-error">{uploadError}</p> : null}
          </div>

          <div className="admin-media-library-toolbar">
            <label className="admin-media-filter">
              <span className="screen-reader-text">Filter by type</span>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="images">Images</option>
                <option value="all">All media items</option>
              </select>
            </label>
            <label className="admin-media-filter">
              <span className="screen-reader-text">Filter by date</span>
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option value="all">All dates</option>
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-media-search">
              <span className="screen-reader-text">Search media</span>
              <input
                type="search"
                placeholder="Search media"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="admin-media-grid-wrap">
            <div className="admin-media-grid" role="listbox" aria-label="Media items">
              {filteredLibraryItems.map((item) => {
                const isSelected = selectedId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`admin-media-grid-item${isSelected ? " is-selected" : ""}`}
                    onClick={() => handleSelectAttachment(item)}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt || item.title}
                      width={160}
                      height={120}
                      unoptimized={item.src.startsWith("blob:")}
                    />
                    <span className="admin-media-grid-item-title">{item.title}</span>
                    {isSelected ? (
                      <span className="admin-media-grid-check" aria-hidden>
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {selectedAttachment ? (
          <AttachmentDetailsPanel
            attachment={selectedAttachment}
            onChange={handleAttachmentChange}
            onClose={() => setSelectedId(null)}
            onSave={persistAttachment}
            onDelete={handleDeleteAttachment}
            formatFileSize={formatFileSize}
            formatMediaDate={formatMediaDate}
          />
        ) : (
          <div className="admin-media-attachment-placeholder" aria-hidden />
        )}
      </div>

      {showFooter ? (
        <div className="admin-media-modal-footer">
          <button
            type="button"
            className="admin-btn-primary-inline"
            disabled={!selectedAttachment}
            onClick={() => {
              if (selectedAttachment && onFooterAction) {
                onFooterAction(selectedAttachment);
              }
            }}
          >
            {footerLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
