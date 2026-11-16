/**
 * Converts every old-format city / service page in the service-areas store to
 * the Elite format.
 *
 *   npx tsx scripts/convert-to-eb.ts            dry run: backup + preview file only
 *   npx tsx scripts/convert-to-eb.ts --apply    saves the converted pages
 *
 * Every run first saves a full backup to .backups/. --apply refuses to write if
 * the store changed since the run started (someone saved a page meanwhile).
 * Close every /admin tab before --apply: the admin keeps a browser copy of the
 * pages and syncs it back to the server when it loads.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { convertLegacyToEb } from "../src/lib/site/ebConvert";
import { isEbContent } from "../src/lib/site/ebContent";

type Area = {
  id: string;
  slug: string;
  title: string;
  city: string;
  stateCode: string;
  parentId: string | null;
  status: string;
  content: string;
  mapEmbed: string;
  featuredImage: { src: string; alt?: string } | null;
  updatedAt: string;
};
type StoreRow = { id: string; version: number; payload: { areas: Area[] } & Record<string, unknown>; updated_at: string };

// Run from the project root.
const ROOT = `${process.cwd()}/`;
const apply = process.argv.includes("--apply");

const env = Object.fromEntries(
  readFileSync(`${ROOT}.env.local`, "utf8")
    .split("\n")
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/g, "")];
    }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

async function loadRow(): Promise<StoreRow> {
  const res = await fetch(`${url}/rest/v1/service_areas_store?id=eq.default&select=*`, { headers });
  if (!res.ok) throw new Error(`Load failed: HTTP ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as StoreRow[];
  if (rows.length !== 1) throw new Error(`Expected 1 store row, got ${rows.length}`);
  return rows[0];
}

async function main() {
  const row = await loadRow();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync(`${ROOT}.backups`, { recursive: true });
  const backupPath = `${ROOT}.backups/service_areas_store-${stamp}${apply ? "-before-apply" : ""}.json`;
  writeFileSync(backupPath, JSON.stringify([row], null, 2));
  console.log(`Backup saved: ${backupPath}`);

  const runStartedAt = new Date().toISOString();
  const areas = row.payload.areas;
  const byId = new Map(areas.map((area) => [area.id, area]));
  const preview: Record<string, {
      label: string;
      title: string;
      eyebrow: string;
      featuredImage: string | null;
      before: string;
      after: string;
      mapEmbed: string;
    }> = {};
  let converted = 0;

  const nextAreas = areas.map((area) => {
    if (!area.content.trim() || isEbContent(area.content)) {
      return area;
    }

    const parent = area.parentId ? byId.get(area.parentId) : null;
    const placeArea = parent ?? area;
    const isServicePage = !area.parentId && !area.city?.trim();
    const mapPlace =
      area.mapEmbed.trim() && placeArea.city?.trim() && !isServicePage
        ? `${placeArea.city}, ${placeArea.stateCode || "CA"}`
        : null;

    const after = convertLegacyToEb(area.content, { mapPlace });
    converted += 1;
    const label = `${parent ? `${parent.slug}/` : ""}${area.slug}${area.status !== "published" ? ` (${area.status})` : ""}`;
    preview[label] = {
      label,
      title: area.title,
      eyebrow: parent ? parent.title : isServicePage ? "Our Services" : "Service Area",
      featuredImage: area.featuredImage?.src ?? null,
      before: area.content,
      after,
      mapEmbed: area.mapEmbed,
    };
    console.log(`  converted: ${label}  (${area.content.length} → ${after.length} chars)`);
    // Bump updatedAt so the admin's browser copy sees the server as newer and
    // pulls these pages instead of pushing its old copy back.
    return { ...area, content: after, updatedAt: runStartedAt };
  });

  const previewPath = `${ROOT}src/app/(site)/eb-preview/converted.json`;
  writeFileSync(previewPath, JSON.stringify(preview, null, 2));
  console.log(`\n${converted} page(s) converted. Preview data: ${previewPath}`);

  if (!apply) {
    console.log("Dry run only. Nothing was saved. Re-run with --apply to save.");
    return;
  }

  const latest = await loadRow();
  if (latest.updated_at !== row.updated_at) {
    throw new Error("The pages changed while this ran. Nothing saved. Run again.");
  }

  const res = await fetch(`${url}/rest/v1/service_areas_store?id=eq.default`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      payload: { ...row.payload, areas: nextAreas },
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`Save failed: HTTP ${res.status} ${await res.text()}`);
  console.log("Saved. To undo, restore the payload from the backup file above.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
