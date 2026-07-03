import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadEnv() {
  try {
    const raw = readFileSync(".env.local", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq);
      const value = trimmed.slice(eq + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnv();

const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from("posts")
  .select("slug,title,content,excerpt,featured_image_id,visibility,status")
  .eq("slug", "testtt")
  .maybeSingle();

if (error) {
  console.error("Supabase error:", error);
  process.exit(1);
}

console.log(JSON.stringify(data, null, 2));
