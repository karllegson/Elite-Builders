import { Clock } from "lucide-react";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import { cityPageShared, isClientTodo } from "@/lib/site/cityPages";

export function CityProcess({ showDrafts }: { showDrafts: boolean }) {
  const { heading, lede, steps } = cityPageShared.process;

  return (
    <section className="section bg-ink bg-blueprint" aria-labelledby="city-process-heading">
      <div className="site-container">
        <div className="max-w-2xl">
          <p className="spec-label">Process</p>
          <h2 id="city-process-heading" className="section-title mt-4">
            {heading}
          </h2>
          <p className="section-lede mt-5">{lede}</p>
        </div>

        <ol className="relative mt-12 grid gap-8 lg:grid-cols-5 lg:gap-6">
          {/* Dimension line connecting the steps */}
          <span
            className="absolute bottom-4 left-4 top-4 w-px bg-brand-lumber/35 lg:bottom-auto lg:left-4 lg:right-4 lg:top-4 lg:h-px lg:w-auto"
            aria-hidden
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-4 lg:block">
              <span className="callout-dot relative">{String(index + 1).padStart(2, "0")}</span>
              <div className="lg:mt-6">
                <h3 className="font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/72">{step.body}</p>
                {isClientTodo(step.duration) ? (
                  <ClientTodoNote todo={step.duration} show={showDrafts} className="mt-3" />
                ) : (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-lumber">
                    <Clock size={13} aria-hidden />
                    {step.duration}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
