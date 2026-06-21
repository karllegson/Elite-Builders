"use client";

import {
  fetchServiceAreasStoreAction,
  syncServiceAreasStoreAction,
} from "@/app/admin/(shell)/service-areas/actions";
import type { ServiceAreaRecord, ServiceAreasStore } from "@/lib/admin/serviceAreasData";

function maxUpdatedAt(areas: ServiceAreaRecord[]): number {
  return areas.reduce((max, area) => {
    const value = Date.parse(area.updatedAt ?? "");
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);
}

function storeHasCustomEdits(store: ServiceAreasStore): boolean {
  return store.areas.some(
    (area) =>
      area.content.trim().length > 0 ||
      area.mapEmbed.trim().length > 0 ||
      Boolean(area.featuredImage) ||
      area.metaDescription.trim().length > 0 ||
      area.seoTitle.trim() !== area.title.trim(),
  );
}

export function syncServiceAreasStoreToServer(store: ServiceAreasStore): void {
  void syncServiceAreasStoreAction(store).catch(() => {
    // Ignore sync failures (e.g. missing migration or offline dev).
  });
}

/** Pull live/remote store into localStorage, or push local edits up when remote is empty. */
export async function ensureServiceAreasStoreReady(): Promise<void> {
  const { readServiceAreasStore, writeServiceAreasStore } = await import(
    "@/lib/admin/serviceAreasData"
  );

  const local = readServiceAreasStore();
  const remote = await fetchServiceAreasStoreAction();

  if (remote && remote.areas.length > 0) {
    const remoteIsNewer = maxUpdatedAt(remote.areas) > maxUpdatedAt(local.areas);
    const remoteHasEdits = storeHasCustomEdits(remote);
    const localHasEdits = storeHasCustomEdits(local);

    if (remoteIsNewer || (remoteHasEdits && !localHasEdits)) {
      writeServiceAreasStore(remote, { skipSync: true });
      return;
    }
  }

  if (storeHasCustomEdits(local) || local.areas.some((area) => area.status === "published")) {
    syncServiceAreasStoreToServer(local);
  }
}

/** @deprecated Use ensureServiceAreasStoreReady */
export async function ensureServiceAreasSyncedToServer(): Promise<void> {
  await ensureServiceAreasStoreReady();
}
