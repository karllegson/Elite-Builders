import type { PostCategoryRecord, PostRecord, PostTagRecord } from "@/lib/admin/posts.types";
import type { PostListItem } from "@/lib/admin/postsList";

function countLinks(content: string) {
  const internalLinks = (content.match(/href=["']\/[^"']*["']/gi) ?? []).length;
  const externalLinks = (content.match(/href=["']https?:\/\//gi) ?? []).length;

  return {
    internalLinks,
    externalLinks,
    backlinks: 0,
  };
}

function mapListStatus(
  status: PostRecord["status"],
): PostListItem["status"] {
  if (status === "scheduled") {
    return "scheduled";
  }

  if (status === "trash") {
    return "trash";
  }

  if (status === "published") {
    return "published";
  }

  return "draft";
}

export function toPostListItem(
  post: PostRecord,
  categories: PostCategoryRecord[],
  tags: PostTagRecord[],
  currentAuthor?: string,
): PostListItem {
  const categoryNames = post.categoryIds
    .map((id) => categories.find((category) => category.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const tagNames = post.tagIds
    .map((id) => tags.find((tag) => tag.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const links = countLinks(post.content);
  const schemaTypes = post.schemas.map((schema) => schema.type).join(", ") || "None";

  return {
    id: post.id,
    numericId: post.numericId,
    title: post.title,
    status: mapListStatus(post.status),
    author: post.author,
    isMine: currentAuthor ? post.author === currentAuthor : true,
    categories: categoryNames,
    tags: tagNames,
    date: new Date(
      post.status === "published" || post.status === "scheduled"
        ? (post.publishedAt ?? post.updatedAt)
        : post.updatedAt,
    ),
    dateType:
      post.status === "published" || post.status === "scheduled"
        ? "published"
        : "modified",
    seoKeyword: post.seoTitle || null,
    seoSchema: schemaTypes,
    internalLinks: links.internalLinks,
    externalLinks: links.externalLinks,
    backlinks: links.backlinks,
    isPillar: post.stickToFrontPage,
  };
}

export function toPostListItems(
  posts: PostRecord[],
  categories: PostCategoryRecord[],
  tags: PostTagRecord[],
  currentAuthor?: string,
): PostListItem[] {
  return posts
    .map((post) => toPostListItem(post, categories, tags, currentAuthor))
    .sort((left, right) => right.date.getTime() - left.date.getTime());
}
