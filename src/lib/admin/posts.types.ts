import type { SchemaGeneratorConfig } from "@/lib/admin/postSchemaGenerator";
import type { SchemaItem } from "@/lib/admin/postSeo";

export type PostStoreStatus = "draft" | "published" | "scheduled" | "trash";

export type PostVisibility = "public" | "password" | "private";

export type PostCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  icon: string | null;
  createdAt: string;
};

export type PostTagRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type PostRecord = {
  id: string;
  numericId: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: PostStoreStatus;
  visibility: PostVisibility;
  password: string;
  stickToFrontPage: boolean;
  author: string;
  featuredImageId: string | null;
  seoTitle: string;
  metaDescription: string;
  permalink: string;
  schemas: SchemaItem[];
  schemaGeneratorConfig: SchemaGeneratorConfig;
  categoryIds: string[];
  tagIds: string[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lockModifiedDate: boolean;
};

export type PostsStore = {
  version: 1;
  posts: PostRecord[];
  categories: PostCategoryRecord[];
  tags: PostTagRecord[];
};

export type UpsertPostInput = {
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: PostStoreStatus;
  visibility?: PostVisibility;
  password?: string;
  stickToFrontPage?: boolean;
  featuredImageId?: string | null;
  seoTitle?: string;
  metaDescription?: string;
  permalink?: string;
  schemas?: SchemaItem[];
  schemaGeneratorConfig?: SchemaGeneratorConfig;
  categoryIds?: string[];
  tagIds?: string[];
  publishedAt?: string | null;
  lockModifiedDate?: boolean;
};

export type CreateCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  icon?: string | null;
};

export type CreateTagInput = {
  name: string;
  slug?: string;
  description?: string;
};
