"use client";

import Image from "next/image";
import { useState } from "react";
import { FeaturedImageModal } from "@/components/admin/posts/FeaturedImageModal";
import { PublishMetabox } from "@/components/admin/posts/PublishMetabox";
import { PageEditorMetabox } from "@/components/admin/pages/PageEditorMetabox";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import type { PostSeoSnippet } from "@/lib/admin/postSeo";

type PageEditorSidebarProps = {
  pageTitle?: string;
  pageContent?: string;
  seoSnippet?: PostSeoSnippet;
};

const PAGE_PARENT_OPTIONS = [
  { value: "", label: "(no parent)" },
  { value: "home", label: "Home" },
  { value: "services", label: "Services" },
  { value: "projects", label: "Projects" },
  { value: "service-areas", label: "Service Areas" },
  { value: "blog", label: "Blog" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
];

const PAGE_TEMPLATE_OPTIONS = [
  { value: "default", label: "Default template" },
  { value: "full-width", label: "Full Width" },
  { value: "landing", label: "Landing Page" },
];

export function PageEditorSidebar({
  pageTitle = "",
  pageContent = "",
  seoSnippet,
}: PageEditorSidebarProps) {
  const [featuredImage, setFeaturedImage] = useState<MediaAttachment | null>(null);
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = useState(false);
  const [parentId, setParentId] = useState("");
  const [template, setTemplate] = useState("default");
  const [order, setOrder] = useState("0");

  return (
    <>
      <aside className="admin-post-editor-sidebar">
        <PublishMetabox
          postTitle={pageTitle}
          postContent={pageContent}
          seoSnippet={seoSnippet}
          hasFeaturedImage={featuredImage !== null}
          previewHref="/"
        />

        <div className="admin-metabox">
          <div className="admin-metabox-header">
            <span>Featured image</span>
            <span className="admin-metabox-toggle" aria-hidden>
              ▲
            </span>
          </div>
          <div className="admin-metabox-body">
            {featuredImage ? (
              <div className="admin-featured-image-preview">
                <Image
                  src={featuredImage.src}
                  alt={featuredImage.alt || featuredImage.title}
                  width={260}
                  height={180}
                  className="admin-featured-image-thumb"
                  unoptimized={featuredImage.src.startsWith("blob:")}
                />
                <div className="admin-featured-image-actions">
                  <button
                    type="button"
                    className="admin-inline-link"
                    onClick={() => setFeaturedImageModalOpen(true)}
                  >
                    Replace image
                  </button>
                  <button
                    type="button"
                    className="admin-inline-link admin-media-delete-link"
                    onClick={() => setFeaturedImage(null)}
                  >
                    Remove featured image
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="admin-inline-link"
                onClick={() => setFeaturedImageModalOpen(true)}
              >
                Set featured image
              </button>
            )}
          </div>
        </div>

        <PageEditorMetabox title="Page Attributes">
          <div className="admin-page-attributes">
            <div className="admin-page-attributes-field">
              <label className="admin-page-attributes-label" htmlFor="page-parent">
                Parent
              </label>
              <select
                id="page-parent"
                className="admin-page-attributes-select"
                value={parentId}
                onChange={(event) => setParentId(event.target.value)}
              >
                {PAGE_PARENT_OPTIONS.map((option) => (
                  <option key={option.value || "none"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-page-attributes-field">
              <label className="admin-page-attributes-label" htmlFor="page-template">
                Template
              </label>
              <select
                id="page-template"
                className="admin-page-attributes-select admin-page-attributes-template"
                value={template}
                onChange={(event) => setTemplate(event.target.value)}
              >
                {PAGE_TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-page-attributes-field">
              <label className="admin-page-attributes-label" htmlFor="page-order">
                Order
              </label>
              <input
                id="page-order"
                type="number"
                className="admin-page-attributes-order"
                value={order}
                min={0}
                onChange={(event) => setOrder(event.target.value)}
              />
            </div>

            <p className="admin-page-attributes-help">
              Need help? Use the Help tab above the screen title.
            </p>
          </div>
        </PageEditorMetabox>
      </aside>

      <FeaturedImageModal
        isOpen={featuredImageModalOpen}
        onClose={() => setFeaturedImageModalOpen(false)}
        onSetFeaturedImage={setFeaturedImage}
      />
    </>
  );
}