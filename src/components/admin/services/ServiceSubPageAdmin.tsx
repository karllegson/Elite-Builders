"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  buildServiceSubPageDetail,
  findServiceSubPage,
  serviceCategoryHref,
} from "@/lib/site/serviceSubPages";
import { serviceDetails } from "@/lib/site/scope";

type ServiceSubPageAdminProps = {
  category: string;
  subslug: string;
};

export function ServiceSubPageAdmin({ category, subslug }: ServiceSubPageAdminProps) {
  const subPage = findServiceSubPage(category, subslug);
  const detail = buildServiceSubPageDetail(category, subslug);
  const parentName = serviceDetails[category]?.name ?? category;

  if (!subPage || !detail) {
    return (
      <div className="admin-post-editor">
        <p className="admin-post-editor-status">Service sub-page not found.</p>
        <Link href="/admin/pages" className="admin-inline-link">
          Back to Pages
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-post-editor">
      <div className="admin-post-editor-main">
        <p className="admin-post-editor-status">Service Sub-Page</p>

        <div className="admin-post-editor-footer" style={{ marginTop: 0, marginBottom: "1.5rem" }}>
          <Link
            href={subPage.href}
            className="admin-btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} aria-hidden />
            View Live
          </Link>
          <Link href={`/admin/services/${category}`} className="admin-btn-primary">
            Edit Parent Category
          </Link>
          <Link href="/admin/pages" className="admin-btn-secondary">
            Back to Pages
          </Link>
        </div>

        <label className="admin-post-title-label">Sub-page title</label>
        <p className="admin-post-title" style={{ marginBottom: "1rem" }}>
          {subPage.label}
        </p>

        <label className="admin-post-title-label">Parent category</label>
        <p style={{ marginBottom: "1.5rem" }}>
          <Link href={`/admin/services/${category}`} className="admin-inline-link">
            {parentName}
          </Link>
        </p>

        <label className="admin-post-title-label">Public URL</label>
        <p style={{ marginBottom: "1.5rem" }}>
          <Link href={subPage.href} className="admin-inline-link" target="_blank" rel="noopener noreferrer">
            {subPage.href}
          </Link>
        </p>

        <label className="admin-post-title-label">Parent category URL</label>
        <p style={{ marginBottom: "1.5rem" }}>
          <Link href={serviceCategoryHref(category)} className="admin-inline-link" target="_blank" rel="noopener noreferrer">
            {serviceCategoryHref(category)}
          </Link>
        </p>

        <label className="admin-post-title-label">SEO title</label>
        <p style={{ marginBottom: "1.5rem" }}>{detail.metaTitle}</p>

        <label className="admin-post-title-label">Meta description</label>
        <p style={{ marginBottom: "1.5rem" }}>{detail.metaDescription}</p>

        <label className="admin-post-title-label">Page H1</label>
        <p style={{ marginBottom: "1.5rem" }}>{detail.h1}</p>

        <p className="admin-post-editor-status">
          Sub-page content is generated from the parent category and{" "}
          <code>src/lib/site/serviceSubPages.ts</code>. Edit the parent category for shared content.
        </p>
      </div>
    </div>
  );
}
