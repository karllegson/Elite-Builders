"use client";

import { useEffect, useRef, useState } from "react";
import { PostEditorSeo } from "@/components/admin/posts/PostEditorSeo";
import { PostEditorToolbar } from "@/components/admin/posts/PostEditorToolbar";
import { ServiceAreaExtraMetaboxes } from "@/components/admin/service-areas/ServiceAreaExtraMetaboxes";
import { ServiceAreaEditorSidebar } from "@/components/admin/service-areas/ServiceAreaEditorSidebar";
import { ServiceAreaPermalinkBar } from "@/components/admin/service-areas/ServiceAreaPermalinkBar";
import { countWords } from "@/lib/admin/postEditor";
import {
  buildServiceAreaPermalinkUrl,
  createSchemaItem,
  slugify,
  type PostSeoSnippet,
  type SchemaItem,
} from "@/lib/admin/postSeo";
import {
  createDefaultSchemaGeneratorConfig,
  type SchemaGeneratorConfig,
} from "@/lib/admin/postSchemaGenerator";
import {
  createDefaultExtraFields,
  type ServiceAreaExtraFields,
} from "@/lib/admin/serviceAreaEditor";

export function ServiceAreaEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [snippet, setSnippet] = useState<PostSeoSnippet>({
    seoTitle: "",
    permalink: "",
    metaDescription: "",
  });
  const [schemas, setSchemas] = useState<SchemaItem[]>([
    createSchemaItem("WebPage"),
  ]);
  const [schemaGeneratorConfig, setSchemaGeneratorConfig] = useState(
    createDefaultSchemaGeneratorConfig,
  );
  const [extraFields, setExtraFields] = useState<ServiceAreaExtraFields>(
    createDefaultExtraFields,
  );
  const snippetEditedRef = useRef({
    seoTitle: false,
    permalink: false,
    metaDescription: false,
  });

  const wordCount = countWords(content);

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
      if (current.length === 0 || current[0].type !== "WebPage") {
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
        index === 0 && schema.type === "WebPage"
          ? {
              ...schema,
              headline: nextSnippet.seoTitle,
              description: nextSnippet.metaDescription,
            }
          : schema,
      ),
    );
  };

  return (
    <div className="admin-post-editor">
      <div className="admin-post-editor-main">
        <label className="admin-post-title-label" htmlFor="service-area-title">
          Add title
        </label>
        <input
          id="service-area-title"
          type="text"
          className="admin-post-title"
          placeholder="Add title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
        />

        <ServiceAreaPermalinkBar
          slug={snippet.permalink}
          onSlugChange={(permalink) =>
            handleSnippetChange({ ...snippet, permalink })
          }
        />

        <PostEditorToolbar
          textareaRef={textareaRef}
          onContentChange={setContent}
        />

        <div className="admin-post-content-wrap">
          <textarea
            ref={textareaRef}
            id="service-area-content"
            className="admin-post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            spellCheck={false}
            aria-label="Service area content"
          />
        </div>

        <div className="admin-post-editor-footer">
          <span>Word count: {wordCount}</span>
        </div>

        <PostEditorSeo
          postTitle={title}
          snippet={snippet}
          schemas={schemas}
          schemaGeneratorConfig={schemaGeneratorConfig}
          onSnippetChange={handleSnippetChange}
          onSchemasChange={setSchemas}
          onSchemaGeneratorConfigChange={setSchemaGeneratorConfig}
          buildPermalinkUrl={buildServiceAreaPermalinkUrl}
          fallbackPreviewTitle="Sample Service Area Title"
        />

        <ServiceAreaExtraMetaboxes
          fields={extraFields}
          onChange={setExtraFields}
        />
      </div>

      <ServiceAreaEditorSidebar
        title={title}
        content={content}
        seoSnippet={snippet}
      />
    </div>
  );
}
