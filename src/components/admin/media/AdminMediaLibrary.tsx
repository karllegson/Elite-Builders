"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent, DragEvent } from "react";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import { MediaAttachmentDetailsPanel } from "@/components/admin/media/MediaAttachmentDetailsPanel";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { useMediaLibrary } from "./useMediaLibrary";

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
  const toast = useAdminToast();
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
    dateOptions,
    filteredLibraryItems,
    handleSelectAttachment,
    handleAttachmentChange,
    persistAttachment,
    processFiles,
    handleDeleteAttachment,
    formatFileSize,
    formatMediaDate,
  } = useMediaLibrary(true, (message) => toast.success(message));

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
          <MediaAttachmentDetailsPanel
            attachment={selectedAttachment}
            onChange={handleAttachmentChange}
            onClose={() => setSelectedId(null)}
            onSave={persistAttachment}
            onDelete={handleDeleteAttachment}
            formatFileSize={formatFileSize}
            formatMediaDate={formatMediaDate}
            onCopyUrl={() => toast.success("URL copied to clipboard.")}
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
