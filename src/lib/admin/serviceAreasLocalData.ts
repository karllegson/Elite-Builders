import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertCanUseLocalFileStore } from "@/lib/admin/localFileStore";
import {
  createDefaultStore,
  normalizeServiceAreaRecord,
  type ServiceAreasStore,
} from "@/lib/admin/serviceAreasData";

export const SERVICE_AREAS_LOCAL_FILE = path.join(
  process.cwd(),
  "data",
  "service-areas.local.json",
);

export async function readServiceAreasStoreFromDisk(): Promise<ServiceAreasStore> {
  try {
    const raw = await readFile(SERVICE_AREAS_LOCAL_FILE, "utf8");
    const parsed = JSON.parse(raw) as ServiceAreasStore;

    if (parsed.version !== 1 || !Array.isArray(parsed.areas)) {
      return createDefaultStore();
    }

    return {
      version: 1,
      areas: parsed.areas.map(normalizeServiceAreaRecord),
      sectionOrder: parsed.sectionOrder ?? [],
      customSections: parsed.customSections ?? [],
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return createDefaultStore();
    }

    return createDefaultStore();
  }
}

export async function writeServiceAreasStoreToDisk(
  store: ServiceAreasStore,
): Promise<void> {
  assertCanUseLocalFileStore();
  await mkdir(path.dirname(SERVICE_AREAS_LOCAL_FILE), { recursive: true });
  await writeFile(
    SERVICE_AREAS_LOCAL_FILE,
    `${JSON.stringify(store, null, 2)}\n`,
    "utf8",
  );
}
