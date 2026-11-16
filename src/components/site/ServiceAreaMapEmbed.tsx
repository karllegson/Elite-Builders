import { normalizeMapEmbed } from "@/lib/site/mapEmbed";

type ServiceAreaMapEmbedProps = {
  html: string;
  /** Place to show (e.g. "Stockton, CA") when no map embed was entered in the dashboard. */
  fallbackQuery?: string;
};

const MAP_CLASS =
  "service-area-map-embed mt-8 overflow-hidden rounded-2xl border border-solid border-site-line bg-site-surface [&_iframe]:block [&_iframe]:min-h-80 [&_iframe]:w-full [&_iframe]:border-0";

export function ServiceAreaMapEmbed({ html, fallbackQuery }: ServiceAreaMapEmbedProps) {
  const embed = normalizeMapEmbed(html);

  if (embed) {
    return <div className={MAP_CLASS} dangerouslySetInnerHTML={{ __html: embed }} />;
  }

  if (!fallbackQuery) {
    return null;
  }

  return (
    <div className={MAP_CLASS}>
      <iframe
        title={`Map of ${fallbackQuery}`}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&z=11&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
