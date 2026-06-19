type EstimateFormProps = {
  variant?: "card" | "inline";
};

/**
 * Lead capture form (UI only for now — submission wiring comes later
 * when the contact backend is built).
 */
export default function EstimateForm({ variant = "card" }: EstimateFormProps) {
  return (
    <form
      aria-label="Request a free estimate"
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
        Get Your Free Estimate
      </h3>
      <p
        className={`mt-1 text-sm ${
          variant === "card" ? "text-gray-500" : "text-white/70"
        }`}
      >
        No pressure. No obligation. We respond within one business day.
      </p>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wide ${variant === "card" ? "text-gray-600" : "text-white/80"}`}>
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
            <span className={`text-xs font-semibold uppercase tracking-wide ${variant === "card" ? "text-gray-600" : "text-white/80"}`}>
              Phone *
            </span>
            <input
              type="tel"
              name="phone"
              required
              autoComplete="tel"
              placeholder="(209) 484-2743"
              className="rounded-md border border-solid border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wide ${variant === "card" ? "text-gray-600" : "text-white/80"}`}>
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
            <span className={`text-xs font-semibold uppercase tracking-wide ${variant === "card" ? "text-gray-600" : "text-white/80"}`}>
              Service Needed
            </span>
            <select
              name="service"
              defaultValue=""
              className="rounded-md border border-solid border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900"
            >
              <option value="" disabled>
                Select a service…
              </option>
              <option value="rough-framing">Rough Framing</option>
              <option value="remodeling">Remodeling</option>
              <option value="siding">Siding</option>
              <option value="decks">Decks &amp; Porches</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className={`text-xs font-semibold uppercase tracking-wide ${variant === "card" ? "text-gray-600" : "text-white/80"}`}>
            Project Details
          </span>
          <textarea
            name="message"
            rows={3}
            placeholder="Tell us about your project…"
            className="resize-y rounded-md border border-solid border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark sm:px-6 sm:py-3.5 sm:text-base"
        >
          Request My Free Estimate
        </button>
        <p
          className={`text-center text-xs ${
            variant === "card" ? "text-gray-400" : "text-white/50"
          }`}
        >
          Licensed &amp; insured. Your information is never shared.
        </p>
      </div>
    </form>
  );
}
