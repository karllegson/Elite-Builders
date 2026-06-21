"use client";

import { useEffect, useState } from "react";
import { slugify } from "@/lib/admin/postSeo";
import { useAdminSiteUrl } from "@/lib/admin/siteUrl";

type PagePermalinkBarProps = {
  slug: string;
  onSlugChange: (slug: string) => void;
};

export function PagePermalinkBar({ slug, onSlugChange }: PagePermalinkBarProps) {
  const siteUrl = useAdminSiteUrl();
  const [isEditing, setIsEditing] = useState(false);
  const [draftSlug, setDraftSlug] = useState(slug);
  const path = slug.trim() || "sample-page";
  const permalinkUrl = `${siteUrl}/${path}/`;
  const permalinkBase = `${siteUrl}/`;

  useEffect(() => {
    if (!isEditing) {
      setDraftSlug(slug);
    }
  }, [isEditing, slug]);

  const handleOk = () => {
    const nextSlug = slugify(draftSlug) || "sample-page";
    onSlugChange(nextSlug);
    setIsEditing(false);
  };

  return (
    <div className="admin-post-permalink">
      <span className="admin-post-permalink-label">Permalink:</span>
      {isEditing ? (
        <div className="admin-post-permalink-edit">
          <span className="admin-post-permalink-base">{permalinkBase}</span>
          <input
            type="text"
            className="admin-post-permalink-input"
            value={draftSlug}
            onChange={(event) => setDraftSlug(event.target.value)}
            aria-label="Permalink slug"
            autoFocus
          />
          <span className="admin-post-permalink-slash">/</span>
          <button
            type="button"
            className="admin-btn-secondary admin-post-permalink-ok"
            onClick={handleOk}
          >
            OK
          </button>
          <button
            type="button"
            className="admin-inline-link"
            onClick={() => {
              setDraftSlug(slug);
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="admin-post-permalink-view">
          <a
            href={permalinkUrl}
            className="admin-post-permalink-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {permalinkUrl}
          </a>
          <button
            type="button"
            className="admin-btn-secondary admin-post-permalink-edit-btn"
            onClick={() => {
              setDraftSlug(slug);
              setIsEditing(true);
            }}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
