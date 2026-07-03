import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  assertCanUseLocalFileStore,
  canUseLocalFileStore,
} from "@/lib/admin/localFileStore";
import type { PostsStore } from "@/lib/admin/posts.types";

export const POSTS_LOCAL_FILE = path.join(process.cwd(), "data", "posts.local.json");

function createEmptyStore(): PostsStore {
  return {
    version: 1,
    posts: [],
    categories: [],
    tags: [],
  };
}

export async function readPostsStore(): Promise<PostsStore> {
  try {
    const raw = await readFile(POSTS_LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as PostsStore;

    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.posts) ||
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.tags)
    ) {
      return createEmptyStore();
    }

    return parsed;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      const empty = createEmptyStore();
      if (canUseLocalFileStore()) {
        await writePostsStore(empty);
      }
      return empty;
    }

    return createEmptyStore();
  }
}

export async function writePostsStore(store: PostsStore): Promise<void> {
  assertCanUseLocalFileStore();
  await mkdir(path.dirname(POSTS_LOCAL_FILE), { recursive: true });
  await writeFile(POSTS_LOCAL_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
