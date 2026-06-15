"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FeaturedImageModal } from "@/components/admin/posts/FeaturedImageModal";
import { PublishMetabox } from "@/components/admin/posts/PublishMetabox";
import { PageAttributesMetabox } from "@/components/admin/service-areas/PageAttributesMetabox";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import type { PostSeoSnippet } from "@/lib/admin/postSeo";
import {
  createDefaultPageAttributes,
  type ServiceAreaPageAttributes,
} from "@/lib/admin/serviceAreaEditor";

type ServiceAreaEditorSidebarProps = {
  title?: string;
  content?: string;
  seoSnippet?: PostSeoSnippet;
  pageAttributes?: ServiceAreaPageAttributes;
  onPageAttributesChange?: (attributes: ServiceAreaPageAttributes) => void;
  excludeParentId?: string;
  hasFeaturedImage?: boolean;
  onFeaturedImageChange?: (hasFeaturedImage: boolean) => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  primaryActionLabel?: string;
};

export function ServiceAreaEditorSidebar({
  title = "",
  content = "",
  seoSnippet,
  pageAttributes: pageAttributesProp,
  onPageAttributesChange,
  excludeParentId,
  hasFeaturedImage = false,
  onFeaturedImageChange,
  onPublish,
  onSaveDraft,
  primaryActionLabel = "Publish",
}: ServiceAreaEditorSidebarProps) {
  const [internalPageAttributes, setInternalPageAttributes] =
    useState<ServiceAreaPageAttributes>(createDefaultPageAttributes);
  const pageAttributes = pageAttributesProp ?? internalPageAttributes;
  const [featuredImage, setFeaturedImage] = useState<MediaAttachment | null>(
    null,
  );
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = useState(false);

  useEffect(() => {
    if (hasFeaturedImage && !featuredImage) {
      return;
    }

    onFeaturedImageChange?.(featuredImage !== null);
  }, [featuredImage, hasFeaturedImage, onFeaturedImageChange]);

  const handlePageAttributesChange = (next: ServiceAreaPageAttributes) => {
    if (pageAttributesProp === undefined) {
      setInternalPageAttributes(next);
    }
    onPageAttributesChange?.(next);
  };

  const handleSetFeaturedImage = (image: MediaAttachment) => {
    setFeaturedImage(image);
    onFeaturedImageChange?.(true);
  };

  const handleRemoveFeaturedImage = () => {
    setFeaturedImage(null);
    onFeaturedImageChange?.(false);
  };

  return (
    <>
      <aside className="admin-post-editor-sidebar">
        <PublishMetabox
          postTitle={title}
          postContent={content}
          seoSnippet={seoSnippet}
          hasFeaturedImage={featuredImage !== null || hasFeaturedImage}
          previewHref="/service-areas"
          onPublish={onPublish}
          onSaveDraft={onSaveDraft}
          primaryActionLabel={primaryActionLabel}
        />

        <PageAttributesMetabox
          attributes={pageAttributes}
          onChange={handlePageAttributesChange}
          excludeParentId={excludeParentId}
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
