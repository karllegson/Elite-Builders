"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type MutableRefObject } from "react";
import {
  createCategoryAction,
  fetchCategoriesAction,
} from "@/app/admin/(shell)/posts/actions";
import { FeaturedImageModal } from "@/components/admin/posts/FeaturedImageModal";
import { PublishMetabox } from "@/components/admin/posts/PublishMetabox";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import { buildCategoryOptions } from "@/lib/admin/postCategories";
import type { PublishSettings } from "@/lib/admin/postPublish";
import type { PostSeoSnippet } from "@/lib/admin/postSeo";
import type { PostCategoryDTO } from "@/lib/admin/posts.dto";

type PostEditorSidebarProps = {
  postTitle?: string;
  postContent?: string;
  seoSnippet?: PostSeoSnippet;
  categoryIds: string[];
  onCategoryIdsChange: (ids: string[]) => void;
  featuredImage: MediaAttachment | null;
  onFeaturedImageChange: (image: MediaAttachment | null) => void;
  publishSettings: PublishSettings;
  initialPublishSettings?: PublishSettings;
  publishSettingsRef: MutableRefObject<PublishSettings>;
  onPublishSettingsChange: (settings: PublishSettings) => void;
  previewHref?: string;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  onMoveToTrash?: () => void;
  primaryActionLabel?: string;
};

export function PostEditorSidebar({
  postTitle = "",
  postContent = "",
  seoSnippet,
  categoryIds,
  onCategoryIdsChange,
  featuredImage,
  onFeaturedImageChange,
  publishSettings,
  initialPublishSettings,
  publishSettingsRef,
  onPublishSettingsChange,
  previewHref,
  onPublish,
  onSaveDraft,
  onMoveToTrash,
  primaryActionLabel,
}: PostEditorSidebarProps) {
  const [categoriesTab, setCategoriesTab] = useState<"all" | "most-used">(
    "all",
  );
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");
  const [categories, setCategories] = useState<PostCategoryDTO[]>([]);
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    void (async () => {
      const items = await fetchCategoriesAction();
      setCategories(items);
    })();
  }, []);

  const parentOptions = useMemo(
    () =>
      buildCategoryOptions(
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          parentId: category.parentId,
        })),
      ),
    [categories],
  );

  const visibleCategories = useMemo(() => {
    if (categoriesTab === "all") {
      return categories;
    }

    return [...categories].slice(0, 5);
  }, [categories, categoriesTab]);

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();

    if (!name) {
      return;
    }

    const result = await createCategoryAction({
      name,
      parentId: newCategoryParentId ? newCategoryParentId : null,
    });

    if (result.error || !result.category) {
      setCategoryError(result.error ?? "Could not create category.");
      return;
    }

    setCategories((current) => [...current, result.category!]);
    onCategoryIdsChange([...categoryIds, result.category.id]);
    setNewCategoryName("");
    setNewCategoryParentId("");
    setShowAddCategoryForm(false);
    setCategoryError("");
  };

  const toggleCategory = (categoryId: string) => {
    onCategoryIdsChange(
      categoryIds.includes(categoryId)
        ? categoryIds.filter((id) => id !== categoryId)
        : [...categoryIds, categoryId],
    );
  };

  return (
    <>
      <aside className="admin-post-editor-sidebar">
        <PublishMetabox
          postTitle={postTitle}
          postContent={postContent}
          seoSnippet={seoSnippet}
          hasFeaturedImage={featuredImage !== null}
          previewHref={previewHref}
          initialSettings={initialPublishSettings ?? publishSettings}
          publishSettingsRef={publishSettingsRef}
          onSettingsChange={onPublishSettingsChange}
          onPublish={onPublish}
          onSaveDraft={onSaveDraft}
          onMoveToTrash={onMoveToTrash}
          primaryActionLabel={primaryActionLabel}
        />

        <div className="admin-metabox">
          <div className="admin-metabox-header">
            <span>Categories</span>
            <span className="admin-metabox-toggle" aria-hidden>
              ▲
            </span>
          </div>
          <div className="admin-metabox-body">
            <div className="admin-metabox-tabs">
              <button
                type="button"
                className={`admin-metabox-tab${categoriesTab === "all" ? " is-active" : ""}`}
                onClick={() => setCategoriesTab("all")}
              >
                All Categories
              </button>
              <button
                type="button"
                className={`admin-metabox-tab${categoriesTab === "most-used" ? " is-active" : ""}`}
                onClick={() => setCategoriesTab("most-used")}
              >
                Most Used
              </button>
            </div>
            <div className="admin-category-list" aria-label="Categories">
              {visibleCategories.length === 0 ? (
                <p className="admin-category-empty">No categories yet.</p>
              ) : (
                visibleCategories.map((category) => (
                  <label key={category.id} className="admin-category-item">
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))
              )}
            </div>

            {categoryError ? (
              <p className="admin-category-empty" role="alert">
                {categoryError}
              </p>
            ) : null}

            {!showAddCategoryForm ? (
              <button
                type="button"
                className="admin-inline-link admin-add-category"
                onClick={() => setShowAddCategoryForm(true)}
              >
                + Add Category
              </button>
            ) : (
              <div className="admin-add-category-form">
                <input
                  type="text"
                  className="admin-add-category-input"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  autoFocus
                />
                <select
                  className="admin-add-category-parent"
                  value={newCategoryParentId}
                  onChange={(event) => setNewCategoryParentId(event.target.value)}
                >
                  <option value="">— Parent Category —</option>
                  {parentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="admin-btn-secondary admin-add-category-submit"
                  onClick={() => void handleAddCategory()}
                >
                  Add Category
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="admin-metabox">
          <div className="admin-metabox-header">
            <span>Featured image</span>
            <span className="admin-metabox-toggle" aria-hidden>
              ▲
            </span>
          </div>
          <div className="admin-metabox-body">
            {featuredImage && featuredImage.src ? (
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
                    onClick={() => onFeaturedImageChange(null)}
                  >
                    Remove featured image
                  </button>
                </div>
              </div>
            ) : featuredImage ? (
              <div className="admin-featured-image-preview">
                <p className="admin-category-empty">Featured image selected.</p>
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
                    onClick={() => onFeaturedImageChange(null)}
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
        onSetFeaturedImage={onFeaturedImageChange}
      />
    </>
  );
}
