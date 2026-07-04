import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  createDefaultServicePagesStore,
  normalizeServicePageRecord,
  type ServicePagesStore,
} from "@/lib/admin/servicesData";

export const SERVICE_PAGES_LOCAL_FILE = path.join(
  process.cwd(),
  "data",
  "service-pages.local.json",
);

export async function readServicePagesStoreFromDisk(): Promise<ServicePagesStore> {
  try {
    const raw = await readFile(SERVICE_PAGES_LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as ServicePagesStore;

    if (parsed.version !== 3 || !Array.isArray(parsed.pages)) {
      return createDefaultServicePagesStore();
    }

    return {
      version: 3,
      pages: parsed.pages.map((page) => normalizeServicePageRecord(page)),
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return createDefaultServicePagesStore();
    }

    return createDefaultServicePagesStore();
  }
}

export async function writeServicePagesStoreToDisk(store: ServicePagesStore): Promise<void> {
  await mkdir(path.dirname(SERVICE_PAGES_LOCAL_FILE), { recursive: true });
  await writeFile(
    SERVICE_PAGES_LOCAL_FILE,
    `${JSON.stringify(store, null, 2)}\n`,
    "utf8",
  );
}
