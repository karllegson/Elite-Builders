"use client";

import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
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
      ? "Tell us about your project."
      : "No pressure. No obligation.");
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

  if (submitState === "success") {
    return (
      <div
        className={
          variant === "card"
            ? "rounded-xl border border-solid border-gray-200 bg-white p-4 shadow-sm sm:p-8"
            : "rounded-xl bg-white/10 p-4 sm:p-8"
        }
      >
        <h3
          className={`text-base font-extrabold sm:text-xl ${
            variant === "card" ? "text-brand-navy" : "text-white"
          }`}
        >
          Thank you — we got your message
        </h3>
        <p
          className={`mt-3 text-sm leading-relaxed ${
            variant === "card" ? "text-gray-600" : "text-white/80"
          }`}
        >
          Our team will follow up within one business day. For urgent questions, call us directly.
        </p>
      </div>
    );
  }

  return (
    <form
      aria-label={formType === "contact" ? "Contact Elite Builders" : "Request a free estimate"}
      className={
        variant === "card"
          ? "rounded-xl border border-solid border-gray-200 bg-white p-4 shadow-sm sm:p-8"
          : "rounded-xl bg-white/10 p-4 sm:p-8"
      }
      onSubmit={handleSubmit}
    >
      <h3
        className={`text-base font-extrabold sm:text-xl ${
          variant === "card" ? "text-brand-navy" : "text-white"
        }`}
      >
        {heading}
      </h3>
      <p
        className={`mt-1 text-sm ${
          variant === "card" ? "text-gray-500" : "text-white/70"
        }`}
      >
        {lede}
      </p>

      <div className="mt-5 grid gap-4">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                variant === "card" ? "text-gray-600" : "text-white/80"
              }`}
            >
              Full Name *
            </span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="John Smith"
              className="rounded-md border border-solid border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
            />
          </label>
          <label className="grid gap-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                variant === "card" ? "text-gray-600" : "text-white/80"
              }`}
            >
              Phone *
            </span>
            <input
              type="tel"
              name="phone"
              required
              autoComplete="tel"
              placeholder={business.phone}
              className="rounded-md border border-solid border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                variant === "card" ? "text-gray-600" : "text-white/80"
              }`}
            >
              City
            </span>
            <input
              type="text"
              name="city"
              autoComplete="address-level2"
              placeholder="San Jose"
              className="rounded-md border border-solid border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
            />
          </label>
          <label className="grid gap-1.5">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${
                variant === "card" ? "text-gray-600" : "text-white/80"
              }`}
            >
              Service Needed
            </span>
            <select
              name="service"
              defaultValue=""
              className="rounded-md border border-solid border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900"
            >
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

        <label className="grid gap-1.5">
          <span
            className={`text-xs font-semibold uppercase tracking-wide ${
              variant === "card" ? "text-gray-600" : "text-white/80"
            }`}
          >
            Project Details
          </span>
          <textarea
            name="message"
            rows={3}
            placeholder="Tell us about your project…"
            className="resize-y rounded-md border border-solid border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
          />
        </label>

        {submitState === "error" ? (
          <p className="rounded-md border border-solid border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <p
          className={`text-center text-sm ${
            variant === "card" ? "text-gray-600" : "text-white/80"
          }`}
        >
          Response within one business day.
        </p>

        <button
          type="submit"
          disabled={submitState === "submitting"}
          className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-70 sm:px-6 sm:py-3.5 sm:text-base"
        >
          {submitState === "submitting" ? "Sending…" : buttonLabel}
        </button>
        <p
          className={`text-center text-xs ${
            variant === "card" ? "text-gray-500" : "text-white/70"
          }`}
        >
          Licensed &amp; insured. Your information is never shared.
        </p>
      </div>
    </form>
  );
}
