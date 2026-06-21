"use client";

import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PostEditorSeo } from "@/components/admin/posts/PostEditorSeo";
import { PageEditorMetabox } from "@/components/admin/pages/PageEditorMetabox";
import { PageEditorSidebar } from "@/components/admin/pages/PageEditorSidebar";
import { PageEditorToolbar } from "@/components/admin/pages/PageEditorToolbar";
import { PagePermalinkBar } from "@/components/admin/pages/PagePermalinkBar";
import { countWords } from "@/lib/admin/postEditor";
import {
  createDefaultArticleSchema,
  slugify,
  type PostSeoSnippet,
  type SchemaItem,
} from "@/lib/admin/postSeo";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  createDefaultSchemaGeneratorConfig,
  type SchemaGeneratorConfig,
} from "@/lib/admin/postSchemaGenerator";

export function PageEditor() {
  const toast = useAdminToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pageScripts, setPageScripts] = useState("");
  const [breadcrumbLinkInactive, setBreadcrumbLinkInactive] = useState(false);
  const [ctaOverrideTitle, setCtaOverrideTitle] = useState("");
  const [ctaOverrideBody, setCtaOverrideBody] = useState("");
  const [snippet, setSnippet] = useState<PostSeoSnippet>({
    seoTitle: "",
    permalink: "",
    metaDescription: "",
  });
  const [schemas, setSchemas] = useState<SchemaItem[]>([
    createDefaultArticleSchema(),
  ]);
  const [schemaGeneratorConfig, setSchemaGeneratorConfig] = useState(
    createDefaultSchemaGeneratorConfig,
  );
  const snippetEditedRef = useRef({
    seoTitle: false,
    permalink: false,
    metaDescription: false,
  });

  const wordCount = countWords(content);
  const lineNumbers = useMemo(() => {
    const count = Math.max(1, content.split("\n").length);
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [content]);

  useEffect(() => {
    setSnippet((current) => ({
      seoTitle: snippetEditedRef.current.seoTitle ? current.seoTitle : title,
      permalink: snippetEditedRef.current.permalink
        ? current.permalink
        : slugify(title),
      metaDescription: current.metaDescription,
    }));
  }, [title]);

  useEffect(() => {
    setSchemas((current) => {
      if (current.length === 0 || current[0].type !== "Article") {
        return current;
      }

      return [
        {
          ...current[0],
          headline: snippet.seoTitle || title,
          description: snippet.metaDescription,
        },
        ...current.slice(1),
      ];
    });
  }, [snippet.seoTitle, snippet.metaDescription, title]);

  const handleSnippetChange = (nextSnippet: PostSeoSnippet) => {
    snippetEditedRef.current = {
      seoTitle: nextSnippet.seoTitle !== title,
      permalink: nextSnippet.permalink !== slugify(title),
      metaDescription: nextSnippet.metaDescription.length > 0,
    };

    setSnippet(nextSnippet);

    setSchemas((current) =>
      current.map((schema, index) =>
        index === 0 && schema.type === "Article"
          ? {
              ...schema,
              headline: nextSnippet.seoTitle,
              description: nextSnippet.metaDescription,
            }
          : schema,
      ),
    );
  };

  const handleMediaAction = (label: string) => {
    toast.info(label);
  };

  return (
    <div className="admin-post-editor admin-page-editor">
      <div className="admin-post-editor-main">
        <label className="admin-post-title-label" htmlFor="page-title">
          Add title
        </label>
        <input
          id="page-title"
          type="text"
          className="admin-post-title"
          placeholder="Add title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
        />

        <PagePermalinkBar
          slug={snippet.permalink}
          onSlugChange={(permalink) =>
            handleSnippetChange({ ...snippet, permalink })
          }
        />

        <PageEditorToolbar
          textareaRef={textareaRef}
          onContentChange={setContent}
          onMediaAction={handleMediaAction}
        />

        <div className="admin-page-content-shell">
          <div className="admin-page-content-linenumbers" aria-hidden>
            {lineNumbers.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <div className="admin-page-content-editor">
            <button
              type="button"
              className="admin-page-content-settings"
              aria-label="Editor settings"
            >
              <Settings2 size={14} aria-hidden />
            </button>
            <textarea
              ref={textareaRef}
              id="page-content"
              className="admin-post-content admin-page-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              spellCheck={false}
              aria-label="Page content"
            />
          </div>
        </div>

        <div className="admin-post-editor-footer admin-page-editor-footer">
          <span>Word count: {wordCount}</span>
          <button type="button" className="admin-inline-link admin-page-shortcuts-link">
            Shortcuts ( CTRL + ALT + &quot;below&quot; )
          </button>
        </div>

        <PageEditorMetabox title="Legson Media Page Specific Scripts">
          <label className="admin-page-scripts-label" htmlFor="page-scripts">
            Add custom scripts for this page:
          </label>
          <textarea
            id="page-scripts"
            className="admin-page-scripts-input"
            value={pageScripts}
            onChange={(event) => setPageScripts(event.target.value)}
            rows={8}
          />
        </PageEditorMetabox>

        <PageEditorMetabox title="Breadcrumbs Link">
          <label className="admin-page-checkbox-field">
            <input
              type="checkbox"
              checked={breadcrumbLinkInactive}
              onChange={(event) => setBreadcrumbLinkInactive(event.target.checked)}
            />
            <span>Make link inactive on breadcrumbs.</span>
          </label>
        </PageEditorMetabox>

        <PageEditorMetabox title="Page CTA Override">
          <label className="admin-page-cta-field">
            <span>Title:</span>
            <input
              type="text"
              className="admin-page-cta-input"
              value={ctaOverrideTitle}
              onChange={(event) => setCtaOverrideTitle(event.target.value)}
            />
          </label>
          <label className="admin-page-cta-field">
            <span>Body:</span>
            <textarea
              className="admin-page-cta-textarea"
              value={ctaOverrideBody}
              onChange={(event) => setCtaOverrideBody(event.target.value)}
              rows={6}
            />
          </label>
        </PageEditorMetabox>

        <PostEditorSeo
          postTitle={title}
          snippet={snippet}
          schemas={schemas}
          schemaGeneratorConfig={schemaGeneratorConfig}
          onSnippetChange={handleSnippetChange}
          onSchemasChange={setSchemas}
          onSchemaGeneratorConfigChange={setSchemaGeneratorConfig}
        />
      </div>

      <PageEditorSidebar
        pageTitle={title}
        pageContent={content}
        seoSnippet={snippet}
      />
    </div>
  );
}
