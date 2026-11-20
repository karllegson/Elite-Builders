import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { CityAreaMap } from "@/components/site/city/CityAreaMap";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import { isClientTodo, type CityPageConfig } from "@/lib/site/cityPages";

type CityAreasServedProps = {
  city: string;
  areas: CityPageConfig["areas"];
  isHomeBase: boolean;
  /** Slug → public href, for nearby cities whose page is published. */
  publishedHrefs: Map<string, string>;
  showDrafts: boolean;
};

const chipClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-solid border-site-line bg-white px-4 font-display text-sm font-semibold text-brand-ink";

export function CityAreasServed({ city, areas, isHomeBase, publishedHrefs, showDrafts }: CityAreasServedProps) {
  return (
    <section className="section bg-site-surface" aria-labelledby="city-areas-heading">
      <div className="site-container grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="spec-label">Coverage</p>
          <h2 id="city-areas-heading" className="section-title mt-4">
            {areas.heading}
          </h2>
          <p className="section-lede mt-5">{areas.lede}</p>

          <h3 className="mt-10 font-display text-lg font-semibold text-brand-ink">Neighborhoods in {city}</h3>
          {isClientTodo(areas.neighborhoods) ? (
            <ClientTodoNote todo={areas.neighborhoods} show={showDrafts} className="mt-3" />
          ) : (
            <ul className="mt-4 flex flex-wrap gap-2">
              {areas.neighborhoods.map((name) => (
                <li key={name} className={chipClass}>
                  {name}
                </li>
              ))}
            </ul>
          )}
          {isClientTodo(areas.neighborhoods) && !showDrafts ? (
            <p className="mt-3 text-[0.9375rem] text-site-text">All of {city} and the surrounding area.</p>
          ) : null}

          <h3 className="mt-10 font-display text-lg font-semibold text-brand-ink">Nearby cities</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {areas.nearbyCities.map((nearby) => {
              const href = nearby.slug ? publishedHrefs.get(nearby.slug) : undefined;
              return (
                <li key={nearby.name}>
                  {href ? (
                    <Link
                      href={href}
                      className={`${chipClass} transition-colors hover:border-brand-blue hover:text-brand-blue`}
                    >
                      <MapPin size={14} aria-hidden className="text-brand-red" />
                      {nearby.name}
                    </Link>
                  ) : (
                    <span className={chipClass}>
                      <MapPin size={14} aria-hidden className="text-site-text-muted" />
                      {nearby.name}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

          <Link href="/service-areas" className="link-arrow mt-8">
            View all service areas
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        <CityAreaMap cities={areas.mapCities} homeBase={isHomeBase ? city : undefined} />
      </div>
    </section>
  );
}
