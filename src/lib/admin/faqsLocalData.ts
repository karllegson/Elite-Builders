import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createDefaultStore,
  normalizeFaqsStore,
  type FaqsStore,
} from "@/lib/admin/faqsData";

export const FAQS_LOCAL_FILE = path.join(process.cwd(), "data", "faqs.local.json");

export async function readFaqsStoreFromDisk(): Promise<FaqsStore> {
  try {
    const raw = await readFile(FAQS_LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as FaqsStore;

    if (
      parsed.version !== 1 ||
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.faqs)
    ) {
      return createDefaultStore();
    }

    return normalizeFaqsStore(parsed);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      const seeded = createDefaultStore();
      await writeFaqsStoreToDisk(seeded);
      return seeded;
    }

    return createDefaultStore();
  }
}

export async function writeFaqsStoreToDisk(store: FaqsStore): Promise<void> {
  await mkdir(path.dirname(FAQS_LOCAL_FILE), { recursive: true });
  await writeFile(FAQS_LOCAL_FILE, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}
