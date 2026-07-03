"use client";

import {
  fetchServicePagesStoreAction,
  syncServicePagesStoreAction,
} from "@/app/admin/(shell)/services/actions";
import type { ServicePageRecord, ServicePagesStore } from "@/lib/admin/servicesData";

function maxUpdatedAt(pages: ServicePageRecord[]): number {
  return pages.reduce((max, page) => {
    const value = Date.parse(page.updatedAt ?? "");
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 0);
}

function storeHasCustomEdits(store: ServicePagesStore): boolean {
  return store.pages.some(
    (page) =>
      page.intro.some((paragraph) => paragraph.trim().length > 0) ||
      page.metaDescription.trim().length > 0 ||
      page.h1.trim().length > 0,
  );
}

export function syncServicePagesStoreToServer(store: ServicePagesStore): void {
  void syncServicePagesStoreAction(store).catch(() => {
    // Ignore sync failures (e.g. offline dev).
  });
}

export async function ensureServicePagesStoreReady(): Promise<void> {
  const { readServicePagesStore, writeServicePagesStore } = await import(
    "@/lib/admin/servicesData"
  );

  const local = readServicePagesStore();
  const remote = await fetchServicePagesStoreAction();

  if (remote && remote.pages.length > 0) {
    const remoteIsNewer = maxUpdatedAt(remote.pages) > maxUpdatedAt(local.pages);
    const remoteHasEdits = storeHasCustomEdits(remote);
    const localHasEdits = storeHasCustomEdits(local);

    if (remoteIsNewer || (remoteHasEdits && !localHasEdits)) {
      writeServicePagesStore(remote, { skipSync: true });
      return;
    }
  }

  if (storeHasCustomEdits(local) || local.pages.some((page) => page.status === "published")) {
    syncServicePagesStoreToServer(local);
  }
}
