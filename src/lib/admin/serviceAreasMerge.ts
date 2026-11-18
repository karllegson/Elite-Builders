import type { ServiceAreaRecord, ServiceAreasStore } from "@/lib/admin/serviceAreasData";

function time(value: string | undefined | null): number {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Merges a browser's copy of the service-area pages into the server copy, page by page,
 * so an admin tab opened earlier can't undo newer work saved by someone else (or a script).
 *
 * - Page in both copies: the one edited most recently wins.
 * - Page only on the server: kept if it changed after this browser last loaded the pages
 *   (someone else created or edited it); otherwise this browser deleted it.
 * - Page only in the browser: kept if the browser created or edited it after loading;
 *   otherwise someone else deleted it on the server.
 * Without `syncedAt` (older browser copies) nothing is ever dropped.
 */
export function mergeServiceAreasStores(
  server: ServiceAreasStore,
  incoming: ServiceAreasStore,
): ServiceAreasStore {
  const syncedAt = time(incoming.syncedAt);
  const serverById = new Map(server.areas.map((area) => [area.id, area]));
  const incomingIds = new Set(incoming.areas.map((area) => area.id));
  const areas: ServiceAreaRecord[] = [];

  for (const area of incoming.areas) {
    const onServer = serverById.get(area.id);
    if (onServer) {
      areas.push(time(onServer.updatedAt) > time(area.updatedAt) ? onServer : area);
    } else if (!syncedAt || time(area.updatedAt) > syncedAt) {
      areas.push(area);
    }
  }

  for (const area of server.areas) {
    if (!incomingIds.has(area.id) && (!syncedAt || time(area.updatedAt) > syncedAt)) {
      areas.push(area);
    }
  }

  return {
    version: 1,
    areas,
    sectionOrder: incoming.sectionOrder,
    customSections: incoming.customSections,
  };
}
