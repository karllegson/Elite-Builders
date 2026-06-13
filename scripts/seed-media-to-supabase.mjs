import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(filename) {
  const path = join(root, filename);

  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const MEDIA_BUCKET = "media";

const homeImages = {
  residentialRoofFraming: {
    file: "modesto-residential-roof-framing.png",
    alt: "Residential roof framing contractor leveling rafters in Modesto California",
  },
  customKitchenRemodel: {
    file: "modesto-custom-kitchen-remodel.png",
    alt: "Custom kitchen cabinet installation during a Modesto home remodel",
  },
  commercialRoofFramingAerial: {
    file: "modesto-commercial-roof-framing-aerial.png",
    alt: "Aerial view of commercial roof framing on a Central Valley construction site",
  },
  framingContractorPlanning: {
    file: "modesto-framing-contractor-planning.png",
    alt: "Framing contractor reviewing blueprints on a Modesto construction project",
  },
  customHomeFramingCrew: {
    file: "modesto-custom-home-framing-crew.png",
    alt: "Elite Builders framing crew building a custom home in Northern California",
  },
  patioDoorsOutdoorLiving: {
    file: "modesto-patio-doors-outdoor-living.png",
    alt: "Patio doors and outdoor living space installation in Modesto California",
  },
  residentialWindowInstallation: {
    file: "modesto-residential-window-installation.png",
    alt: "Residential window and door installation on a new Modesto home build",
  },
  luxuryHomeInterior: {
    file: "modesto-luxury-home-interior.png",
    alt: "Finished luxury home interior with floor-to-ceiling windows in the Central Valley",
  },
  bayAreaNorthBayService: {
    file: "bay-area-north-bay-service-area.jpg",
    alt: "San Francisco Bay Area and North Bay communities served by Elite Builders framing contractor",
  },
  residentialWallFramingSky: {
    file: "modesto-residential-wall-framing-sky.webp",
    alt: "Residential wall framing against a clear blue sky on a Northern California new home build",
  },
  customHomeFramingInterior: {
    file: "modesto-custom-home-framing-interior.webp",
    alt: "Interior custom home framing contractor wall studs and joists in Modesto California",
  },
  twoStoryHomeFramingExterior: {
    file: "modesto-two-story-home-framing-exterior.webp",
    alt: "Two-story residential home framing contractor project in Modesto California",
  },
};

function mimeTypeForFile(filename) {
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".png")) return "image/png";
  return "image/jpeg";
}

async function seedHomeImage(sourceKey, image) {
  const localPath = join(root, "public/images/home", image.file);
  const storagePath = `content/home/${image.file}`;
  const fileBuffer = readFileSync(localPath);
  const mimeType = mimeTypeForFile(image.file);

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`${sourceKey}: ${uploadError.message}`);
  }

  const title = image.file
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const { error: dbError } = await supabase.from("media_assets").upsert(
    {
      storage_path: storagePath,
      filename: image.file,
      title,
      alt: image.alt,
      caption: "",
      description: title,
      mime_type: mimeType,
      file_size: fileBuffer.byteLength,
      source_key: sourceKey,
    },
    { onConflict: "source_key" },
  );

  if (dbError) {
    throw new Error(`${sourceKey}: ${dbError.message}`);
  }

  console.log(`Uploaded ${sourceKey} -> ${storagePath}`);
}

console.log("Seeding homepage content images to Supabase Storage...");

for (const [sourceKey, image] of Object.entries(homeImages)) {
  await seedHomeImage(sourceKey, image);
}

console.log("Done. Logo/favicon were not uploaded (they stay in public/).");
