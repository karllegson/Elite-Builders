"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AdminPostContentEditor } from "@/components/admin/posts/AdminPostContentEditor";
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
import { createDefaultSchemaGeneratorConfig } from "@/lib/admin/postSchemaGenerator";
import {
  createDefaultExtraFields,
  createDefaultPageAttributes,
  type ServiceAreaExtraFields,
  type ServiceAreaPageAttributes,
} from "@/lib/admin/serviceAreaEditor";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  getServiceAreaById,
  upsertServiceArea,
} from "@/lib/admin/serviceAreasData";

type ServiceAreaEditorProps = {
  serviceAreaId?: string;
  defaultParentId?: string | null;
};

export function ServiceAreaEditor({
  serviceAreaId,
  defaultParentId = null,
}: ServiceAreaEditorProps) {
  const toast = useAdminToast();
  const isEditing = Boolean(serviceAreaId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [loaded, setLoaded] = useState(!isEditing);
  const [missing, setMissing] = useState(false);
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
  const [pageAttributes, setPageAttributes] = useState<ServiceAreaPageAttributes>(() => ({
    ...createDefaultPageAttributes(),
    parentId: defaultParentId,
  }));
  const [hasFeaturedImage, setHasFeaturedImage] = useState(false);
  const snippetEditedRef = useRef({
    seoTitle: false,
    permalink: false,
    metaDescription: false,
  });

  const wordCount = countWords(content);

  useEffect(() => {
    if (!serviceAreaId) {
      return;
    }

    const record = getServiceAreaById(serviceAreaId);

    if (!record) {
      setMissing(true);
      setLoaded(true);
      return;
    }

    snippetEditedRef.current = {
      seoTitle: true,
      permalink: true,
      metaDescription: Boolean(record.metaDescription),
    };

    setTitle(record.title);
    setContent(record.content);
    setSnippet({
      seoTitle: record.seoTitle,
      permalink: record.slug,
      metaDescription: record.metaDescription,
    });
    setSchemas([
      {
        ...createSchemaItem(record.seoSchema === "service" ? "Service" : "WebPage"),
        headline: record.seoTitle,
        description: record.metaDescription,
      },
    ]);
    setExtraFields({
      mapEmbed: record.mapEmbed,
      archiveOnly: record.archiveOnly,
      breadcrumbsLinkInactive: record.breadcrumbsLinkInactive,
    });
    setPageAttributes({
      parentId: record.parentId,
      order: record.sortOrder,
    });
    setHasFeaturedImage(record.hasFeaturedImage);
    setLoaded(true);
  }, [serviceAreaId]);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setSnippet((current) => ({
      seoTitle: snippetEditedRef.current.seoTitle ? current.seoTitle : title,
      permalink: snippetEditedRef.current.permalink
        ? current.permalink
        : slugify(title),
      metaDescription: current.metaDescription,
    }));
  }, [isEditing, title]);

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
        index === 0
          ? {
              ...schema,
              headline: nextSnippet.seoTitle,
              description: nextSnippet.metaDescription,
            }
          : schema,
      ),
    );
  };

  const persistServiceArea = (status: "published" | "draft") => {
    if (!title.trim()) {
      toast.error("Add a title before saving (e.g. Stockton, CA).");
      return;
    }

    const primarySchema = schemas[0]?.type ?? "WebPage";

    try {
      upsertServiceArea({
        id: serviceAreaId,
        title,
        slug: snippet.permalink || slugify(title),
        sortOrder: pageAttributes.order,
        status,
        unused: extraFields.archiveOnly,
        parentId: pageAttributes.parentId,
        content,
        seoTitle: snippet.seoTitle || title,
        metaDescription: snippet.metaDescription,
        seoSchema: primarySchema,
        hasFeaturedImage,
        archiveOnly: extraFields.archiveOnly,
        mapEmbed: extraFields.mapEmbed,
        breadcrumbsLinkInactive: extraFields.breadcrumbsLinkInactive,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save this service area.",
      );
      return;
    }

    const isSubPage = pageAttributes.parentId !== null;

    toast.success(
      status === "published"
        ? isEditing
          ? isSubPage
            ? "Sub-page updated."
            : "Service area updated."
          : isSubPage
            ? "Sub-page published. It will appear under its parent in Nested View."
            : "Service area published. Open Sorting to arrange display order."
        : isSubPage
          ? "Sub-page draft saved."
          : "Draft saved.",
    );
  };

  if (!loaded) {
    return <p className="admin-post-editor-status">Loading service area…</p>;
  }

  if (missing) {
    return (
      <div className="admin-post-editor">
        <p className="admin-categories-status-message admin-post-editor-status" role="status">
          Service area not found.{" "}
          <Link href="/admin/service-areas">Return to all service areas</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-post-editor">
      <div className="admin-post-editor-main">
        <label className="admin-post-title-label" htmlFor="service-area-title">
          {isEditing ? "Edit title" : "Add title"}
        </label>
        <input
          id="service-area-title"
          type="text"
          className="admin-post-title"
          placeholder={isEditing ? "" : "Add title"}
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

        <AdminPostContentEditor
          id="service-area-content"
          value={content}
          onChange={setContent}
          textareaRef={textareaRef}
          ariaLabel="Service area content"
        />

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
        pageAttributes={pageAttributes}
        onPageAttributesChange={setPageAttributes}
        excludeParentId={serviceAreaId}
        hasFeaturedImage={hasFeaturedImage}
        onFeaturedImageChange={setHasFeaturedImage}
        onPublish={() => persistServiceArea("published")}
        onSaveDraft={() => persistServiceArea("draft")}
        primaryActionLabel={isEditing ? "Update" : "Publish"}
      />
    </div>
  );
}
