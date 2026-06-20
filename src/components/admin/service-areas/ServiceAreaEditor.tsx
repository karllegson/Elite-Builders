"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HtmlIdeEditor } from "@/components/admin/HtmlIdeEditor";
import { PostEditorSeo } from "@/components/admin/posts/PostEditorSeo";
import { ServiceAreaExtraMetaboxes } from "@/components/admin/service-areas/ServiceAreaExtraMetaboxes";
import { ServiceAreaEditorSidebar } from "@/components/admin/service-areas/ServiceAreaEditorSidebar";
import { ServiceAreaPermalinkBar } from "@/components/admin/service-areas/ServiceAreaPermalinkBar";
import {
  buildServiceAreaPermalinkUrl,
  createSchemaItem,
  slugifyServiceAreaPermalink,
  type PostSeoSnippet,
  type SchemaItem,
} from "@/lib/admin/postSeo";
import { createDefaultSchemaGeneratorConfig } from "@/lib/admin/postSchemaGenerator";
import {
  createDefaultExtraFields,
  createDefaultPageAttributes,
  resolveServiceAreaParentId,
  serviceAreaToPublishSettings,
  type ServiceAreaExtraFields,
  type ServiceAreaFeaturedImage,
  type ServiceAreaPageAttributes,
} from "@/lib/admin/serviceAreaEditor";
import { createDefaultPublishSettings, type PublishSettings } from "@/lib/admin/postPublish";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  getServiceAreaById,
  upsertServiceArea,
  type ServiceAreaRecord,
} from "@/lib/admin/serviceAreasData";
import { getParentSlugForServiceArea } from "@/lib/site/serviceAreaUrls";

const SERVICE_AREA_SAVE_TOAST_KEY = "elite-builders-service-area-save-toast";

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
  const [loaded, setLoaded] = useState(!isEditing);
  const [missing, setMissing] = useState(false);
  const [publishSettings, setPublishSettings] = useState<PublishSettings>(
    createDefaultPublishSettings,
  );
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
    parentId: resolveServiceAreaParentId(defaultParentId),
  }));
  const [featuredImage, setFeaturedImage] = useState<ServiceAreaFeaturedImage | null>(null);
  const snippetEditedRef = useRef({
    seoTitle: false,
    permalink: false,
    metaDescription: false,
  });
  const parentSlug = useMemo(
    () => getParentSlugForServiceArea(pageAttributes.parentId),
    [pageAttributes.parentId],
  );

  const applyLoadedRecord = useCallback((record: ServiceAreaRecord) => {
    snippetEditedRef.current = {
      seoTitle: Boolean(record.seoTitle && record.seoTitle !== record.title),
      permalink: record.slug !== slugifyServiceAreaPermalink(record.title),
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
    setFeaturedImage(record.featuredImage);
    setPublishSettings(serviceAreaToPublishSettings(record));
  }, []);

  useEffect(() => {
    const savedMessage = sessionStorage.getItem(SERVICE_AREA_SAVE_TOAST_KEY);

    if (!savedMessage) {
      return;
    }

    sessionStorage.removeItem(SERVICE_AREA_SAVE_TOAST_KEY);
    toast.success(savedMessage);
  }, [toast]);

  useEffect(() => {
    if (isEditing || !defaultParentId) {
      return;
    }

    const resolvedParentId = resolveServiceAreaParentId(defaultParentId);

    if (!resolvedParentId) {
      return;
    }

    setPageAttributes((current) =>
      current.parentId === resolvedParentId
        ? current
        : {
            ...current,
            parentId: resolvedParentId,
          },
    );
  }, [defaultParentId, isEditing]);

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

    applyLoadedRecord(record);
    setLoaded(true);
  }, [applyLoadedRecord, serviceAreaId]);

  useEffect(() => {
    setSnippet((current) => ({
      seoTitle: snippetEditedRef.current.seoTitle ? current.seoTitle : title,
      permalink: snippetEditedRef.current.permalink
        ? current.permalink
        : slugifyServiceAreaPermalink(title),
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
    const autoPermalink = slugifyServiceAreaPermalink(nextSnippet.seoTitle || title);

    snippetEditedRef.current = {
      seoTitle: nextSnippet.seoTitle.trim() !== title.trim(),
      permalink: nextSnippet.permalink.trim() !== autoPermalink,
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

    let saved: ServiceAreaRecord;

    try {
      saved = upsertServiceArea({
        id: serviceAreaId,
        title,
        slug: snippet.permalink || slugifyServiceAreaPermalink(title),
        sortOrder: pageAttributes.order,
        status,
        unused: extraFields.archiveOnly,
        parentId: pageAttributes.parentId,
        content,
        seoTitle: snippet.seoTitle || title,
        metaDescription: snippet.metaDescription,
        seoSchema: primarySchema,
        featuredImage,
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

    const isSubPage = saved.parentId !== null;
    const wasEditing = Boolean(serviceAreaId);
    const message =
      status === "published"
        ? wasEditing
          ? isSubPage
            ? "Sub-page updated."
            : "Service area updated."
          : isSubPage
            ? "Sub-page published. It will appear under its parent in Nested View."
            : "Service area published. Open Sorting to arrange display order."
        : isSubPage
          ? "Sub-page draft saved."
          : "Draft saved.";

    sessionStorage.setItem(SERVICE_AREA_SAVE_TOAST_KEY, message);
    window.location.assign(`/admin/service-areas/${saved.id}`);
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
          parentSlug={parentSlug}
          onSlugChange={(permalink) =>
            handleSnippetChange({ ...snippet, permalink })
          }
        />

        <HtmlIdeEditor
          id="service-area-content"
          value={content}
          onChange={setContent}
          ariaLabel="Service area HTML content"
        />

        <PostEditorSeo
          postTitle={title}
          snippet={snippet}
          schemas={schemas}
          schemaGeneratorConfig={schemaGeneratorConfig}
          onSnippetChange={handleSnippetChange}
          onSchemasChange={setSchemas}
          onSchemaGeneratorConfigChange={setSchemaGeneratorConfig}
          buildPermalinkUrl={(domain, slug) =>
            buildServiceAreaPermalinkUrl(domain, slug, parentSlug)
          }
          slugifyPermalinkFromTitle={slugifyServiceAreaPermalink}
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
        featuredImage={featuredImage}
        onFeaturedImageChange={setFeaturedImage}
        publishSettings={publishSettings}
        onPublish={() => persistServiceArea("published")}
        onSaveDraft={() => persistServiceArea("draft")}
        primaryActionLabel={isEditing ? "Update" : "Publish"}
      />
    </div>
  );
}
