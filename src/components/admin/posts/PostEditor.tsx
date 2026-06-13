"use client";

import { useEffect, useRef, useState } from "react";
import { countWords } from "@/lib/admin/postEditor";
import {
  createDefaultArticleSchema,
  slugify,
  type PostSeoSnippet,
  type SchemaItem,
} from "@/lib/admin/postSeo";
import {
  createDefaultSchemaGeneratorConfig,
  type SchemaGeneratorConfig,
} from "@/lib/admin/postSchemaGenerator";
import { PostEditorSeo } from "@/components/admin/posts/PostEditorSeo";
import { PostEditorSidebar } from "@/components/admin/posts/PostEditorSidebar";
import { PostEditorToolbar } from "@/components/admin/posts/PostEditorToolbar";
import { PostPermalinkBar } from "@/components/admin/posts/PostPermalinkBar";

export function PostEditor() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

  return (
    <div className="admin-post-editor">
      <div className="admin-post-editor-main">
        <label className="admin-post-title-label" htmlFor="post-title">
          Add title
        </label>
        <input
          id="post-title"
          type="text"
          className="admin-post-title"
          placeholder="Add title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
        />

        <PostPermalinkBar
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
            id="post-content"
            className="admin-post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            spellCheck={false}
            aria-label="Post content"
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
        />
      </div>

      <PostEditorSidebar
        postTitle={title}
        postContent={content}
        seoSnippet={snippet}
      />
    </div>
  );
}
