"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = ".reveal-up, .reveal-rise, .dim-line";

/**
 * Plays each home page reveal once, the first time the element scrolls into view (styles in
 * globals.css). Renders nothing. Skipped under reduced motion, so content just shows.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "";
          observer.unobserve(entry.target);
        }
      },
      // Start once a little of the element is on screen, not the instant its edge appears.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    root.dataset.reveal = "on";
    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      delete root.dataset.reveal;
    };
  }, []);

  return null;
}
