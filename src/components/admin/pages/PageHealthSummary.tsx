"use client";

import { useEffect, useState } from "react";
import type { PageHealth, PageHealthState } from "@/lib/admin/pageHealth";

const STATE_LABEL: Record<PageHealthState, string> = {
  ready: "Ready",
  check: "Check",
  fix: "Fix",
  placeholder: "Placeholder",
  empty: "Empty",
};

// Each photo URL is only loaded once per visit, however many rows use it.
const imageLoads = new Map<string, Promise<boolean>>();

function imageLoads_(src: string): Promise<boolean> {
  const cached = imageLoads.get(src);
  if (cached) return cached;
  const promise = new Promise<boolean>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image.naturalWidth > 0);
    image.onerror = () => resolve(false);
    image.src = src;
  });
  imageLoads.set(src, promise);
  return promise;
}

/** Photos on the page that don't load in the browser (deleted file, typo in the URL). */
function useBrokenImages(urls: string[]): string[] {
  const [broken, setBroken] = useState<string[]>([]);
  const key = urls.join("\n");

  useEffect(() => {
    let cancelled = false;
    const list = key ? key.split("\n") : [];
    void Promise.all(list.map(imageLoads_)).then((results) => {
      if (!cancelled) setBroken(list.filter((_, index) => !results[index]));
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return broken;
}

type Tone = "good" | "warn" | "bad";

function wordsTone(words: number): Tone {
  return words >= 900 ? "good" : words >= 600 ? "warn" : "bad";
}

function fileName(src: string) {
  return decodeURIComponent(src.split("?")[0].split("/").pop() ?? src);
}

/** Stats chips for one row of the admin Pages list. */
export function PageHealthSummary({ health }: { health: PageHealth }) {
  const [open, setOpen] = useState(false);
  const broken = useBrokenImages(health.imageUrls);
  const fixes = broken.length
    ? [`${broken.length} photo(s) don't load: ${broken.map(fileName).join(", ")}.`, ...health.fixes]
    : health.fixes;
  const state: PageHealthState =
    health.state === "ready" || health.state === "check" ? (fixes.length ? "fix" : health.state) : health.state;
  const issueCount = fixes.length + health.checks.length;
  const hasContent = health.words > 0;
  const imageTone: Tone = broken.length || health.images === 0 ? "bad" : "good";
  const copiedTone: Tone =
    health.copiedPercent >= 30 ? "bad" : health.copiedPercent >= 10 ? "warn" : "good";

  return (
    <div className="admin-page-health">
      <span
        className={`admin-page-health-chip is-${wordsTone(health.words)}`}
        title="900+ words is green, 600 to 899 yellow, under 600 red"
      >
        {health.words.toLocaleString()} words
      </span>
      {hasContent ? (
        <>
          <span
            className={`admin-page-health-chip is-${imageTone}`}
            title={broken.length ? "Some photos don't load" : health.images ? "All photos load" : "No photos"}
          >
            {health.images} img{broken.length ? ` · ${broken.length} broken` : ""}
          </span>
          <span
            className={`admin-page-health-chip is-${copiedTone}`}
            title="Paragraphs that are word-for-word on another published page: under 10% green, 10 to 29% yellow, 30%+ red"
          >
            {health.copiedPercent ? `${health.copiedPercent}% copied` : "Original"}
          </span>
        </>
      ) : null}
      <button
        type="button"
        className={`admin-page-health-state is-${state}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        disabled={issueCount === 0}
        title={issueCount ? "Show what to fix" : "Nothing to fix"}
      >
        {STATE_LABEL[state]}
        {issueCount ? ` · ${issueCount}` : ""}
      </button>

      {open && issueCount ? (
        <div className="admin-page-health-pop" role="dialog" aria-label="Page issues">
          {fixes.length ? (
            <>
              <p className="admin-page-health-pop-title is-fix">Fix</p>
              <ul>
                {fixes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}
          {health.checks.length ? (
            <>
              <p className="admin-page-health-pop-title is-check">Check</p>
              <ul>
                {health.checks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Pages built in code (Home, About…): nothing to score from the dashboard. */
export function PageHealthCodeNote() {
  return <span className="admin-page-health-chip is-muted">Built in code</span>;
}
