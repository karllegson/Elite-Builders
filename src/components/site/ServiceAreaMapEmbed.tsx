import { normalizeMapEmbed } from "@/lib/site/mapEmbed";

type ServiceAreaMapEmbedProps = {
  html: string;
};

export function ServiceAreaMapEmbed({ html }: ServiceAreaMapEmbedProps) {
  const embed = normalizeMapEmbed(html);

  if (!embed) {
    return null;
  }

  return (
    <div
      className="service-area-map-embed mt-8 overflow-hidden rounded-2xl border border-solid border-site-line bg-site-surface [&_iframe]:block [&_iframe]:min-h-80 [&_iframe]:w-full [&_iframe]:border-0"
      dangerouslySetInnerHTML={{ __html: embed }}
    />
  );
}
