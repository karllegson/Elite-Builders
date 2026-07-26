import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

type SaveBody = {
  id?: string;
  imageObjectPosition?: string;
  imageScale?: number;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function upsertCropInMemberBlock(block: string, position: string, scale: number): string {
  let next = block;

  if (/imageObjectPosition\s*:/.test(next)) {
    next = next.replace(
      /imageObjectPosition\s*:\s*"[^"]*"/,
      `imageObjectPosition: "${position}"`,
    );
  } else if (/imageSrc\s*:/.test(next)) {
    next = next.replace(
      /(imageSrc\s*:\s*"[^"]*",)/,
      `$1\n    imageObjectPosition: "${position}",`,
    );
  } else {
    next = next.replace(
      /(id\s*:\s*"[^"]*",)/,
      `$1\n    imageObjectPosition: "${position}",`,
    );
  }

  if (/imageScale\s*:/.test(next)) {
    next = next.replace(/imageScale\s*:\s*[\d.]+/, `imageScale: ${scale}`);
  } else if (/imageObjectPosition\s*:/.test(next)) {
    next = next.replace(
      /(imageObjectPosition\s*:\s*"[^"]*",)/,
      `$1\n    imageScale: ${scale},`,
    );
  } else {
    next = next.replace(/(id\s*:\s*"[^"]*",)/, `$1\n    imageScale: ${scale},`);
  }

  return next;
}

function updateMemberCrop(
  source: string,
  id: string,
  position: string,
  scale: number,
): string {
  const marker = `id: "${id}"`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Team member "${id}" not found in config.`);
  }

  const braceStart = source.lastIndexOf("{", markerIndex);
  if (braceStart === -1) {
    throw new Error(`Could not find member object for "${id}".`);
  }

  let depth = 0;
  let braceEnd = -1;
  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        braceEnd = i + 1;
        break;
      }
    }
  }

  if (braceEnd === -1) {
    throw new Error(`Could not parse member object for "${id}".`);
  }

  const block = source.slice(braceStart, braceEnd);
  if (!new RegExp(`id:\\s*"${escapeRegExp(id)}"`).test(block)) {
    throw new Error(`Member block mismatch for "${id}".`);
  }

  const updatedBlock = upsertCropInMemberBlock(block, position, scale);
  return source.slice(0, braceStart) + updatedBlock + source.slice(braceEnd);
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only." }, { status: 403 });
  }

  let body: SaveBody;
  try {
    body = (await request.json()) as SaveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const id = body.id?.trim();
  const position = body.imageObjectPosition?.trim();
  const scale = body.imageScale;

  if (!id || !position || typeof scale !== "number" || !Number.isFinite(scale)) {
    return NextResponse.json(
      { error: "id, imageObjectPosition, and imageScale are required." },
      { status: 400 },
    );
  }

  if (!/^\d{1,3}%\s+\d{1,3}%$/.test(position)) {
    return NextResponse.json(
      { error: 'imageObjectPosition must look like "50% 40%".' },
      { status: 400 },
    );
  }

  const configPath = path.join(process.cwd(), "src/lib/site/config.ts");

  try {
    const current = await fs.readFile(configPath, "utf8");
    const next = updateMemberCrop(current, id, position, Number(scale.toFixed(2)));
    await fs.writeFile(configPath, next, "utf8");
    return NextResponse.json({ ok: true, id, imageObjectPosition: position, imageScale: scale });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save crop.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
