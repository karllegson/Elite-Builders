import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertCanUseLocalFileStore } from "@/lib/admin/localFileStore";
import {
  createDefaultShowcaseStore,
  normalizeShowcaseStore,
  type ShowcaseStore,
} from "@/lib/admin/showcaseData";

export const SHOWCASE_LOCAL_FILE = path.join(process.cwd(), "data", "showcase.local.json");

export async function readShowcaseStoreFromDisk(): Promise<ShowcaseStore> {
  try {
    const raw = await readFile(SHOWCASE_LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as ShowcaseStore;

    if (parsed.version !== 1 || !Array.isArray(parsed.projects)) {
      return createDefaultShowcaseStore();
    }

    return normalizeShowcaseStore(parsed);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return createDefaultShowcaseStore();
    }

    return createDefaultShowcaseStore();
  }
}

export async function writeShowcaseStoreToDisk(store: ShowcaseStore): Promise<void> {
  assertCanUseLocalFileStore();
  await mkdir(path.dirname(SHOWCASE_LOCAL_FILE), { recursive: true });
  await writeFile(SHOWCASE_LOCAL_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
