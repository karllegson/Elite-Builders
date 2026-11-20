"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { CITY_AUDIENCE_EVENT } from "@/components/site/city/CityAudienceLink";
import { getAnalyticsSettings, trackAnalyticsEvent } from "@/lib/site/analytics";
import type { CityAudience, CityProjectType } from "@/lib/site/cityPages";
import { business } from "@/lib/site/config";

const TIMELINES = [
  "As soon as possible",
  "1–3 months",
  "3–6 months",
  "6+ months",
  "Just planning / budgeting",
];

const PLAN_STATUS = [
  { value: "Yes", label: "Yes" },
  { value: "In progress", label: "In progress" },
  { value: "Not yet", label: "Not yet" },
];

type SubmitState = "idle" | "submitting" | "success" | "error";

type CityEstimateFormProps = {
  city: string;
  defaultCity: string;
  /** Already filtered on the server: unconfirmed types are only included for admins. */
  projectTypes: (CityProjectType & { adminPreview?: boolean })[];
};

export function CityEstimateForm({ city, defaultCity, projectTypes }: CityEstimateFormProps) {
  const pathname = usePathname();
  const [step, setStep] = useState<1 | 2>(1);
  const [projectType, setProjectType] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const startedRef = useRef(false);
  const stepChangedRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const stepOneRef = useRef<HTMLFieldSetElement>(null);

  const selected = projectTypes.find((type) => type.value === projectType);
  const builderType = projectTypes.find((type) => type.audience === "builder");

  // Pre-select the builder path when a "Send plans for a bid" CTA or the services switch is used.
  useEffect(() => {
    const onAudience = (event: Event) => {
      const audience = (event as CustomEvent<CityAudience>).detail;
      if (audience === "builder" && builderType) {
        setProjectType((current) => current || builderType.value);
      }
      if (audience === "homeowner") {
        setProjectType((current) => (current === builderType?.value ? "" : current));
      }
    };

    window.addEventListener(CITY_AUDIENCE_EVENT, onAudience);
    return () => window.removeEventListener(CITY_AUDIENCE_EVENT, onAudience);
  }, [builderType]);

  // Move focus to the start of the new step (only after the user changed steps).
  useEffect(() => {
    if (!stepChangedRef.current) {
      return;
    }
    if (step === 2) {
      nameRef.current?.focus();
    } else {
      stepOneRef.current?.querySelector<HTMLInputElement>("input:checked, input")?.focus();
    }
  }, [step]);

  const choose = (value: string) => {
    setProjectType(value);
    if (!startedRef.current) {
      startedRef.current = true;
      trackAnalyticsEvent("form_start", { form: "city_estimate", city, page_path: pathname || "/" });
    }
  };

  const goToStep = (next: 1 | 2) => {
    stepChangedRef.current = true;
    setStep(next);
    if (next === 2) {
      trackAnalyticsEvent("form_step_2", {
        form: "city_estimate",
        city,
        project_type: projectType,
        page_path: pathname || "/",
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 1) {
      if (projectType) {
        goToStep(2);
      }
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const audience = selected?.audience ?? "homeowner";
    const details = String(formData.get("details") ?? "").trim();
    const message = [
      `Project type: ${selected?.label ?? projectType}`,
      `Client: ${audience === "builder" ? "Builder / GC" : "Homeowner"}`,
      `Timeline: ${formData.get("timeline") || "Not specified"}`,
      `Plans ready: ${formData.get("plans") || "Not specified"}`,
      details ? `\n${details}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          city: formData.get("city"),
          service: projectType,
          message,
          pagePath: pathname || "/",
          formType: "estimate",
          website: formData.get("website"),
        }),
      });

      if (!response.ok) {
        throw new Error("We couldn't send your request right now. Please call us instead.");
      }

      if (getAnalyticsSettings().trackEstimateForms) {
        trackAnalyticsEvent("estimate_form_submit", {
          page_path: pathname || "/",
          form_type: "estimate",
          service: projectType,
          project_type: projectType,
          audience,
          city: String(formData.get("city") ?? ""),
        });
      }

      form.reset();
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't send your request right now. Please call us instead.",
      );
    }
  };

  const shellClass =
    "self-start rounded-3xl border border-solid border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8";
  const labelClass = "field-label !text-white/85";

  if (submitState === "success") {
    return (
      <div className={shellClass} role="status">
        <span className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 size={24} aria-hidden />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold text-white">Thanks — we got your request</h3>
        <p className="mt-3 leading-relaxed text-white/75">
          We&apos;ll review the details and follow up within one business day. If you have plans or
          engineering, have them handy for that first conversation.
        </p>
        <p className="mt-4 text-sm text-white/60">
          Need us sooner? Call{" "}
          <a href={business.phoneHref} data-cta-location="form_success" className="font-semibold text-white underline">
            {business.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form aria-label={`Request a free estimate in ${city}`} className={shellClass} onSubmit={handleSubmit} noValidate={step === 1}>
      <div className="flex items-center justify-between gap-4">
        <p className="spec-label">Step {step} of 2</p>
        <div className="flex gap-1.5" aria-hidden>
          <span className={`h-1 w-8 rounded-full ${step >= 1 ? "bg-brand-lumber" : "bg-white/20"}`} />
          <span className={`h-1 w-8 rounded-full ${step >= 2 ? "bg-brand-lumber" : "bg-white/20"}`} />
        </div>
      </div>

      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {/* Step 1 stays mounted (hidden) so the chosen project type is always submitted. */}
      <fieldset ref={stepOneRef} className={step === 1 ? "mt-5" : "hidden"}>
        <legend className="font-display text-xl font-bold text-white sm:text-2xl">What are you planning?</legend>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {projectTypes.map((type) => (
            <label key={type.value} className="choice-chip cursor-pointer">
              <input
                type="radio"
                name="projectType"
                value={type.value}
                checked={projectType === type.value}
                onChange={() => choose(type.value)}
                className="sr-only"
              />
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-solid ${
                  projectType === type.value ? "border-brand-lumber" : "border-white/40"
                }`}
                aria-hidden
              >
                {projectType === type.value ? <span className="size-2.5 rounded-full bg-brand-lumber" /> : null}
              </span>
              <span>
                {type.label}
                {type.adminPreview ? <span className="ml-1 text-xs font-normal text-amber-300">(admin preview)</span> : null}
              </span>
            </label>
          ))}
        </div>
        <button type="submit" disabled={!projectType} className="btn btn-primary btn-lg mt-6 w-full">
          Continue
          <ArrowRight size={18} aria-hidden className="btn-arrow" />
        </button>
        <p className="mt-4 text-center text-sm text-white/60">
          Prefer to talk?{" "}
          <a href={business.phoneHref} data-cta-location="estimate_form" className="font-semibold text-white underline-offset-4 hover:underline">
            Call {business.phone}
          </a>
        </p>
      </fieldset>

      {step === 2 ? (
        <div className="mt-5 grid gap-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-white/70">
              Project: <span className="font-semibold text-white">{selected?.label}</span>
            </p>
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white"
            >
              <ArrowLeft size={15} aria-hidden />
              Change
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className={labelClass}>
                Full name <span className="text-brand-red">*</span>
              </span>
              <input ref={nameRef} type="text" name="name" required autoComplete="name" className="field" />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>
                Phone <span className="text-brand-red">*</span>
              </span>
              <input type="tel" name="phone" required autoComplete="tel" inputMode="tel" className="field" />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className={labelClass}>Email</span>
              <input type="email" name="email" autoComplete="email" className="field" />
            </label>
            <label className="grid gap-2">
              <span className={labelClass}>Project city</span>
              <input
                type="text"
                name="city"
                defaultValue={defaultCity}
                autoComplete="address-level2"
                className="field"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className={labelClass}>When do you want to start?</span>
            <select name="timeline" defaultValue="" className="field">
              <option value="">Select a timeline…</option>
              {TIMELINES.map((timeline) => (
                <option key={timeline} value={timeline}>
                  {timeline}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className={labelClass}>Do you have plans or drawings?</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {PLAN_STATUS.map((status) => (
                <label key={status.value} className="choice-chip cursor-pointer !min-h-11 justify-center !py-2 text-sm">
                  <input type="radio" name="plans" value={status.value} className="sr-only" />
                  {status.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-2">
            <span className={labelClass}>Anything else we should know?</span>
            <textarea
              name="details"
              rows={3}
              placeholder="Size, address or area, special requirements…"
              className="field resize-y"
            />
          </label>

          {submitState === "error" ? (
            <p role="alert" className="rounded-xl border border-solid border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button type="submit" disabled={submitState === "submitting"} className="btn btn-primary btn-lg w-full">
            {submitState === "submitting" ? "Sending…" : "Send my request"}
            {submitState === "submitting" ? null : <ArrowRight size={18} aria-hidden className="btn-arrow" />}
          </button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-white/60">
            <Lock size={13} aria-hidden />
            Licensed &amp; insured. Your information is never shared.
          </p>
        </div>
      ) : null}
    </form>
  );
}
