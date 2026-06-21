"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  bulkPostsAction,
  fetchPostForEdit,
  savePostAction,
  updatePostFeaturedImageAction,
} from "@/app/admin/(shell)/posts/actions";
import { fetchMediaLibrary } from "@/app/admin/media/actions";
import { HtmlIdeEditor } from "@/components/admin/HtmlIdeEditor";
import { PostEditorSeo } from "@/components/admin/posts/PostEditorSeo";
import { PostEditorSidebar } from "@/components/admin/posts/PostEditorSidebar";
import { PostPermalinkBar } from "@/components/admin/posts/PostPermalinkBar";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import { fromMediaDTO } from "@/lib/admin/media.dto";
import {
  createDefaultPublishSettings,
  type PublishSettings,
} from "@/lib/admin/postPublish";
import {
  createDefaultSchemaGeneratorConfig,
  type SchemaGeneratorConfig,
} from "@/lib/admin/postSchemaGenerator";
import {
  createDefaultArticleSchema,
  slugify,
  type PostSeoSnippet,
  type SchemaItem,
} from "@/lib/admin/postSeo";
import type { PostRecordDTO } from "@/lib/admin/posts.dto";
import type { PostStoreStatus } from "@/lib/admin/posts.types";

type PostEditorProps = {
  postId?: string;
};

function postToPublishSettings(post: PostRecordDTO): PublishSettings {
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt)
    : new Date(post.updatedAt);

  let status: PublishSettings["status"] = "draft";

  if (post.status === "published" || post.status === "scheduled") {
    status = "published";
  } else if (post.status === "draft") {
    status = "draft";
  }

  return {
    status,
    visibility: post.visibility,
    password: post.password,
    stickToFrontPage: post.stickToFrontPage,
    publishDate,
    lockModifiedDate: post.lockModifiedDate,
  };
}

function resolveStoreStatus(settings: PublishSettings): PostStoreStatus {
  if (settings.status === "draft" || settings.status === "pending") {
    return "draft";
  }

  if (settings.publishDate.getTime() > Date.now()) {
    return "scheduled";
  }

  return "published";
}

export function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter();
  const publishSettingsRef = useRef<PublishSettings>(createDefaultPublishSettings());
  const snippetEditedRef = useRef({
    seoTitle: false,
    permalink: false,
    metaDescription: false,
  });

  const toast = useAdminToast();
  const [loadedPostId, setLoadedPostId] = useState<string | undefined>(postId);
  const [isLoading, setIsLoading] = useState(Boolean(postId));
  const [isSaving, setIsSaving] = useState(false);

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
  const [schemaGeneratorConfig, setSchemaGeneratorConfig] = useState<SchemaGeneratorConfig>(
    createDefaultSchemaGeneratorConfig(),
  );
  const [initialPublishSettings, setInitialPublishSettings] = useState<
    PublishSettings | undefined
  >(postId ? undefined : createDefaultPublishSettings());
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<MediaAttachment | null>(null);

  const previewHref = snippet.permalink ? `/blog/${snippet.permalink}` : "/blog";

  const showMessage = useCallback(
    (message: string, isError = false) => {
      if (isError) {
        toast.error(message);
        return;
      }

      toast.success(message);
    },
    [toast],
  );

  const applyLoadedPost = useCallback(async (post: PostRecordDTO) => {
    setLoadedPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setSnippet({
      seoTitle: post.seoTitle,
      permalink: post.permalink || post.slug,
      metaDescription: post.metaDescription,
    });
    snippetEditedRef.current = {
      seoTitle: true,
      permalink: true,
      metaDescription: Boolean(post.metaDescription),
    };
    setSchemas(post.schemas.length > 0 ? post.schemas : [createDefaultArticleSchema()]);
    setSchemaGeneratorConfig(post.schemaGeneratorConfig);
    setCategoryIds(post.categoryIds);
    const settings = postToPublishSettings(post);
    publishSettingsRef.current = settings;
    setInitialPublishSettings(settings);

    if (post.featuredImageId) {
      const media = await fetchMediaLibrary();
      const match = media.items.find((item) => item.id === post.featuredImageId);

      if (match) {
        setFeaturedImage(fromMediaDTO(match));
      } else {
        setFeaturedImage({
          id: post.featuredImageId,
          src: "",
          filename: "",
          title: "",
          alt: "",
          caption: "",
          description: "",
          mimeType: "image/jpeg",
          fileSize: 0,
          width: 0,
          height: 0,
          uploadedAt: new Date(),
        });
      }
    } else {
      setFeaturedImage(null);
    }
  }, []);

  useEffect(() => {
    if (!postId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      const result = await fetchPostForEdit(postId);

      if (cancelled) {
        return;
      }

      if (!result.post) {
        showMessage("Post not found.", true);
        setIsLoading(false);
        return;
      }

      await applyLoadedPost(result.post);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyLoadedPost, postId, showMessage]);

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

  const handlePublishSettingsChange = (settings: PublishSettings) => {
    publishSettingsRef.current = settings;
  };

  const handleFeaturedImageChange = useCallback(
    async (image: MediaAttachment | null) => {
      setFeaturedImage(image);

      if (!loadedPostId) {
        if (image) {
          showMessage("Featured image selected. Save or publish the post to keep it.");
        }
        return;
      }

      const result = await updatePostFeaturedImageAction(
        loadedPostId,
        image?.id ?? null,
      );

      if (result.error || !result.post) {
        showMessage(result.error ?? "Could not save featured image.", true);
        return;
      }

      setLoadedPostId(result.post.id);
      showMessage(image ? "Featured image saved." : "Featured image removed.");
    },
    [loadedPostId, showMessage],
  );

  const savePost = async (overrideStatus?: PublishSettings["status"]) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      showMessage("Add a title before saving.", true);
      return;
    }

    const settings = { ...publishSettingsRef.current };

    if (overrideStatus) {
      settings.status = overrideStatus;
    }

    const storeStatus = resolveStoreStatus(settings);

    setIsSaving(true);

    const result = await savePostAction({
      id: loadedPostId,
      title: trimmedTitle,
      slug: snippet.permalink,
      content,
      status: storeStatus,
      visibility: settings.visibility,
      password: settings.password,
      stickToFrontPage: settings.stickToFrontPage,
      featuredImageId: featuredImage?.id ?? null,
      seoTitle: snippet.seoTitle || trimmedTitle,
      metaDescription: snippet.metaDescription,
      permalink: snippet.permalink,
      schemas,
      schemaGeneratorConfig,
      categoryIds,
      tagIds: [],
      publishedAt: settings.publishDate.toISOString(),
      lockModifiedDate: settings.lockModifiedDate,
    });

    setIsSaving(false);

    if (result.error || !result.post) {
      showMessage(result.error ?? "Could not save post.", true);
      return;
    }

    await applyLoadedPost(result.post);

    if (!postId && result.post.id) {
      router.replace(`/admin/posts/new?post=${result.post.id}`);
    }

    const label =
      storeStatus === "published"
        ? "Post published."
        : storeStatus === "scheduled"
          ? "Post scheduled."
          : "Draft saved.";

    showMessage(label);
  };

  const handleMoveToTrash = async () => {
    if (!loadedPostId) {
      showMessage("Save the post before moving it to trash.", true);
      return;
    }

    const result = await bulkPostsAction([loadedPostId], "trash");

    if (result.error) {
      showMessage(result.error, true);
      return;
    }

    showMessage("Post moved to trash.");
    router.push("/admin/posts");
  };

  if (isLoading) {
    return <p className="admin-post-editor-loading">Loading post…</p>;
  }

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

        <HtmlIdeEditor
          id="post-content"
          value={content}
          onChange={setContent}
          ariaLabel="Post content"
        />

        {isSaving ? (
          <div className="admin-post-editor-footer">
            <span>Saving…</span>
          </div>
        ) : null}

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
        categoryIds={categoryIds}
        onCategoryIdsChange={setCategoryIds}
        featuredImage={featuredImage}
        onFeaturedImageChange={handleFeaturedImageChange}
        publishSettings={initialPublishSettings ?? createDefaultPublishSettings()}
        initialPublishSettings={initialPublishSettings}
        publishSettingsRef={publishSettingsRef}
        onPublishSettingsChange={handlePublishSettingsChange}
        previewHref={previewHref}
        onPublish={() => void savePost("published")}
        onSaveDraft={() => void savePost("draft")}
        onMoveToTrash={() => void handleMoveToTrash()}
        primaryActionLabel={
          initialPublishSettings?.status === "published" ? "Update" : "Publish"
        }
      />
    </div>
  );
}
