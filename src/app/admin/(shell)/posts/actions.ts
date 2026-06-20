"use server";

import { isAuthBypassEnabled } from "@/lib/admin/auth";
import { siteConfig } from "@/lib/admin/config";
import type { SavePostPayload } from "@/lib/admin/posts.dto";
import { toCategoryDTO, toPostDTO, toTagDTO } from "@/lib/admin/posts.dto";
import { toPostListItems } from "@/lib/admin/postsMappers";
import {
  bulkUpdatePostStatus,
  createCategory,
  createTag,
  deleteCategories,
  deletePostsPermanently,
  deleteTags,
  getPostById,
  getPostBySlug,
  getPublicPostBySlug,
  listCategories,
  listPosts,
  listPublishedPublicPosts,
  listTags,
  sanitizeSlug,
  upsertPost,
  updatePostFeaturedImage,
} from "@/lib/admin/posts.server";
import {
  resolveMediaById,
  toPostFeaturedImage,
  type PostFeaturedImage,
} from "@/lib/admin/resolveMediaById";
import type {
  CreateCategoryInput,
  CreateTagInput,
  PostStoreStatus,
} from "@/lib/admin/posts.types";
import { createClient } from "@/lib/supabase/server";

async function assertAdminAuth(): Promise<void> {
  if (isAuthBypassEnabled()) {
    return;
  }

  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Unauthorized");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }
}

export async function fetchPostsForAdmin(): Promise<{
  items: ReturnType<typeof toPostListItems>;
  error?: string;
}> {
  try {
    await assertAdminAuth();

    const [posts, categories, tags] = await Promise.all([
      listPosts(),
      listCategories(),
      listTags(),
    ]);

    return {
      items: toPostListItems(posts, categories, tags, siteConfig.defaultUserRole),
    };
  } catch (error) {
    return {
      items: [],
      error: error instanceof Error ? error.message : "Could not load posts.",
    };
  }
}

export async function fetchPostForEdit(postId: string) {
  await assertAdminAuth();

  const post = await getPostById(postId);

  if (!post) {
    return { post: null };
  }

  return { post: toPostDTO(post) };
}

export async function savePostAction(
  payload: SavePostPayload,
): Promise<{ post?: ReturnType<typeof toPostDTO>; error?: string }> {
  try {
    await assertAdminAuth();

    const slug = sanitizeSlug(payload.slug || payload.permalink || payload.title);

    const post = await upsertPost({
      id: payload.id,
      title: payload.title,
      slug,
      content: payload.content,
      excerpt: payload.excerpt,
      status: payload.status,
      visibility: payload.visibility,
      password: payload.password,
      stickToFrontPage: payload.stickToFrontPage,
      featuredImageId: payload.featuredImageId,
      seoTitle: payload.seoTitle,
      metaDescription: payload.metaDescription,
      permalink: sanitizeSlug(payload.permalink || slug),
      schemas: payload.schemas,
      schemaGeneratorConfig: payload.schemaGeneratorConfig,
      categoryIds: payload.categoryIds,
      tagIds: payload.tagIds,
      publishedAt: payload.publishedAt,
      lockModifiedDate: payload.lockModifiedDate,
    });

    return { post: toPostDTO(post) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save post.",
    };
  }
}

export async function updatePostFeaturedImageAction(
  postId: string,
  featuredImageId: string | null,
): Promise<{ post?: ReturnType<typeof toPostDTO>; error?: string }> {
  try {
    await assertAdminAuth();

    const post = await updatePostFeaturedImage(postId, featuredImageId);

    if (!post) {
      return { error: "Post not found." };
    }

    return { post: toPostDTO(post) };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not save featured image.",
    };
  }
}

export async function bulkPostsAction(
  ids: string[],
  action: "trash" | "restore" | "delete",
): Promise<{ updated: number; error?: string }> {
  try {
    await assertAdminAuth();

    if (ids.length === 0) {
      return { updated: 0, error: "No posts selected." };
    }

    if (action === "delete") {
      const updated = await deletePostsPermanently(ids);
      return { updated };
    }

    const status: PostStoreStatus = action === "trash" ? "trash" : "draft";
    const updated = await bulkUpdatePostStatus(ids, status);
    return { updated };
  } catch (error) {
    return {
      updated: 0,
      error: error instanceof Error ? error.message : "Bulk action failed.",
    };
  }
}

export async function fetchCategoriesAction() {
  await assertAdminAuth();
  const categories = await listCategories();
  return categories.map(toCategoryDTO);
}

export async function createCategoryAction(input: CreateCategoryInput) {
  try {
    await assertAdminAuth();
    const category = await createCategory(input);
    return { category: toCategoryDTO(category) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create category.",
    };
  }
}

export async function deleteCategoriesAction(ids: string[]) {
  try {
    await assertAdminAuth();
    const deleted = await deleteCategories(ids);
    return { deleted };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : "Could not delete categories.",
    };
  }
}

export async function fetchTagsAction() {
  await assertAdminAuth();
  const tags = await listTags();
  return tags.map(toTagDTO);
}

export async function createTagAction(input: CreateTagInput) {
  try {
    await assertAdminAuth();
    const tag = await createTag(input);
    return { tag: toTagDTO(tag) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create tag.",
    };
  }
}

export async function deleteTagsAction(ids: string[]) {
  try {
    await assertAdminAuth();
    const deleted = await deleteTags(ids);
    return { deleted };
  } catch (error) {
    return {
      deleted: 0,
      error: error instanceof Error ? error.message : "Could not delete tags.",
    };
  }
}

export async function fetchCategoriesWithCountsAction() {
  await assertAdminAuth();

  const [categories, posts] = await Promise.all([listCategories(), listPosts()]);

  return categories.map((category) => ({
    ...toCategoryDTO(category),
    postCount: posts.filter(
      (post) => post.status !== "trash" && post.categoryIds.includes(category.id),
    ).length,
  }));
}

export async function fetchTagsWithCountsAction() {
  await assertAdminAuth();

  const [tags, posts] = await Promise.all([listTags(), listPosts()]);

  return tags.map((tag) => ({
    ...toTagDTO(tag),
    postCount: posts.filter(
      (post) => post.status !== "trash" && post.tagIds.includes(tag.id),
    ).length,
  }));
}

export async function fetchPublishedPostsForSite() {
  try {
    const posts = await listPublishedPublicPosts();
    return posts.map(toPostDTO);
  } catch {
    return [];
  }
}

export async function fetchRecentPostsForSite(options?: {
  limit?: number;
  excludeSlug?: string;
}) {
  try {
    const limit = options?.limit ?? 3;
    const posts = await listPublishedPublicPosts();

    return posts
      .filter((post) => post.slug !== options?.excludeSlug)
      .slice(0, limit)
      .map(toPostDTO);
  } catch {
    return [];
  }
}

export async function fetchPublicPostBySlug(slug: string) {
  try {
    const post = await getPublicPostBySlug(slug);
    return post ? toPostDTO(post) : null;
  } catch {
    return null;
  }
}

export async function fetchFeaturedImageForPost(
  featuredImageId: string | null,
): Promise<PostFeaturedImage | null> {
  if (!featuredImageId) {
    return null;
  }

  const attachment = await resolveMediaById(featuredImageId);
  return attachment ? toPostFeaturedImage(attachment) : null;
}

export async function verifyPostPasswordAction(
  slug: string,
  password: string,
): Promise<{ ok: boolean }> {
  const post = await getPostBySlug(slug);

  if (!post || post.visibility !== "password" || post.status === "trash") {
    return { ok: false };
  }

  return { ok: post.password === password };
}
