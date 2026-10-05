"use client";

import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import type { ContactFormType } from "@/lib/contact/submissions.types";
import { trackAnalyticsEvent } from "@/lib/site/analytics";
import { business, services } from "@/lib/site/config";

type ContactFormProps = {
  variant?: "card" | "inline";
  formType?: ContactFormType;
  title?: string;
  description?: string;
  submitLabel?: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function ContactForm({
  variant = "card",
  formType = "estimate",
  title,
  description,
  submitLabel,
}: ContactFormProps) {
  const pathname = usePathname();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const heading =
    title ??
    (formType === "contact" ? "Contact Elite Builders" : "Get Your Free Estimate");
  const lede =
    description ??
    (formType === "contact"
      ? "Tell us about your project and we will respond within one business day."
      : "No pressure. No obligation. We respond within one business day.");
  const buttonLabel =
    submitLabel ??
    (formType === "contact" ? "Send Message" : "Request My Free Estimate");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          city: formData.get("city"),
          service: formData.get("service"),
          message: formData.get("message"),
          pagePath: pathname || "/",
          formType,
          website: formData.get("website"),
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to send your message right now.");
      }

      trackAnalyticsEvent("estimate_form_submit", {
        page_path: pathname || "/",
        service: String(formData.get("service") ?? ""),
        city: String(formData.get("city") ?? ""),
        form_type: formType,
      });

      form.reset();
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send your message right now.",
      );
    }
  };

  const isCard = variant === "card";
  const shellClass = isCard
    ? "rounded-3xl border border-solid border-site-line bg-white p-6 shadow-[0_30px_60px_-30px_rgba(7,21,48,0.35)] sm:p-9"
    : "rounded-3xl border border-solid border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-9";
  const labelClass = `field-label ${isCard ? "" : "!text-white/85"}`;

  if (submitState === "success") {
    return (
      <div className={shellClass} role="status">
        <span className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 size={24} aria-hidden />
        </span>
        <h3 className={`mt-5 font-display text-xl font-bold sm:text-2xl ${isCard ? "text-brand-ink" : "text-white"}`}>
          Thank you — we got your message
        </h3>
        <p className={`mt-3 leading-relaxed ${isCard ? "text-site-text" : "text-white/75"}`}>
          Our team will follow up within one business day. For urgent questions, call us directly.
        </p>
      </div>
    );
  }

  return (
    <form
      aria-label={formType === "contact" ? "Contact Elite Builders" : "Request a free estimate"}
      className={shellClass}
      onSubmit={handleSubmit}
    >
      <h3 className={`font-display text-xl font-bold sm:text-2xl ${isCard ? "text-brand-ink" : "text-white"}`}>
        {heading}
      </h3>
      <p className={`mt-2 text-[0.9375rem] ${isCard ? "text-site-text" : "text-white/70"}`}>
        {lede}
      </p>

      <div className="mt-7 grid gap-5">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className={labelClass}>
              Full name <span className="text-brand-red">*</span>
            </span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="John Smith"
              className="field"
            />
          </label>
          <label className="grid gap-2">
            <span className={labelClass}>
              Phone <span className="text-brand-red">*</span>
            </span>
            <input
              type="tel"
              name="phone"
              required
              autoComplete="tel"
              placeholder={business.phone}
              className="field"
            />
          </label>
        </div>

        {formType === "contact" ? (
          <label className="grid gap-2">
            <span className={labelClass}>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="field"
            />
          </label>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className={labelClass}>City</span>
            <input
              type="text"
              name="city"
              autoComplete="address-level2"
              placeholder="San Jose"
              className="field"
            />
          </label>
          <label className="grid gap-2">
            <span className={labelClass}>Service needed</span>
            <select name="service" defaultValue="" className="field">
              <option value="">Select a service…</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.title}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className={labelClass}>Project details</span>
          <textarea
            name="message"
            rows={4}
            placeholder="Tell us about your project…"
            className="field resize-y"
          />
        </label>

        {submitState === "error" ? (
          <p
            role="alert"
            className="rounded-xl border border-solid border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitState === "submitting"}
          className="btn btn-primary btn-lg mt-1 w-full"
        >
          {submitState === "submitting" ? "Sending…" : buttonLabel}
          {submitState === "submitting" ? null : (
            <ArrowRight size={18} aria-hidden className="btn-arrow" />
          )}
        </button>
        <p
          className={`flex items-center justify-center gap-2 text-center text-xs ${
            isCard ? "text-site-text-muted" : "text-white/60"
          }`}
        >
          <Lock size={13} aria-hidden />
          Licensed &amp; insured. Your information is never shared.
        </p>
      </div>
    </form>
  );
}
