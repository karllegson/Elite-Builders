"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { FeaturedImageModal } from "@/components/admin/posts/FeaturedImageModal";
import { PublishMetabox } from "@/components/admin/posts/PublishMetabox";
import { PageEditorMetabox } from "@/components/admin/pages/PageEditorMetabox";
import {
  buildCategoryOptions,
  createCategory,
  type PostCategory,
} from "@/lib/admin/postCategories";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";

type ReviewEditorSidebarProps = {
  reviewTitle?: string;
  reviewContent?: string;
};

export function ReviewEditorSidebar({
  reviewTitle = "",
  reviewContent = "",
}: ReviewEditorSidebarProps) {
  const [featuredImage, setFeaturedImage] = useState<MediaAttachment | null>(null);
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = useState(false);
  const [categoriesTab, setCategoriesTab] = useState<"all" | "most-used">("all");
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const parentOptions = useMemo(
    () => buildCategoryOptions(categories),
    [categories],
  );

  const visibleCategories = useMemo(() => {
    if (categoriesTab === "all") {
      return categories;
    }

    return [...categories].slice(0, 5);
  }, [categories, categoriesTab]);

  const handleAddCategory = () => {
    const name = newCategoryName.trim();

    if (!name) {
      return;
    }

    const category = createCategory(
      name,
      newCategoryParentId ? newCategoryParentId : null,
    );

    setCategories((current) => [...current, category]);
    setSelectedCategoryIds((current) => [...current, category.id]);
    setNewCategoryName("");
    setNewCategoryParentId("");
    setShowAddCategoryForm(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };

  return (
    <>
      <aside className="admin-post-editor-sidebar">
        <PublishMetabox
          postTitle={reviewTitle}
          postContent={reviewContent}
          hasFeaturedImage={featuredImage !== null}
          previewHref="/#reviews"
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

            <div className="admin-category-list" aria-label="Review categories">
              {visibleCategories.length === 0 ? (
                <p className="admin-category-empty">No categories yet.</p>
              ) : (
                visibleCategories.map((category) => (
                  <label key={category.id} className="admin-category-item">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                    />
                    <span>{category.name}</span>
                  </label>
                ))
              )}
            </div>

            {!showAddCategoryForm ? (
              <button
                type="button"
                className="admin-inline-link admin-add-category"
                onClick={() => setShowAddCategoryForm(true)}
              >
                + Add New Category
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
                  onClick={handleAddCategory}
                >
                  Add Category
                </button>
              </div>
            )}
          </div>
        </div>

        <PageEditorMetabox title="Post Attributes" defaultOpen={false}>
          <p className="admin-review-attributes-empty">No attributes available.</p>
        </PageEditorMetabox>

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
