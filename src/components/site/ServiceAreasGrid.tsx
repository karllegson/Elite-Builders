"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { usePublicServiceAreas } from "@/hooks/usePublicServiceAreas";
import {
  groupPublicServiceAreasByRegion,
  type PublicServiceArea,
} from "@/lib/site/serviceAreasPublic";

function ServiceAreaCard({ area }: { area: PublicServiceArea }) {
  const cardBody = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-site-surface text-brand-red transition-colors group-hover:bg-brand-red group-hover:text-white">
        <MapPin size={18} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-semibold text-brand-ink">
          {area.city}, CA
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-site-text-muted">{area.blurb}</span>
      </span>
      {!area.archiveOnly ? (
        <ArrowRight
          size={16}
          aria-hidden
          className="mt-1 shrink-0 text-site-text-muted transition-all group-hover:translate-x-1 group-hover:text-brand-red"
        />
      ) : null}
    </>
  );

  const className =
    "group flex h-full items-start gap-4 rounded-2xl border border-solid border-site-line bg-white p-5 transition-all hover:border-brand-ink/25 hover:shadow-[0_16px_32px_-20px_rgba(7,21,48,0.4)] sm:p-6";

  if (area.archiveOnly) {
    return (
      <div
        className={`${className} cursor-default opacity-80`}
        aria-label={`${area.city}, CA (archive only)`}
      >
        {cardBody}
      </div>
    );
  }

  return (
    <Link key={area.slug} href={area.href} className={className}>
      {cardBody}
    </Link>
  );
}

export function ServiceAreasGrid() {
  const { areas, ready } = usePublicServiceAreas();
  // Service landing pages live in the same store but aren't cities.
  const grouped = groupPublicServiceAreasByRegion(areas.filter((area) => !area.isServicePage));

  if (!ready) {
    return <p className="text-sm text-site-text-muted">Loading service areas…</p>;
  }

  return (
    <div className="space-y-16">
      {grouped.map((group) => (
        <div key={group.region}>
          <div className="flex items-end justify-between gap-4 border-b border-solid border-site-line pb-5">
            <h2 className="section-title !text-2xl sm:!text-3xl">{group.region}</h2>
            <span className="shrink-0 rounded-full bg-site-surface px-3 py-1 font-display text-xs font-semibold text-site-text-muted">
              {group.areas.length} {group.areas.length === 1 ? "city" : "cities"}
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.areas.map((area) => (
              <ServiceAreaCard key={area.id} area={area} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
