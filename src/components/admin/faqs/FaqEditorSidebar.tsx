"use client";

import Image from "next/image";
import { useState } from "react";
import { FeaturedImageModal } from "@/components/admin/posts/FeaturedImageModal";
import { PublishMetabox } from "@/components/admin/posts/PublishMetabox";
import { FaqCategoriesMetabox } from "@/components/admin/faqs/FaqCategoriesMetabox";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";

type FaqEditorSidebarProps = {
  title?: string;
  content?: string;
  categoryId?: string | null;
  onCategoryIdChange?: (categoryId: string | null) => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  primaryActionLabel?: string;
  isSaving?: boolean;
};

export function FaqEditorSidebar({
  title = "",
  content = "",
  categoryId = null,
  onCategoryIdChange,
  onPublish,
  onSaveDraft,
  primaryActionLabel = "Publish",
  isSaving = false,
}: FaqEditorSidebarProps) {
  const [featuredImage, setFeaturedImage] = useState<MediaAttachment | null>(null);
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = useState(false);

  return (
    <>
      <aside className="admin-post-editor-sidebar">
        <PublishMetabox
          postTitle={title}
          postContent={content}
          hasFeaturedImage={featuredImage !== null}
          previewHref="/faqs"
          onPublish={onPublish}
          onSaveDraft={onSaveDraft}
          primaryActionLabel={primaryActionLabel}
        />

        <FaqCategoriesMetabox
          categoryId={categoryId}
          onChange={(next) => onCategoryIdChange?.(next)}
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
      </aside>

      <FeaturedImageModal
        isOpen={featuredImageModalOpen}
        onClose={() => setFeaturedImageModalOpen(false)}
        onSetFeaturedImage={setFeaturedImage}
      />
    </>
  );
}
