"use client";

import { useMemo, useState } from "react";
import { checkEbPage, type EbPageCheckInput } from "@/lib/admin/ebPageCheck";

const STATUS_LABEL = { pass: "OK", warn: "Check", fail: "Fix" } as const;

/** Live checklist under the HTML editor: green = OK, yellow = check, red = fix before publishing. */
export function EbPageCheckPanel(props: EbPageCheckInput) {
  const { content, kind, city, seoTitle, metaDescription } = props;
  const [open, setOpen] = useState(true);
  const results = useMemo(
    () => checkEbPage({ content, kind, city, seoTitle, metaDescription }),
    [content, kind, city, seoTitle, metaDescription],
  );
  const fails = results.filter((result) => result.status === "fail").length;
  const warns = results.filter((result) => result.status === "warn").length;
  const overall = fails ? "fail" : warns ? "warn" : "pass";
  const summary = fails
    ? `${fails} to fix, ${warns} to check`
    : warns
      ? `${warns} to check`
      : "Ready to publish";

  return (
    <section className="admin-eb-check" aria-label="Page check">
      <button
        type="button"
        className={`admin-eb-check-header admin-eb-check--${overall}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="admin-eb-check-title">
          Page check{kind === "subpage" ? " (sub-page)" : kind === "service" ? " (service page)" : ""}
          {city && kind !== "service" ? ` · ${city}` : ""}
        </span>
        <span className="admin-eb-check-summary">{summary}</span>
      </button>
      {open ? (
        <ul className="admin-eb-check-list">
          {results.map((result) => (
            <li key={result.id} className={`admin-eb-check-item admin-eb-check--${result.status}`}>
              <span className="admin-eb-check-badge">{STATUS_LABEL[result.status]}</span>
              <span className="admin-eb-check-label">{result.label}</span>
              <span className="admin-eb-check-detail">{result.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
