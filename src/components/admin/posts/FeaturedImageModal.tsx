"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, type ChangeEvent, type DragEvent } from "react";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import { MediaAttachmentDetailsPanel } from "@/components/admin/media/MediaAttachmentDetailsPanel";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { useMediaLibrary } from "@/components/admin/media/useMediaLibrary";

type FeaturedImageModalTab = "upload" | "library";

export type FeaturedImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSetFeaturedImage: (attachment: MediaAttachment) => void;
};

export function FeaturedImageModal({
  isOpen,
  onClose,
  onSetFeaturedImage,
}: FeaturedImageModalProps) {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<FeaturedImageModalTab>("library");
  const {
    fileInputRef,
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
  } = useMediaLibrary(isOpen, (message) => toast.success(message));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveTab("library");
    setSelectedId(null);
    setTypeFilter("images");
    setDateFilter("all");
    setSearchQuery("");
    setIsDragging(false);
  }, [isOpen, setDateFilter, setSearchQuery, setSelectedId, setTypeFilter, setIsDragging]);

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    await processFiles(files);
    event.target.value = "";
    setActiveTab("library");
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length) {
      await processFiles(event.dataTransfer.files);
      setActiveTab("library");
    }
  };

  const handleSetFeaturedImage = () => {
    if (!selectedAttachment) {
      return;
    }

    onSetFeaturedImage(selectedAttachment);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="admin-link-modal-backdrop" onClick={onClose}>
      <div
        className="admin-media-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="featured-image-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-media-modal-header">
          <div>
            <h2 id="featured-image-title">Featured image</h2>
            <div className="admin-media-modal-tabs">
              <button
                type="button"
                className={`admin-media-modal-tab${activeTab === "upload" ? " is-active" : ""}`}
                onClick={() => setActiveTab("upload")}
              >
                Upload files
              </button>
              <button
                type="button"
                className={`admin-media-modal-tab${activeTab === "library" ? " is-active" : ""}`}
                onClick={() => setActiveTab("library")}
              >
                Media Library
              </button>
            </div>
          </div>
          <button
            type="button"
            className="admin-link-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {activeTab === "upload" ? (
          <div className="admin-media-modal-body admin-media-modal-body-upload">
            <div
              className={`admin-media-upload-zone${isDragging ? " is-dragging" : ""}`}
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
              <p className="admin-media-upload-title">Drop files to upload</p>
              <p className="admin-media-upload-or">or</p>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Select Files"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="admin-media-file-input"
                onChange={handleFileInputChange}
              />
              <p className="admin-media-upload-limit">
                Maximum upload file size: 256 MB.
              </p>
              {uploadError ? (
                <p className="admin-media-upload-error">{uploadError}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="admin-media-modal-body">
            <div className="admin-media-library-main">
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
        )}

        <div className="admin-media-modal-footer">
          <button
            type="button"
            className="admin-btn-primary-inline"
            disabled={!selectedAttachment}
            onClick={handleSetFeaturedImage}
          >
            Set featured image
          </button>
        </div>
      </div>
    </div>
  );
}
