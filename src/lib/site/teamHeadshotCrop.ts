import type { TeamMember } from "@/lib/site/config";

export type HeadshotCrop = {
  x: number;
  y: number;
  scale: number;
};

export function parseObjectPosition(value?: string): { x: number; y: number } {
  if (!value) {
    return { x: 50, y: 50 };
  }

  const parts = value.trim().split(/\s+/);
  const parsePart = (part: string | undefined, fallback: number) => {
    if (!part) return fallback;
    if (part === "center") return 50;
    if (part === "left" || part === "top") return 0;
    if (part === "right" || part === "bottom") return 100;
    const match = part.match(/^(-?\d+(?:\.\d+)?)%$/);
    return match ? Number(match[1]) : fallback;
  };

  if (parts.length === 1) {
    const n = parsePart(parts[0], 50);
    return { x: n, y: n };
  }

  return {
    x: parsePart(parts[0], 50),
    y: parsePart(parts[1], 50),
  };
}

export function getDefaultCrop(member: TeamMember): HeadshotCrop {
  const { x, y } = parseObjectPosition(member.imageObjectPosition);
  return {
    x,
    y,
    scale: member.imageScale ?? 1,
  };
}

export function cropToMemberOverrides(crop: HeadshotCrop): Pick<
  TeamMember,
  "imageObjectPosition" | "imageScale"
> {
  return {
    imageObjectPosition: `${round(crop.x)}% ${round(crop.y)}%`,
    imageScale: round(crop.scale, 2),
  };
}

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
