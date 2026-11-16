"use client";

import { useEffect, useState } from "react";
import { EB_JUMP_LABEL, type EbJumpLink } from "@/lib/site/ebContent";

type EbJumpListProps = {
  links: EbJumpLink[];
};

/** Sidebar section list for Elite-format pages; highlights the section in view. */
export function EbJumpList({ links }: EbJumpListProps) {
  const [activeHref, setActiveHref] = useState(links[0]?.href ?? "");

  useEffect(() => {
    if (links.length === 0) {
      return;
    }

    const update = () => {
      // A heading counts as "current" once it passes the top quarter of the screen.
      const threshold = window.innerHeight * 0.25;
      let current = links[0].href;

      for (const link of links) {
        const heading = document.getElementById(link.href.slice(1));
        if (heading && heading.getBoundingClientRect().top - threshold <= 0) {
          current = link.href;
        }
      }

      setActiveHref(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [links]);

  if (links.length < 2) {
    return null;
  }

  return (
    <nav className="eb-jump" aria-label={EB_JUMP_LABEL}>
      <p className="eb-jump__title">{EB_JUMP_LABEL}</p>
      <ol>
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={link.href === activeHref ? "is-active" : undefined}
              aria-current={link.href === activeHref ? "location" : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
