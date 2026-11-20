import { ArrowRight, Check, Phone } from "lucide-react";
import BuilderMarquee from "@/components/site/BuilderMarquee";
import { CityAudienceLink } from "@/components/site/city/CityAudienceLink";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import { business } from "@/lib/site/config";
import { isClientTodo, type CityPageConfig } from "@/lib/site/cityPages";

type CityBuilderBandProps = {
  band: CityPageConfig["builderBand"];
  showDrafts: boolean;
};

export function CityBuilderBand({ band, showDrafts }: CityBuilderBandProps) {
  return (
    <section className="section-sm bg-white" aria-labelledby="city-builders-heading">
      <div className="site-container">
        <div className="bg-ink bg-blueprint overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-14">
            <div>
              <p className="spec-label">For builders &amp; general contractors</p>
              <h2 id="city-builders-heading" className="section-title mt-4 text-white">
                {band.heading}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{band.body}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {band.points.map((point) =>
                  isClientTodo(point) ? (
                    showDrafts ? (
                      <li key={point.todo} className="sm:col-span-2">
                        <ClientTodoNote todo={point} show />
                      </li>
                    ) : null
                  ) : (
                    <li key={point} className="flex items-start gap-2.5 text-[0.9375rem] text-white/85">
                      <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-brand-lumber" />
                      {point}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <CityAudienceLink audience="builder" trackingLocation="builder_band" className="btn btn-primary btn-lg">
                Send plans for a bid
                <ArrowRight size={18} aria-hidden className="btn-arrow" />
              </CityAudienceLink>
              <a href={business.phoneHref} data-cta-location="builder_band" className="btn btn-glass btn-lg">
                <Phone size={17} aria-hidden />
                {business.phone}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-center text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 sm:text-xs sm:tracking-[0.2em]">
          <span className="font-bold text-brand-blue">Trusted</span>
          {" "}by leading builders &amp; general contractors
        </p>
        <BuilderMarquee />
      </div>
    </section>
  );
}
