"use client";

import Image from "next/image";
import { useState } from "react";
import { FeaturedImageModal } from "@/components/admin/posts/FeaturedImageModal";
import { PublishMetabox } from "@/components/admin/posts/PublishMetabox";
import { PageAttributesMetabox } from "@/components/admin/service-areas/PageAttributesMetabox";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import type { PostSeoSnippet } from "@/lib/admin/postSeo";
import type { PublishSettings } from "@/lib/admin/postPublish";
import {
  createDefaultPageAttributes,
  type ServiceAreaFeaturedImage,
  type ServiceAreaPageAttributes,
} from "@/lib/admin/serviceAreaEditor";

type ServiceAreaEditorSidebarProps = {
  title?: string;
  content?: string;
  seoSnippet?: PostSeoSnippet;
  pageAttributes?: ServiceAreaPageAttributes;
  onPageAttributesChange?: (attributes: ServiceAreaPageAttributes) => void;
  excludeParentId?: string;
  pageSlug?: string;
  featuredImage?: ServiceAreaFeaturedImage | null;
  onFeaturedImageChange?: (image: ServiceAreaFeaturedImage | null) => void;
  publishSettings?: PublishSettings;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  onMoveToTrash?: () => void;
  primaryActionLabel?: string;
};

function toFeaturedImage(image: MediaAttachment): ServiceAreaFeaturedImage {
  return {
    src: image.src,
    alt: image.alt || image.title,
    title: image.title,
  };
}

export function ServiceAreaEditorSidebar({
  title = "",
  content = "",
  seoSnippet,
  pageAttributes: pageAttributesProp,
  onPageAttributesChange,
  excludeParentId,
  pageSlug,
  featuredImage = null,
  onFeaturedImageChange,
  publishSettings,
  onPublish,
  onSaveDraft,
  onMoveToTrash,
  primaryActionLabel = "Publish",
}: ServiceAreaEditorSidebarProps) {
  const [internalPageAttributes, setInternalPageAttributes] =
    useState<ServiceAreaPageAttributes>(createDefaultPageAttributes);
  const pageAttributes = pageAttributesProp ?? internalPageAttributes;
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = useState(false);

  const handlePageAttributesChange = (next: ServiceAreaPageAttributes) => {
    if (pageAttributesProp === undefined) {
      setInternalPageAttributes(next);
    }
    onPageAttributesChange?.(next);
  };

  const handleSetFeaturedImage = (image: MediaAttachment) => {
    onFeaturedImageChange?.(toFeaturedImage(image));
  };

  const handleRemoveFeaturedImage = () => {
    onFeaturedImageChange?.(null);
  };

  return (
    <>
      <aside className="admin-post-editor-sidebar">
        <PublishMetabox
          postTitle={title}
          postContent={content}
          seoSnippet={seoSnippet}
          hasFeaturedImage={featuredImage !== null}
          previewHref="/service-areas"
          initialSettings={publishSettings}
          onPublish={onPublish}
          onSaveDraft={onSaveDraft}
          onMoveToTrash={onMoveToTrash}
          primaryActionLabel={primaryActionLabel}
        />

        <PageAttributesMetabox
          attributes={pageAttributes}
          onChange={handlePageAttributesChange}
          excludeParentId={excludeParentId}
          pageSlug={pageSlug}
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
                    onClick={handleRemoveFeaturedImage}
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
        onSetFeaturedImage={handleSetFeaturedImage}
      />
    </>
  );
}
