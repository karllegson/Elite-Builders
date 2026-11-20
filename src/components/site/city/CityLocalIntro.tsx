import type { ReactNode } from "react";
import { ArrowUpRight, Check, MapPin, Phone } from "lucide-react";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import { CityOnThisPage, type CityTocLink } from "@/components/site/city/CityOnThisPage";
import { CITY_CMS_CONTENT_ID } from "@/lib/site/cityQuickLinks";
import { business } from "@/lib/site/config";
import type { CityPageConfig } from "@/lib/site/cityPages";

const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address.full)}`;

type CityLocalIntroProps = {
  intro: CityPageConfig["localIntro"];
  isHomeBase: boolean;
  showDrafts: boolean;
  /** Optional extra copy written in the dashboard editor for this page. */
  cmsContent?: ReactNode;
  /** "On this page" links — shown with the dashboard content (sticky panel on desktop). */
  toc?: { links: CityTocLink[]; moreLinks: CityTocLink[] };
};

/**
 * First section after the trust bar. When the dashboard page has content (e.g. its
 * "Quick Summary"), that content IS the intro. The config summary is only a fallback
 * for cities without dashboard content.
 */
export function CityLocalIntro({ intro, isHomeBase, showDrafts, cmsContent, toc }: CityLocalIntroProps) {
  const showToc = Boolean(cmsContent && toc && toc.links.length + toc.moreLinks.length > 0);

  return (
    <section
      className="section-sm bg-site-surface"
      aria-labelledby={cmsContent ? undefined : "city-local-heading"}
      aria-label={cmsContent ? "About our framing services" : undefined}
    >
      <div className="site-container grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-14">
        {cmsContent ? (
          <div className="min-w-0">
            {showToc && toc ? <CityOnThisPage links={toc.links} moreLinks={toc.moreLinks} variant="mobile" /> : null}
            <div id={CITY_CMS_CONTENT_ID}>{cmsContent}</div>
          </div>
        ) : (
          <div className="min-w-0">
            <h2 id="city-local-heading" className="section-title">
              {intro.heading}
            </h2>
            <p className="section-lede mt-4 max-w-2xl">{intro.summary}</p>

            <ul className="mt-7 grid gap-4 sm:grid-cols-3">
              {intro.points.map((point) => (
                <li key={point.title} className="rounded-2xl border border-solid border-site-line bg-white p-5">
                  <p className="flex items-center gap-2 font-display text-base font-semibold text-brand-ink">
                    <Check size={17} aria-hidden className="shrink-0 text-brand-red" />
                    {point.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-site-text">{point.body}</p>
                </li>
              ))}
            </ul>

            {intro.todos.length > 0 && showDrafts ? (
              <div className="mt-5 grid gap-2">
                {intro.todos.map((todo) => (
                  <ClientTodoNote key={todo.todo} todo={todo} show={showDrafts} />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Right column: office card + "On this page", pinned while reading the content (desktop). */}
        <div
          className={`grid gap-5 ${
            showToc ? "lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pb-1" : ""
          }`}
        >
        <aside
          aria-label={isHomeBase ? "Our Modesto office" : "Contact Elite Builders IX"}
          className="bg-ink bg-blueprint overflow-hidden rounded-3xl p-6 sm:p-7"
        >
          <p className="spec-label">{isHomeBase ? "Home base" : "Our office"}</p>
          <ul className="mt-4 space-y-3 text-[0.9375rem]">
            <li className="flex gap-3">
              <MapPin size={18} aria-hidden className="mt-0.5 shrink-0 text-brand-lumber" />
              <address className="not-italic leading-relaxed text-white/85">
                {business.address.street}
                <br />
                {business.address.city}, {business.address.state} {business.address.zip}
              </address>
            </li>
            <li>
              <a
                href={business.phoneHref}
                data-cta-location="office_card"
                className="flex gap-3 text-white/85 transition-colors hover:text-white"
              >
                <Phone size={18} aria-hidden className="mt-0.5 shrink-0 text-brand-lumber" />
                {business.phone}
              </a>
            </li>
          </ul>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-glass btn-sm mt-5 w-full"
          >
            Get directions
            <ArrowUpRight size={15} aria-hidden />
          </a>
        </aside>
        {showToc && toc ? (
          <div className="hidden lg:block">
            <CityOnThisPage links={toc.links} moreLinks={toc.moreLinks} variant="rail" />
          </div>
        ) : null}
        </div>
      </div>
    </section>
  );
}
