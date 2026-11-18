/**
 * Adds a typed <hr> before every section heading (except the first) on all
 * Elite-format city / service pages. Section lines stopped being automatic on
 * 2026-11-17, so pages saved before then need the <hr> in their content.
 *
 *   npx tsx scripts/add-section-hr.ts            dry run: backup + list of changes only
 *   npx tsx scripts/add-section-hr.ts --apply    saves the pages
 *
 * Every run first saves a full backup to .backups/. --apply refuses to write if
 * the store changed since the run started. Close every /admin tab before --apply:
 * the admin keeps a browser copy of the pages and syncs it back when it loads.
 * Safe to run twice: pages that already have their lines are left alone.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { addMissingSectionRules, findSectionsMissingRule, isEbContent } from "../src/lib/site/ebContent";

type Area = {
  id: string;
  slug: string;
  title: string;
  parentId: string | null;
  status: string;
  content: string;
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
  const backupPath = `${ROOT}.backups/service_areas_store-${stamp}${apply ? "-before-hr" : ""}.json`;
  writeFileSync(backupPath, JSON.stringify([row], null, 2));
  console.log(`Backup saved: ${backupPath}`);

  const runStartedAt = new Date().toISOString();
  const byId = new Map(row.payload.areas.map((area) => [area.id, area]));
  let changed = 0;

  const nextAreas = row.payload.areas.map((area) => {
    if (!area.content.trim() || !isEbContent(area.content)) {
      return area;
    }

    const missing = findSectionsMissingRule(area.content);
    const parent = area.parentId ? byId.get(area.parentId) : null;
    const label = `${parent ? `${parent.slug}/` : ""}${area.slug}${area.status !== "published" ? ` (${area.status})` : ""}`;

    if (missing.length === 0) {
      console.log(`  ok        ${label}`);
      return area;
    }

    changed += 1;
    console.log(`  + ${missing.length} <hr>  ${label}`);
    // Bump updatedAt so the admin's browser copy pulls these pages instead of pushing its old copy back.
    return { ...area, content: addMissingSectionRules(area.content), updatedAt: runStartedAt };
  });

  console.log(`\n${changed} page(s) need lines added.`);

  if (!apply) {
    console.log("Dry run only. Nothing was saved. Re-run with --apply to save.");
    return;
  }

  if (changed === 0) {
    console.log("Nothing to save.");
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
