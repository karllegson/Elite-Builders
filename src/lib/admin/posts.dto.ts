import type { SchemaGeneratorConfig } from "@/lib/admin/postSchemaGenerator";
import type { SchemaItem } from "@/lib/admin/postSeo";
import type {
  PostCategoryRecord,
  PostRecord,
  PostStoreStatus,
  PostTagRecord,
  PostVisibility,
} from "@/lib/admin/posts.types";

export type PostRecordDTO = {
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

export type PostCategoryDTO = PostCategoryRecord;
export type PostTagDTO = PostTagRecord;

export function toPostDTO(post: PostRecord): PostRecordDTO {
  return { ...post };
}

export function toCategoryDTO(category: PostCategoryRecord): PostCategoryDTO {
  return { ...category };
}

export function toTagDTO(tag: PostTagRecord): PostTagDTO {
  return { ...tag };
}

export type SavePostPayload = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStoreStatus;
  visibility: PostVisibility;
  password: string;
  stickToFrontPage: boolean;
  featuredImageId: string | null;
  seoTitle: string;
  metaDescription: string;
  permalink: string;
  schemas: SchemaItem[];
  schemaGeneratorConfig: SchemaGeneratorConfig;
  categoryIds: string[];
  tagIds: string[];
  publishedAt: string | null;
  lockModifiedDate: boolean;
};
