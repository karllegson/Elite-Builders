import { siteConfig } from "@/lib/admin/config";
import { createCategoryId } from "@/lib/admin/postCategories";
import { createDefaultSchemaGeneratorConfig } from "@/lib/admin/postSchemaGenerator";
import { createDefaultArticleSchema, slugify } from "@/lib/admin/postSeo";
import { readPostsStore, writePostsStore } from "@/lib/admin/postsLocalData";
import type {
  CreateCategoryInput,
  CreateTagInput,
  PostCategoryRecord,
  PostRecord,
  PostsStore,
  PostStoreStatus,
  PostTagRecord,
  UpsertPostInput,
} from "@/lib/admin/posts.types";
import { createTagId } from "@/lib/admin/tagsList";
import { stripQuickSummaryForExcerpt } from "@/lib/site/postContent";
import {
  MISSING_POSTS_TABLES_MESSAGE,
  SUPABASE_REQUIRED_MESSAGE,
  canUseLocalFileStore,
} from "@/lib/admin/localFileStore";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

export const DEFAULT_POST_AUTHOR = siteConfig.defaultUserRole;

export function sanitizeSlug(value: string): string {
  return slugify(value);
}

function createPostId(): string {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nextNumericId(posts: PostRecord[]): number {
  const highest = posts.reduce((max, post) => Math.max(max, post.numericId), 1000);
  return highest + 1;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildExcerpt(content: string, excerpt?: string): string {
  const trimmed = excerpt?.trim();
  if (trimmed) {
    return trimmed;
  }

  const plain = stripHtml(stripQuickSummaryForExcerpt(content));
  return plain.length > 160 ? `${plain.slice(0, 157)}...` : plain;
}

function normalizePostRecord(post: PostRecord): PostRecord {
  return {
    ...post,
    permalink: post.permalink || post.slug,
    schemas: post.schemas?.length ? post.schemas : [createDefaultArticleSchema()],
    schemaGeneratorConfig:
      post.schemaGeneratorConfig ?? createDefaultSchemaGeneratorConfig(),
    categoryIds: post.categoryIds ?? [],
    tagIds: post.tagIds ?? [],
    password: post.password ?? "",
    stickToFrontPage: post.stickToFrontPage ?? false,
    lockModifiedDate: post.lockModifiedDate ?? false,
  };
}

function resolvePublishedAt(
  status: PostStoreStatus,
  publishDateIso: string | null | undefined,
  existing: PostRecord | null,
  now: string,
): string | null {
  if (status === "trash" || status === "draft") {
    return existing?.publishedAt ?? null;
  }

  if (status === "scheduled") {
    return publishDateIso ?? existing?.publishedAt ?? now;
  }

  return publishDateIso ?? existing?.publishedAt ?? now;
}

function buildPostRecord(
  input: UpsertPostInput,
  existing: PostRecord | null,
  numericId: number,
  resolvedId: string,
): PostRecord {
  const now = new Date().toISOString();
  const trimmedTitle = input.title.trim();

  if (!trimmedTitle) {
    throw new Error("Title is required.");
  }

  const slug = sanitizeSlug(input.slug?.trim() || input.permalink?.trim() || trimmedTitle);
  const status = input.status ?? existing?.status ?? "draft";

  return normalizePostRecord({
    id: resolvedId,
    numericId,
    title: trimmedTitle,
    slug,
    content: input.content ?? existing?.content ?? "",
    excerpt: buildExcerpt(input.content ?? existing?.content ?? "", input.excerpt),
    status,
    visibility: input.visibility ?? existing?.visibility ?? "public",
    password: input.password ?? existing?.password ?? "",
    stickToFrontPage: input.stickToFrontPage ?? existing?.stickToFrontPage ?? false,
    author: existing?.author ?? DEFAULT_POST_AUTHOR,
    featuredImageId:
      input.featuredImageId !== undefined
        ? input.featuredImageId
        : (existing?.featuredImageId ?? null),
    seoTitle: input.seoTitle ?? existing?.seoTitle ?? trimmedTitle,
    metaDescription: input.metaDescription ?? existing?.metaDescription ?? "",
    permalink: sanitizeSlug(input.permalink?.trim() || slug),
    schemas: input.schemas ?? existing?.schemas ?? [createDefaultArticleSchema()],
    schemaGeneratorConfig:
      input.schemaGeneratorConfig ??
      existing?.schemaGeneratorConfig ??
      createDefaultSchemaGeneratorConfig(),
    categoryIds: input.categoryIds ?? existing?.categoryIds ?? [],
    tagIds: input.tagIds ?? existing?.tagIds ?? [],
    publishedAt: resolvePublishedAt(status, input.publishedAt, existing, now),
    createdAt: existing?.createdAt ?? now,
    updatedAt: input.lockModifiedDate && existing ? existing.updatedAt : now,
    lockModifiedDate: input.lockModifiedDate ?? existing?.lockModifiedDate ?? false,
  });
}

function countPostsInCategory(categoryId: string, posts: PostRecord[]): number {
  return posts.filter(
    (post) => post.status !== "trash" && post.categoryIds.includes(categoryId),
  ).length;
}

function countPostsWithTag(tagId: string, posts: PostRecord[]): number {
  return posts.filter(
    (post) => post.status !== "trash" && post.tagIds.includes(tagId),
  ).length;
}

async function withLocalStore<T>(
  fn: (store: PostsStore) => T | Promise<T>,
): Promise<T> {
  const store = await readPostsStore();
  const result = await fn(store);
  await writePostsStore(store);
  return result;
}

async function withLocalStoreRead<T>(fn: (store: PostsStore) => T): Promise<T> {
  const store = await readPostsStore();
  return fn(store);
}

// ─── Local store operations ───────────────────────────────────────────────────

async function listPostsLocal(): Promise<PostRecord[]> {
  const store = await readPostsStore();
  return store.posts.map(normalizePostRecord);
}

async function getPostByIdLocal(id: string): Promise<PostRecord | null> {
  const store = await readPostsStore();
  const post =
    store.posts.find((item) => item.id === id) ??
    store.posts.find((item) => String(item.numericId) === id) ??
    null;
  return post ? normalizePostRecord(post) : null;
}

async function getPostBySlugLocal(slug: string): Promise<PostRecord | null> {
  const store = await readPostsStore();
  const normalized = sanitizeSlug(slug);
  const post = store.posts.find((item) => item.slug === normalized) ?? null;
  return post ? normalizePostRecord(post) : null;
}

async function upsertPostLocal(input: UpsertPostInput): Promise<PostRecord> {
  return withLocalStore((store) => {
    const trimmedTitle = input.title.trim();

    if (!trimmedTitle) {
      throw new Error("Title is required.");
    }

    const id = input.id ?? createPostId();
    const existingIndex = store.posts.findIndex((post) => post.id === id);
    const existing = existingIndex >= 0 ? store.posts[existingIndex] : null;
    const slug = sanitizeSlug(input.slug?.trim() || input.permalink?.trim() || trimmedTitle);

    const duplicateSlug = store.posts.find(
      (post) => post.slug === slug && post.id !== id,
    );

    if (duplicateSlug) {
      throw new Error(`Slug "${slug}" is already in use.`);
    }

    const record = buildPostRecord(
      input,
      existing,
      existing?.numericId ?? nextNumericId(store.posts),
      id,
    );

    if (existingIndex >= 0) {
      store.posts[existingIndex] = record;
    } else {
      store.posts.push(record);
    }

    return record;
  });
}

async function updatePostFeaturedImageLocal(
  postId: string,
  featuredImageId: string | null,
): Promise<PostRecord | null> {
  return withLocalStore((store) => {
    const index = store.posts.findIndex(
      (post) => post.id === postId || String(post.numericId) === postId,
    );

    if (index < 0) {
      return null;
    }

    const now = new Date().toISOString();
    const updated = normalizePostRecord({
      ...store.posts[index],
      featuredImageId,
      updatedAt: now,
    });

    store.posts[index] = updated;
    return updated;
  });
}

async function updatePostFeaturedImageSupabase(
  postId: string,
  featuredImageId: string | null,
): Promise<PostRecord | null> {
  const existing = await getPostByIdSupabase(postId);

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();
  const client = createAdminClient();
  const { error } = await client
    .from("posts")
    .update({ featured_image_id: featuredImageId, updated_at: now })
    .eq("id", existing.id);

  if (error) {
    throw error;
  }

  return normalizePostRecord({
    ...existing,
    featuredImageId,
    updatedAt: now,
  });
}

async function bulkUpdatePostStatusLocal(
  ids: string[],
  status: PostStoreStatus,
): Promise<number> {
  return withLocalStore((store) => {
    const idSet = new Set(ids);
    let updated = 0;

    store.posts = store.posts.map((post) => {
      if (!idSet.has(post.id) && !idSet.has(String(post.numericId))) {
        return post;
      }

      updated += 1;
      return {
        ...post,
        status,
        updatedAt: new Date().toISOString(),
      };
    });

    return updated;
  });
}

async function deletePostsLocal(ids: string[]): Promise<number> {
  return withLocalStore((store) => {
    const idSet = new Set(ids);
    const before = store.posts.length;
    store.posts = store.posts.filter(
      (post) => !idSet.has(post.id) && !idSet.has(String(post.numericId)),
    );
    return before - store.posts.length;
  });
}

async function listCategoriesLocal(): Promise<PostCategoryRecord[]> {
  const store = await readPostsStore();
  return store.categories.sort((a, b) => a.name.localeCompare(b.name));
}

async function createCategoryLocal(input: CreateCategoryInput): Promise<PostCategoryRecord> {
  return withLocalStore((store) => {
    const trimmedName = input.name.trim();

    if (!trimmedName) {
      throw new Error("Category name is required.");
    }

    const slug = sanitizeSlug(input.slug?.trim() || trimmedName);
    const category: PostCategoryRecord = {
      id: createCategoryId(),
      name: trimmedName,
      slug,
      description: input.description?.trim() ?? "",
      parentId: input.parentId ?? null,
      icon: input.icon ?? null,
      createdAt: new Date().toISOString(),
    };

    store.categories.push(category);
    return category;
  });
}

async function deleteCategoriesLocal(ids: string[]): Promise<number> {
  return withLocalStore((store) => {
    const idSet = new Set(ids);
    const before = store.categories.length;

    store.categories = store.categories.filter((category) => !idSet.has(category.id));
    store.posts = store.posts.map((post) => ({
      ...post,
      categoryIds: post.categoryIds.filter((categoryId) => !idSet.has(categoryId)),
    }));

    return before - store.categories.length;
  });
}

async function listTagsLocal(): Promise<PostTagRecord[]> {
  const store = await readPostsStore();
  return store.tags.sort((a, b) => a.name.localeCompare(b.name));
}

async function createTagLocal(input: CreateTagInput): Promise<PostTagRecord> {
  return withLocalStore((store) => {
    const trimmedName = input.name.trim();

    if (!trimmedName) {
      throw new Error("Tag name is required.");
    }

    const slug = sanitizeSlug(input.slug?.trim() || trimmedName);
    const tag: PostTagRecord = {
      id: createTagId(),
      name: trimmedName,
      slug,
      description: input.description?.trim() ?? "",
      createdAt: new Date().toISOString(),
    };

    store.tags.push(tag);
    return tag;
  });
}

async function deleteTagsLocal(ids: string[]): Promise<number> {
  return withLocalStore((store) => {
    const idSet = new Set(ids);
    const before = store.tags.length;

    store.tags = store.tags.filter((tag) => !idSet.has(tag.id));
    store.posts = store.posts.map((post) => ({
      ...post,
      tagIds: post.tagIds.filter((tagId) => !idSet.has(tagId)),
    }));

    return before - store.tags.length;
  });
}

async function getStoreSnapshotLocal(): Promise<PostsStore> {
  return readPostsStore();
}

// ─── Supabase operations (future production) ──────────────────────────────────

type DbPostRow = {
  id: string;
  numeric_id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: PostStoreStatus;
  visibility: PostRecord["visibility"];
  password: string;
  stick_to_front_page: boolean;
  author: string;
  featured_image_id: string | null;
  seo_title: string;
  meta_description: string;
  permalink: string;
  schemas: PostRecord["schemas"];
  schema_generator_config: PostRecord["schemaGeneratorConfig"];
  category_ids: string[];
  tag_ids: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
  lock_modified_date: boolean;
};

function rowToPost(row: DbPostRow): PostRecord {
  return normalizePostRecord({
    id: row.id,
    numericId: row.numeric_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    status: row.status,
    visibility: row.visibility,
    password: row.password,
    stickToFrontPage: row.stick_to_front_page,
    author: row.author,
    featuredImageId: row.featured_image_id,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    permalink: row.permalink,
    schemas: row.schemas,
    schemaGeneratorConfig: row.schema_generator_config,
    categoryIds: row.category_ids ?? [],
    tagIds: row.tag_ids ?? [],
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lockModifiedDate: row.lock_modified_date,
  });
}

function postToRow(post: PostRecord): DbPostRow {
  return {
    id: post.id,
    numeric_id: post.numericId,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    status: post.status,
    visibility: post.visibility,
    password: post.password,
    stick_to_front_page: post.stickToFrontPage,
    author: post.author,
    featured_image_id: post.featuredImageId,
    seo_title: post.seoTitle,
    meta_description: post.metaDescription,
    permalink: post.permalink,
    schemas: post.schemas,
    schema_generator_config: post.schemaGeneratorConfig,
    category_ids: post.categoryIds,
    tag_ids: post.tagIds,
    published_at: post.publishedAt,
    created_at: post.createdAt,
    updated_at: post.updatedAt,
    lock_modified_date: post.lockModifiedDate,
  };
}

async function listPostsSupabase(): Promise<PostRecord[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as DbPostRow[]).map(rowToPost);
}

async function getPostByIdSupabase(id: string): Promise<PostRecord | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("posts")
    .select("*")
    .or(`id.eq.${id},numeric_id.eq.${Number.isNaN(Number(id)) ? -1 : id}`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? rowToPost(data as DbPostRow) : null;
}

async function getPostBySlugSupabase(slug: string): Promise<PostRecord | null> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("slug", sanitizeSlug(slug))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? rowToPost(data as DbPostRow) : null;
}

async function nextNumericIdSupabase(): Promise<number> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("posts")
    .select("numeric_id")
    .order("numeric_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.numeric_id ?? 1000) + 1;
}

async function assertSlugAvailableSupabase(
  slug: string,
  excludeId: string,
): Promise<void> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data && data.id !== excludeId) {
    throw new Error(`Slug "${slug}" is already in use.`);
  }
}

async function upsertPostSupabase(input: UpsertPostInput): Promise<PostRecord> {
  const existing = input.id ? await getPostByIdSupabase(input.id) : null;
  const resolvedId = input.id ?? existing?.id ?? createPostId();
  const trimmedTitle = input.title.trim();

  if (!trimmedTitle) {
    throw new Error("Title is required.");
  }

  const slug = sanitizeSlug(input.slug?.trim() || input.permalink?.trim() || trimmedTitle);
  await assertSlugAvailableSupabase(slug, resolvedId);

  const numericId = existing?.numericId ?? (await nextNumericIdSupabase());
  const record = buildPostRecord(input, existing, numericId, resolvedId);

  const client = createAdminClient();
  const { error } = await client.from("posts").upsert(postToRow(record));

  if (error) {
    throw error;
  }

  return record;
}

async function bulkUpdatePostStatusSupabase(
  ids: string[],
  status: PostStoreStatus,
): Promise<number> {
  const client = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await client
    .from("posts")
    .update({ status, updated_at: now })
    .in("id", ids)
    .select("id");

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
}

async function deletePostsSupabase(ids: string[]): Promise<number> {
  const client = createAdminClient();
  const { data, error } = await client.from("posts").delete().in("id", ids).select("id");

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
}

async function createCategorySupabase(
  input: CreateCategoryInput,
): Promise<PostCategoryRecord> {
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    throw new Error("Category name is required.");
  }

  const slug = sanitizeSlug(input.slug?.trim() || trimmedName);
  const category: PostCategoryRecord = {
    id: createCategoryId(),
    name: trimmedName,
    slug,
    description: input.description?.trim() ?? "",
    parentId: input.parentId ?? null,
    icon: input.icon ?? null,
    createdAt: new Date().toISOString(),
  };

  const client = createAdminClient();
  const { error } = await client.from("post_categories").upsert({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parent_id: category.parentId,
    icon: category.icon,
    created_at: category.createdAt,
  });

  if (error) {
    throw error;
  }

  return category;
}

async function deleteCategoriesSupabase(ids: string[]): Promise<number> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("post_categories")
    .delete()
    .in("id", ids)
    .select("id");

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
}

async function createTagSupabase(input: CreateTagInput): Promise<PostTagRecord> {
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    throw new Error("Tag name is required.");
  }

  const slug = sanitizeSlug(input.slug?.trim() || trimmedName);
  const tag: PostTagRecord = {
    id: createTagId(),
    name: trimmedName,
    slug,
    description: input.description?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  const client = createAdminClient();
  const { error } = await client.from("post_tags").upsert({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    created_at: tag.createdAt,
  });

  if (error) {
    throw error;
  }

  return tag;
}

async function deleteTagsSupabase(ids: string[]): Promise<number> {
  const client = createAdminClient();
  const { data, error } = await client.from("post_tags").delete().in("id", ids).select("id");

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
}

// ─── Public API ────────────────────────────────────────────────────────────────

function shouldUseLocalStore(): boolean {
  return !hasAdminClient() && canUseLocalFileStore();
}

function assertPostsStorageConfigured(): void {
  if (!hasAdminClient() && !canUseLocalFileStore()) {
    throw new Error(SUPABASE_REQUIRED_MESSAGE);
  }
}

function isMissingPostsTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { code?: string; message?: string };
  return (
    candidate.code === "PGRST205" ||
    Boolean(candidate.message?.includes("Could not find the table 'public.posts'")) ||
    Boolean(candidate.message?.includes("Could not find the table 'public.post_categories'")) ||
    Boolean(candidate.message?.includes("Could not find the table 'public.post_tags'"))
  );
}

async function withPostsStoreFallback<T>(
  supabaseFn: () => Promise<T>,
  localFn: () => Promise<T>,
): Promise<T> {
  assertPostsStorageConfigured();

  if (shouldUseLocalStore()) {
    return localFn();
  }

  try {
    return await supabaseFn();
  } catch (error) {
    if (isMissingPostsTableError(error)) {
      throw new Error(MISSING_POSTS_TABLES_MESSAGE);
    }

    throw error;
  }
}

export async function listPosts(): Promise<PostRecord[]> {
  return withPostsStoreFallback(listPostsSupabase, listPostsLocal);
}

export async function getPostById(id: string): Promise<PostRecord | null> {
  return withPostsStoreFallback(
    () => getPostByIdSupabase(id),
    () => getPostByIdLocal(id),
  );
}

export async function getPostBySlug(slug: string): Promise<PostRecord | null> {
  return withPostsStoreFallback(
    () => getPostBySlugSupabase(slug),
    () => getPostBySlugLocal(slug),
  );
}

export async function upsertPost(input: UpsertPostInput): Promise<PostRecord> {
  return withPostsStoreFallback(
    () => upsertPostSupabase(input),
    () => upsertPostLocal(input),
  );
}

export async function updatePostFeaturedImage(
  postId: string,
  featuredImageId: string | null,
): Promise<PostRecord | null> {
  return withPostsStoreFallback(
    () => updatePostFeaturedImageSupabase(postId, featuredImageId),
    () => updatePostFeaturedImageLocal(postId, featuredImageId),
  );
}

export async function bulkUpdatePostStatus(
  ids: string[],
  status: PostStoreStatus,
): Promise<number> {
  return withPostsStoreFallback(
    () => bulkUpdatePostStatusSupabase(ids, status),
    () => bulkUpdatePostStatusLocal(ids, status),
  );
}

export async function deletePostsPermanently(ids: string[]): Promise<number> {
  return withPostsStoreFallback(
    () => deletePostsSupabase(ids),
    () => deletePostsLocal(ids),
  );
}

async function listCategoriesSupabase(): Promise<PostCategoryRecord[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from("post_categories")
    .select("*")
    .order("name");

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? "",
    parentId: (row.parent_id as string | null) ?? null,
    icon: (row.icon as string | null) ?? null,
    createdAt: row.created_at as string,
  }));
}

export async function listCategories(): Promise<PostCategoryRecord[]> {
  return withPostsStoreFallback(listCategoriesSupabase, listCategoriesLocal);
}

export async function createCategory(input: CreateCategoryInput): Promise<PostCategoryRecord> {
  return withPostsStoreFallback(
    () => createCategorySupabase(input),
    () => createCategoryLocal(input),
  );
}

export async function deleteCategories(ids: string[]): Promise<number> {
  return withPostsStoreFallback(
    () => deleteCategoriesSupabase(ids),
    () => deleteCategoriesLocal(ids),
  );
}

async function listTagsSupabase(): Promise<PostTagRecord[]> {
  const client = createAdminClient();
  const { data, error } = await client.from("post_tags").select("*").order("name");

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: (row.description as string) ?? "",
    createdAt: row.created_at as string,
  }));
}

export async function listTags(): Promise<PostTagRecord[]> {
  return withPostsStoreFallback(listTagsSupabase, listTagsLocal);
}

export async function createTag(input: CreateTagInput): Promise<PostTagRecord> {
  return withPostsStoreFallback(
    () => createTagSupabase(input),
    () => createTagLocal(input),
  );
}

export async function deleteTags(ids: string[]): Promise<number> {
  return withPostsStoreFallback(
    () => deleteTagsSupabase(ids),
    () => deleteTagsLocal(ids),
  );
}

export async function listPublishedPublicPosts(): Promise<PostRecord[]> {
  const now = Date.now();
  const posts = await listPosts();

  return posts
    .filter((post) => {
      if (post.status !== "published" && post.status !== "scheduled") {
        return false;
      }

      if (post.visibility !== "public") {
        return false;
      }

      if (post.publishedAt && new Date(post.publishedAt).getTime() > now) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      if (left.stickToFrontPage !== right.stickToFrontPage) {
        return left.stickToFrontPage ? -1 : 1;
      }

      const leftDate = new Date(left.publishedAt ?? left.createdAt).getTime();
      const rightDate = new Date(right.publishedAt ?? right.createdAt).getTime();
      return rightDate - leftDate;
    });
}

export async function getPublicPostBySlug(slug: string): Promise<PostRecord | null> {
  const post = await getPostBySlug(slug);

  if (!post || post.status === "trash" || post.status === "draft") {
    return null;
  }

  if (post.status === "scheduled") {
    const publishTime = post.publishedAt ? new Date(post.publishedAt).getTime() : 0;

    if (publishTime > Date.now()) {
      return null;
    }
  }

  return post;
}

export function countCategoryPosts(
  categoryId: string,
  posts: PostRecord[],
): number {
  return countPostsInCategory(categoryId, posts);
}

export function countTagPosts(tagId: string, posts: PostRecord[]): number {
  return countPostsWithTag(tagId, posts);
}

export async function getPostsStoreSnapshot(): Promise<PostsStore> {
  return getStoreSnapshotLocal();
}

export async function withLocalStoreReadonly<T>(
  fn: (store: PostsStore) => T,
): Promise<T> {
  return withLocalStoreRead(fn);
}
