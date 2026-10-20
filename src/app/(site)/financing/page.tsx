import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Check, Phone } from "lucide-react";
import CtaBand from "@/components/site/CtaBand";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import PageHero from "@/components/site/PageHero";
import SectionIntro from "@/components/site/SectionIntro";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Financing",
  description:
    "Finance your remodel or addition with Elite Builders IX through RenoFi — renovation loans based on your home's after-renovation value, with terms up to 20 years.",
  path: "/financing",
});

/** Everything below is taken from RenoFi's partner page — keep it in sync if their offer changes. */
const loanOptions = [
  {
    title: "Renovation Loans",
    fit: "Projects over $20k",
    body: "Borrow against what your home will be worth once the work is done, so you can take on the full project instead of a scaled-back version.",
  },
  {
    title: "Personal Loans",
    fit: "Smaller projects",
    body: "A simpler option for smaller home improvement work that doesn't need a renovation loan.",
  },
  {
    title: "Purchase & Refinance",
    fit: "Buying or refinancing",
    body: "Options for buying a home that needs work, or refinancing to fund a renovation.",
  },
] as const;

const benefits = [
  "Keep your existing mortgage — no need to refinance",
  "Rates based on your home's after-renovation value",
  "Terms up to 20 years",
  "Pay early with no prepayment penalties",
  "100% of the funds upfront once approved — no draws, no inspections",
  "Checking your options doesn't impact your credit score",
] as const;

const steps = [
  {
    title: "Get your estimate",
    body: "Tell us about your project. We'll walk the scope with you and put together a clear estimate.",
  },
  {
    title: "Check your options",
    body: "See what you may qualify for through RenoFi online. It takes a few minutes and won't affect your credit score.",
  },
  {
    title: "Build with confidence",
    body: "Once approved, your funds are available upfront, so we can schedule your project and get to work.",
  },
] as const;

function FinancingLink({ className, label }: { className: string; label: string }) {
  return (
    <a href={business.financingUrl} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
      <ArrowUpRight size={18} aria-hidden />
      <span className="sr-only">(opens RenoFi in a new tab)</span>
    </a>
  );
}

export default function FinancingPage() {
  return (
    <>
      <PageHero
        eyebrow="Financing"
        title="Flexible financing for your next project"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Financing" }]}
        image={homeImages.twoStoryHomeFramingExterior}
        lede={
          <p>
            Elite Builders IX now offers project financing through RenoFi, so you can plan the
            remodel, addition or custom build you actually want and pay for it over time.
          </p>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <FinancingLink className="btn btn-primary btn-lg" label="Check Your Options" />
          <a href={business.phoneHref} className="btn btn-glass btn-lg">
            <Phone size={17} aria-hidden />
            {business.phone}
          </a>
        </div>
      </PageHero>

      {/* ── Loan options ─────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container">
          <SectionIntro
            eyebrow="Loan Options"
            title="Financing that fits the size of your project"
            lede="RenoFi matches you with the right type of loan for the work you're planning."
            align="left"
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {loanOptions.map(({ title, fit, body }) => (
              <article
                key={title}
                className="flex flex-col rounded-3xl border border-solid border-site-line bg-site-surface p-7 sm:p-8"
              >
                <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-brand-red">
                  {fit}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-brand-ink">{title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-site-text">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why RenoFi ───────────────────────────────────────── */}
      <section className="section bg-ink relative overflow-hidden">
        <div className="bg-blueprint pointer-events-none absolute inset-0" aria-hidden />

        <div className="site-container relative grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionIntro
              eyebrow="Why RenoFi"
              title="Borrow based on what your home will be worth"
              lede="Most home equity loans only look at what your home is worth today. RenoFi looks at its value after the renovation, which can mean more borrowing power."
              align="left"
              tone="dark"
            />

            <ul className="mt-10 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3 text-base leading-relaxed text-white/80">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
                    <Check size={14} aria-hidden strokeWidth={3} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <aside className="self-center rounded-3xl border border-solid border-white/10 bg-brand-ink-2 p-7 sm:p-10">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Example from RenoFi
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              A home worth <strong className="text-white">$750,000</strong> with{" "}
              <strong className="text-white">$310,000</strong> left on the mortgage:
            </p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-5">
                <dt className="text-sm text-white/60">Standard home equity loan</dt>
                <dd className="mt-2 font-display text-3xl font-semibold text-white/80">$290,000</dd>
              </div>
              <div className="rounded-2xl bg-brand-red p-5">
                <dt className="text-sm text-white/85">With RenoFi</dt>
                <dd className="mt-2 font-display text-3xl font-semibold text-white">$500,000</dd>
              </div>
            </dl>

            <p className="mt-6 text-sm leading-relaxed text-white/50">
              Borrowing up to a maximum of $750,000. Illustrative example only; what you qualify
              for depends on your home, your project and the lender.
            </p>
          </aside>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container">
          <SectionIntro eyebrow="How It Works" title="Three simple steps" align="left" />

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map(({ title, body }, index) => (
              <li key={title} className="border-t-2 border-solid border-brand-ink pt-6">
                <span className="font-display text-sm font-semibold tracking-[0.16em] text-brand-red">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-brand-ink">{title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-site-text">{body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <FinancingLink className="btn btn-primary btn-lg" label="Check Your Options with RenoFi" />
            <EstimateCtaLink href="/#estimate" className="btn btn-outline btn-lg">
              Request a Free Estimate
              <ArrowRight size={18} aria-hidden className="btn-arrow" />
            </EstimateCtaLink>
          </div>

          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-site-text-muted">
            Financing is provided through RenoFi and its lending partners, not by Elite Builders
            IX. Loan options, rates and terms vary depending on your location, your project and
            the available lender, and all loans are subject to approval.
          </p>
        </div>
      </section>

      <CtaBand
        title="Questions about financing?"
        body="Give us a call and we'll walk you through your project and how financing could work for it."
      />
    </>
  );
}
