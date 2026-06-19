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
      <span className="rounded-full bg-brand-blue/5 p-2.5 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
        <MapPin size={19} aria-hidden />
      </span>
      <span>
        <span className="flex items-center gap-1.5 font-bold text-brand-navy">
          {area.city}, CA
          {!area.archiveOnly ? (
            <ArrowRight
              size={14}
              aria-hidden
              className="text-brand-blue opacity-0 transition-opacity group-hover:opacity-100"
            />
          ) : null}
        </span>
        <span className="mt-1 block text-sm text-gray-500">{area.blurb}</span>
      </span>
    </>
  );

  const className =
    "group flex items-start gap-4 rounded-xl border border-solid border-gray-200 bg-white p-6 transition-all hover:border-brand-sky/60 hover:shadow-md";

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
  const grouped = groupPublicServiceAreasByRegion(areas);

  if (!ready) {
    return <p className="text-sm text-gray-500">Loading service areas…</p>;
  }

  return (
    <>
      {grouped.map((group) => (
        <div key={group.region} className="mt-14">
          <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">{group.region}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.areas.map((area) => (
              <ServiceAreaCard key={area.id} area={area} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
