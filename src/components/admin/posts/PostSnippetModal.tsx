"use client";

import { Monitor, Smartphone, Share2, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SeoSnippetPreview } from "@/components/admin/posts/SeoSnippetPreview";
import {
  buildBlogPermalinkUrl,
  getSeoProgress,
  SEO_DESCRIPTION_MAX,
  SEO_PERMALINK_MAX,
  SEO_TITLE_MAX,
  type PostSeoSnippet,
} from "@/lib/admin/postSeo";
import { useAdminSiteUrl } from "@/lib/admin/siteUrl";

type PostSnippetModalProps = {
  isOpen: boolean;
  snippet: PostSeoSnippet;
  fallbackTitle: string;
  onClose: () => void;
  onSave: (snippet: PostSeoSnippet) => void;
  buildPermalinkUrl?: (domain: string, slug: string) => string;
  fallbackPreviewTitle?: string;
  slugifyPermalinkFromTitle?: (title: string) => string;
};

export function PostSnippetModal({
  isOpen,
  snippet,
  fallbackTitle,
  onClose,
  onSave,
  buildPermalinkUrl = buildBlogPermalinkUrl,
  fallbackPreviewTitle = "Sample Post Title",
  slugifyPermalinkFromTitle,
}: PostSnippetModalProps) {
  const siteUrl = useAdminSiteUrl();
  const permalinkEditedRef = useRef(false);
  const [activeTab, setActiveTab] = useState<"general" | "social">("general");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [draft, setDraft] = useState<PostSeoSnippet>(snippet);

  useEffect(() => {
    if (isOpen) {
      setDraft(snippet);
      setActiveTab("general");
      setPreviewMode("desktop");

      const autoPermalink = slugifyPermalinkFromTitle
        ? slugifyPermalinkFromTitle(snippet.seoTitle || fallbackTitle)
        : snippet.permalink;

      permalinkEditedRef.current =
        snippet.permalink.trim() !== autoPermalink.trim();
    }
  }, [fallbackTitle, isOpen, slugifyPermalinkFromTitle, snippet]);

  if (!isOpen) {
    return null;
  }

  const previewTitle = draft.seoTitle || fallbackTitle || fallbackPreviewTitle;
  const previewPermalink = buildPermalinkUrl(
    siteUrl,
    draft.permalink || fallbackTitle,
  );
  const previewDescription =
    draft.metaDescription ||
    "Please provide a meta description by editing the snippet below.";

  const titleProgress = getSeoProgress(draft.seoTitle.length, SEO_TITLE_MAX);
  const permalinkProgress = getSeoProgress(
    draft.permalink.length,
    SEO_PERMALINK_MAX,
  );
  const descriptionProgress = getSeoProgress(
    draft.metaDescription.length,
    SEO_DESCRIPTION_MAX,
  );

  return (
    <div className="admin-link-modal-backdrop" onClick={onClose}>
      <div
        className="admin-snippet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="snippet-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-link-modal-header">
          <h2 id="snippet-editor-title">Preview Snippet Editor</h2>
          <button
            type="button"
            className="admin-link-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="admin-seo-modal-tabs">
          <button
            type="button"
            className={`admin-seo-tab${activeTab === "general" ? " is-active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            <Settings size={14} strokeWidth={1.75} aria-hidden />
            General
          </button>
          <button
            type="button"
            className={`admin-seo-tab${activeTab === "social" ? " is-active" : ""}`}
            onClick={() => setActiveTab("social")}
          >
            <Share2 size={14} strokeWidth={1.75} aria-hidden />
            Social
          </button>
        </div>

        <div className="admin-snippet-modal-body">
          {activeTab === "general" ? (
            <>
              <div className="admin-snippet-preview-toolbar">
                <SeoSnippetPreview
                  permalinkUrl={previewPermalink}
                  title={previewTitle}
                  description={previewDescription}
                />
                <div className="admin-snippet-preview-modes">
                  <button
                    type="button"
                    className={`admin-snippet-mode-btn${previewMode === "desktop" ? " is-active" : ""}`}
                    aria-label="Desktop preview"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor size={16} strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    className={`admin-snippet-mode-btn${previewMode === "mobile" ? " is-active" : ""}`}
                    aria-label="Mobile preview"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className={`admin-snippet-fields${previewMode === "mobile" ? " is-mobile-preview" : ""}`}>
                <div className="admin-snippet-field-box">
                  <div className="admin-snippet-field-header">
                    <span>Title</span>
                    <span className="admin-snippet-counter">
                      {draft.seoTitle.length} / {SEO_TITLE_MAX}
                    </span>
                  </div>
                  <div className={`admin-snippet-progress is-${titleProgress}`}>
                    <span style={{ width: `${Math.min((draft.seoTitle.length / SEO_TITLE_MAX) * 100, 100)}%` }} />
                  </div>
                  <input
                    type="text"
                    value={draft.seoTitle}
                    onChange={(event) => {
                      const seoTitle = event.target.value;

                      setDraft((current) => ({
                        ...current,
                        seoTitle,
                        permalink:
                          slugifyPermalinkFromTitle && !permalinkEditedRef.current
                            ? slugifyPermalinkFromTitle(seoTitle || fallbackTitle)
                            : current.permalink,
                      }));
                    }}
                  />
                  <p className="admin-snippet-help">
                    This is what will appear in the first line when this post
                    shows up in the search results.
                  </p>
                </div>

                <div className="admin-snippet-field-box">
                  <div className="admin-snippet-field-header">
                    <span>Permalink</span>
                    <span className="admin-snippet-counter">
                      {draft.permalink.length} / {SEO_PERMALINK_MAX}
                    </span>
                  </div>
                  <div className={`admin-snippet-progress is-${permalinkProgress}`}>
                    <span
                      style={{
                        width: `${Math.min((draft.permalink.length / SEO_PERMALINK_MAX) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={draft.permalink}
                    onChange={(event) => {
                      permalinkEditedRef.current = true;
                      setDraft((current) => ({
                        ...current,
                        permalink: event.target.value,
                      }));
                    }}
                  />
                  <p className="admin-snippet-help">
                    This is the unique URL of this page, displayed below the
                    post title in the search results.
                  </p>
                </div>

                <div className="admin-snippet-field-box">
                  <div className="admin-snippet-field-header">
                    <span>Description</span>
                    <span className="admin-snippet-counter">
                      {draft.metaDescription.length} / {SEO_DESCRIPTION_MAX}
                    </span>
                  </div>
                  <div className={`admin-snippet-progress is-${descriptionProgress}`}>
                    <span
                      style={{
                        width: `${Math.min((draft.metaDescription.length / SEO_DESCRIPTION_MAX) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={draft.metaDescription}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        metaDescription: event.target.value,
                      }))
                    }
                  />
                  <p className="admin-snippet-help">
                    This is what will appear as the description when this post
                    shows up in the search results.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="admin-seo-placeholder-copy">
              Social snippet settings will be available in a future update.
            </p>
          )}
        </div>

        <div className="admin-link-modal-footer">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn-primary-inline"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
