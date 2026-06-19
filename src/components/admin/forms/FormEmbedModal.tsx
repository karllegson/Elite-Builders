"use client";

import { Copy, ExternalLink, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { getFormShortcode, type EmbedContentType } from "@/lib/admin/formEmbed";

export type FormEmbedModalProps = {
  isOpen: boolean;
  formId: number;
  onClose: () => void;
};

export function FormEmbedModal({ isOpen, formId, onClose }: FormEmbedModalProps) {
  const toast = useAdminToast();
  const [existingType, setExistingType] = useState<EmbedContentType>("page");
  const [createType, setCreateType] = useState<EmbedContentType>("page");
  const [selectedPage, setSelectedPage] = useState("");
  const [newPageName, setNewPageName] = useState("");

  const shortcode = getFormShortcode(formId);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setExistingType("page");
      setCreateType("page");
      setSelectedPage("");
      setNewPageName("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const showStatus = (message: string) => {
    toast.success(message);
  };

  const handleInsertForm = () => {
    if (!selectedPage) {
      showStatus("Select a page or post first.");
      return;
    }

    showStatus("Form inserted — coming soon.");
  };

  const handleCreate = () => {
    if (!newPageName.trim()) {
      showStatus("Enter a page or post name.");
      return;
    }

    showStatus("Create page/post — coming soon.");
  };

  const handleCopyShortcode = async () => {
    try {
      await navigator.clipboard.writeText(shortcode);
      showStatus("Shortcode copied to clipboard.");
    } catch {
      showStatus("Unable to copy shortcode.");
    }
  };

  return (
    <div className="admin-link-modal-backdrop" onClick={onClose}>
      <div
        className="admin-form-embed-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-embed-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-link-modal-header">
          <h2 id="form-embed-title">Embed Form</h2>
          <button
            type="button"
            className="admin-link-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="admin-link-modal-body admin-form-embed-body">
          <div className="admin-form-embed-id">Form ID: {formId}</div>

          <section className="admin-form-embed-section">
            <h3 className="admin-form-embed-section-title">Add to Existing Content</h3>

            <fieldset className="admin-form-embed-radio-group">
              <legend className="screen-reader-text">Existing content type</legend>
              <label className="admin-form-settings-radio">
                <input
                  type="radio"
                  name="existing-content-type"
                  checked={existingType === "page"}
                  onChange={() => setExistingType("page")}
                />
                <span>Page</span>
              </label>
              <label className="admin-form-settings-radio">
                <input
                  type="radio"
                  name="existing-content-type"
                  checked={existingType === "post"}
                  onChange={() => setExistingType("post")}
                />
                <span>Post</span>
              </label>
            </fieldset>

            <label className="admin-form-embed-field" htmlFor="embed-select-page">
              <span className="screen-reader-text">
                Select a {existingType === "page" ? "page" : "post"}
              </span>
              <select
                id="embed-select-page"
                className="admin-form-settings-select"
                value={selectedPage}
                onChange={(event) => setSelectedPage(event.target.value)}
              >
                <option value="">
                  Select a {existingType === "page" ? "Page" : "Post"}
                </option>
              </select>
            </label>

            <button type="button" className="admin-btn-secondary" onClick={handleInsertForm}>
              Insert Form
            </button>
          </section>

          <section className="admin-form-embed-section">
            <h3 className="admin-form-embed-section-title">Create New</h3>

            <fieldset className="admin-form-embed-radio-group">
              <legend className="screen-reader-text">Create content type</legend>
              <label className="admin-form-settings-radio">
                <input
                  type="radio"
                  name="create-content-type"
                  checked={createType === "page"}
                  onChange={() => setCreateType("page")}
                />
                <span>Page</span>
              </label>
              <label className="admin-form-settings-radio">
                <input
                  type="radio"
                  name="create-content-type"
                  checked={createType === "post"}
                  onChange={() => setCreateType("post")}
                />
                <span>Post</span>
              </label>
            </fieldset>

            <label className="admin-form-embed-field" htmlFor="embed-new-page-name">
              <span className="screen-reader-text">
                Enter {createType === "page" ? "page" : "post"} name
              </span>
              <input
                id="embed-new-page-name"
                type="text"
                className="admin-form-settings-input"
                placeholder={`Enter ${createType === "page" ? "Page" : "Post"} Name`}
                value={newPageName}
                onChange={(event) => setNewPageName(event.target.value)}
              />
            </label>

            <button type="button" className="admin-btn-secondary" onClick={handleCreate}>
              Create
            </button>
          </section>

          <section className="admin-form-embed-section admin-form-embed-section-last">
            <h3 className="admin-form-embed-section-title">Not Using the Block Editor?</h3>
            <p className="admin-form-settings-help">
              Copy and paste the shortcode within your page builder.
            </p>
            <button
              type="button"
              className="admin-form-embed-copy-btn"
              onClick={handleCopyShortcode}
            >
              <Copy size={16} aria-hidden />
              Copy Shortcode
            </button>
            <p className="admin-form-embed-learn-more">
              <a href="#" onClick={(event) => event.preventDefault()}>
                Learn more
                <ExternalLink size={14} aria-hidden />
              </a>{" "}
              about the shortcode.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
