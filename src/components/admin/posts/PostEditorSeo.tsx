"use client";

import {
  Award,
  Briefcase,
  Eye,
  Pencil,
  Settings,
  Share2,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PostSchemaGeneratorPanel } from "@/components/admin/posts/PostSchemaGeneratorPanel";
import { SchemaGeneratorModal } from "@/components/admin/posts/SchemaGeneratorModal";
import { PostSnippetModal } from "@/components/admin/posts/PostSnippetModal";
import {
  PostSchemaEditModal,
  PostSchemaViewModal,
} from "@/components/admin/posts/PostSchemaModals";
import { SeoSnippetPreview } from "@/components/admin/posts/SeoSnippetPreview";
import {
  buildBlogPermalinkUrl,
  type PostSeoSnippet,
  type SchemaItem,
} from "@/lib/admin/postSeo";
import type { SchemaGeneratorConfig } from "@/lib/admin/postSchemaGenerator";
import { business } from "@/lib/site/config";

type SeoTab = "general" | "advanced" | "schema" | "social";

type PostEditorSeoProps = {
  postTitle: string;
  snippet: PostSeoSnippet;
  schemas: SchemaItem[];
  schemaGeneratorConfig: SchemaGeneratorConfig;
  onSnippetChange: (snippet: PostSeoSnippet) => void;
  onSchemasChange: (schemas: SchemaItem[]) => void;
  onSchemaGeneratorConfigChange: (config: SchemaGeneratorConfig) => void;
};

export function PostEditorSeo({
  postTitle,
  snippet,
  schemas,
  schemaGeneratorConfig,
  onSnippetChange,
  onSchemasChange,
  onSchemaGeneratorConfigChange,
}: PostEditorSeoProps) {
  const [activeTab, setActiveTab] = useState<SeoTab>("general");
  const [snippetModalOpen, setSnippetModalOpen] = useState(false);
  const [schemaGeneratorModalOpen, setSchemaGeneratorModalOpen] = useState(false);
  const [editSchema, setEditSchema] = useState<SchemaItem | null>(null);
  const [viewSchema, setViewSchema] = useState<SchemaItem | null>(null);

  const previewTitle = snippet.seoTitle || postTitle || "Sample Post Title";
  const previewPermalink = buildBlogPermalinkUrl(
    business.domain,
    snippet.permalink || postTitle,
  );
  const previewDescription =
    snippet.metaDescription ||
    "Please provide a meta description by editing the snippet below.";

  const pageUrl = useMemo(
    () => previewPermalink,
    [previewPermalink],
  );

  const handleSaveSchema = (updated: SchemaItem) => {
    onSchemasChange(
      schemas.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleDeleteSchema = (id: string) => {
    onSchemasChange(schemas.filter((item) => item.id !== id));
  };

  return (
    <>
      <div className="admin-metabox admin-seo-metabox">
        <div className="admin-metabox-header">
          <span>Elite Builders SEO</span>
          <span className="admin-metabox-toggle" aria-hidden>
            ▲
          </span>
        </div>

        <div className="admin-seo-tabs">
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
            className={`admin-seo-tab${activeTab === "advanced" ? " is-active" : ""}`}
            onClick={() => setActiveTab("advanced")}
          >
            <Briefcase size={14} strokeWidth={1.75} aria-hidden />
            Advanced
          </button>
          <button
            type="button"
            className={`admin-seo-tab${activeTab === "schema" ? " is-active" : ""}`}
            onClick={() => setActiveTab("schema")}
          >
            <Award size={14} strokeWidth={1.75} aria-hidden />
            Schema
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

        <div className="admin-metabox-body admin-seo-body">
          {activeTab === "general" && (
            <>
              <SeoSnippetPreview
                permalinkUrl={previewPermalink}
                title={previewTitle}
                description={previewDescription}
              />
              <button
                type="button"
                className="admin-btn-primary-inline admin-edit-snippet-btn"
                onClick={() => setSnippetModalOpen(true)}
              >
                Edit Snippet
              </button>
            </>
          )}

          {activeTab === "advanced" && (
            <p className="admin-seo-placeholder-copy">
              Advanced SEO settings will be available in a future update.
            </p>
          )}

          {activeTab === "schema" && (
            <div className="admin-schema-panel">
              <p className="admin-schema-intro">
                Configure Schema Markup for your pages. Search engines use
                structured data to display rich results in SERPs.{" "}
                <button type="button" className="admin-inline-link">
                  Learn more.
                </button>
              </p>

              <h3 className="admin-schema-heading">Schema in Use</h3>

              {schemas.length === 0 ? (
                <p className="admin-seo-placeholder-copy">
                  No schema markup added yet.
                </p>
              ) : (
                <ul className="admin-schema-list">
                  {schemas.map((item) => (
                    <li key={item.id} className="admin-schema-item">
                      <div className="admin-schema-item-label">
                        <Award size={16} strokeWidth={1.75} aria-hidden />
                        <span>{item.type}</span>
                      </div>
                      <div className="admin-schema-item-actions">
                        <button
                          type="button"
                          className="admin-schema-action"
                          aria-label={`Edit ${item.type} schema`}
                          onClick={() => setEditSchema(item)}
                        >
                          <Pencil size={15} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          className="admin-schema-action"
                          aria-label={`View ${item.type} schema`}
                          onClick={() => setViewSchema(item)}
                        >
                          <Eye size={15} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          className="admin-schema-action"
                          aria-label={`Delete ${item.type} schema`}
                          onClick={() => handleDeleteSchema(item.id)}
                        >
                          <Trash2 size={15} strokeWidth={1.75} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                className="admin-btn-primary-inline admin-schema-generator-btn"
                onClick={() => setSchemaGeneratorModalOpen(true)}
              >
                Schema Generator
              </button>
            </div>
          )}

          {activeTab === "social" && (
            <p className="admin-seo-placeholder-copy">
              Social SEO settings will be available in a future update.
            </p>
          )}
        </div>
      </div>

      {activeTab === "schema" && (
        <PostSchemaGeneratorPanel
          config={schemaGeneratorConfig}
          onChange={onSchemaGeneratorConfigChange}
        />
      )}

      <SchemaGeneratorModal
        isOpen={schemaGeneratorModalOpen}
        schemas={schemas}
        pageUrl={pageUrl}
        defaultHeadline={snippet.seoTitle || postTitle}
        defaultDescription={snippet.metaDescription}
        onClose={() => setSchemaGeneratorModalOpen(false)}
        onSchemasChange={onSchemasChange}
      />

      <PostSnippetModal
        isOpen={snippetModalOpen}
        snippet={snippet}
        fallbackTitle={postTitle}
        onClose={() => setSnippetModalOpen(false)}
        onSave={onSnippetChange}
      />

      <PostSchemaEditModal
        isOpen={editSchema !== null}
        schema={editSchema}
        onClose={() => setEditSchema(null)}
        onSave={handleSaveSchema}
      />

      <PostSchemaViewModal
        isOpen={viewSchema !== null}
        schema={viewSchema}
        pageUrl={pageUrl}
        onClose={() => setViewSchema(null)}
      />
    </>
  );
}
