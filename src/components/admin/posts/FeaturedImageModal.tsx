"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  createMediaFromFile,
  formatFileSize,
  formatMediaDate,
  getDefaultMediaLibrary,
  getUploadDateOptions,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  type MediaAttachment,
} from "@/lib/admin/mediaLibrary";

type FeaturedImageModalTab = "upload" | "library";

export type FeaturedImageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSetFeaturedImage: (attachment: MediaAttachment) => void;
};

type AttachmentDetailsProps = {
  attachment: MediaAttachment;
  onChange: (attachment: MediaAttachment) => void;
  onClose: () => void;
};

function AttachmentDetailsPanel({
  attachment,
  onChange,
  onClose,
}: AttachmentDetailsProps) {
  const [copyMessage, setCopyMessage] = useState("");

  const updateField = <K extends keyof MediaAttachment>(
    field: K,
    value: MediaAttachment[K],
  ) => {
    onChange({ ...attachment, [field]: value });
  };

  const handleCopyUrl = async () => {
    const url =
      attachment.src.startsWith("blob:") || attachment.src.startsWith("http")
        ? attachment.src
        : `${window.location.origin}${attachment.src}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("Copied!");
      window.setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Copy failed");
    }
  };

  const fileUrl =
    attachment.src.startsWith("blob:") || attachment.src.startsWith("http")
      ? attachment.src
      : attachment.src;

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
        <button type="button" className="admin-inline-link">
          Edit Image
        </button>
        <button type="button" className="admin-media-delete-link">
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
          <button type="button" className="admin-inline-link">
            Learn how to describe the purpose of the image
          </button>
          . Leave empty if the image is purely decorative.
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

      <label className="admin-media-field">
        <span>File URL</span>
        <input type="text" readOnly value={fileUrl} className="is-readonly" />
        <button
          type="button"
          className="admin-btn-secondary admin-media-copy-url"
          onClick={handleCopyUrl}
        >
          {copyMessage || "Copy URL to clipboard"}
        </button>
      </label>

      <p className="admin-media-required-note">Required fields are marked *</p>

      <label className="admin-media-field">
        <span>Compression Level</span>
        <select defaultValue="medium">
          <option value="none">None</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <label className="admin-media-checkbox">
        <input type="checkbox" />
        Exclude this attachment from sitemap
      </label>
    </aside>
  );
}

export function FeaturedImageModal({
  isOpen,
  onClose,
  onSetFeaturedImage,
}: FeaturedImageModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<FeaturedImageModalTab>("library");
  const [libraryItems, setLibraryItems] = useState<MediaAttachment[]>(() =>
    getDefaultMediaLibrary(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("images");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveTab("library");
    setSelectedId(null);
    setTypeFilter("images");
    setDateFilter("all");
    setSearchQuery("");
    setUploadError("");
    setIsDragging(false);
  }, [isOpen]);

  const selectedAttachment = useMemo(() => {
    if (!selectedId) {
      return null;
    }

    return libraryItems.find((item) => item.id === selectedId) ?? null;
  }, [libraryItems, selectedId]);

  const dateOptions = useMemo(
    () => getUploadDateOptions(libraryItems),
    [libraryItems],
  );

  const filteredLibraryItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return libraryItems.filter((item) => {
      if (typeFilter === "images" && !item.mimeType.startsWith("image/")) {
        return false;
      }

      if (dateFilter !== "all") {
        const itemKey = `${item.uploadedAt.getFullYear()}-${item.uploadedAt.getMonth()}`;

        if (itemKey !== dateFilter) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(query) ||
        item.filename.toLowerCase().includes(query) ||
        item.alt.toLowerCase().includes(query)
      );
    });
  }, [dateFilter, libraryItems, searchQuery, typeFilter]);

  const handleSelectAttachment = useCallback((attachment: MediaAttachment) => {
    setSelectedId(attachment.id);
  }, []);

  const handleAttachmentChange = useCallback((attachment: MediaAttachment) => {
    setLibraryItems((items) =>
      items.map((item) => (item.id === attachment.id ? attachment : item)),
    );
  }, []);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (fileArray.length === 0) {
      setUploadError("Please choose an image file.");
      return;
    }

    const file = fileArray[0];

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      setUploadError("This file exceeds the maximum upload size of 256 MB.");
      return;
    }

    setUploadError("");

    const attachment = await createMediaFromFile(file);
    setLibraryItems((items) => [attachment, ...items]);
    setSelectedId(attachment.id);
    setActiveTab("library");
  }, []);

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
              >
                Select Files
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

            {selectedAttachment ? (
              <AttachmentDetailsPanel
                attachment={selectedAttachment}
                onChange={handleAttachmentChange}
                onClose={() => setSelectedId(null)}
              />
            ) : null}
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
              <AttachmentDetailsPanel
                attachment={selectedAttachment}
                onChange={handleAttachmentChange}
                onClose={() => setSelectedId(null)}
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
