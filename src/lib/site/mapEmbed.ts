export function normalizeMapEmbed(html: string): string | null {
  const trimmed = html.trim();

  if (!trimmed || !/<iframe/i.test(trimmed)) {
    return null;
  }

  return trimmed;
}
