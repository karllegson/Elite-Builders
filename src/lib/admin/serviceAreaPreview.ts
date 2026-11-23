import type { ServiceAreaRecord } from "@/lib/admin/serviceAreasData";

/**
 * The service-area editor's Preview button: the editor writes what's on screen
 * (saved or not, draft or published) here, then opens SERVICE_AREA_PREVIEW_PATH,
 * which renders it with the real public page layout. Nothing is saved to the store.
 */
export const SERVICE_AREA_PREVIEW_PATH = "/preview/service-area";

const SERVICE_AREA_PREVIEW_STORAGE_KEY = "elite-builders-service-area-preview";

export type ServiceAreaPreviewPayload = {
  record: ServiceAreaRecord;
  /** Parent city when the page is a sub-page. */
  parent: ServiceAreaRecord | null;
  savedAt: string;
};

export function writeServiceAreaPreview(payload: ServiceAreaPreviewPayload): void {
  window.localStorage.setItem(SERVICE_AREA_PREVIEW_STORAGE_KEY, JSON.stringify(payload));
}

/** Raw stored preview, or null. A string, so it's a stable useSyncExternalStore snapshot. */
export function getServiceAreaPreviewSnapshot(): string | null {
  try {
    return window.localStorage.getItem(SERVICE_AREA_PREVIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function parseServiceAreaPreview(raw: string | null): ServiceAreaPreviewPayload | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ServiceAreaPreviewPayload>;
    if (!parsed.record || typeof parsed.record !== "object") return null;

    return {
      record: parsed.record,
      parent: parsed.parent ?? null,
      savedAt: parsed.savedAt ?? "",
    };
  } catch {
    return null;
  }
}

/** Calls `onChange` when the editor (in another tab) writes a new preview. */
export function subscribeServiceAreaPreview(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SERVICE_AREA_PREVIEW_STORAGE_KEY) onChange();
  };

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}
