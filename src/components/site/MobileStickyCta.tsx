"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import EstimateCtaLink from "@/components/site/EstimateCtaLink";
import { business } from "@/lib/site/config";

const HOME_HERO_ID = "home-hero";

/**
 * Mobile sticky Call Now / Free Estimate bar.
 * Hidden at the top of the page; appears after scrolling past the home hero
 * (or past ~70% of the viewport on other pages).
 */
export default function MobileStickyCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");

    const update = () => {
      if (media.matches) {
        setVisible(false);
        return;
      }

      if (pathname === "/") {
        const hero = document.getElementById(HOME_HERO_ID);
        if (hero) {
          setVisible(hero.getBoundingClientRect().bottom <= 8);
          return;
        }
      }

      setVisible(window.scrollY > window.innerHeight * 0.55);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    media.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      media.removeEventListener("change", update);
    };
  }, [pathname]);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-50 grid grid-cols-2 gap-2 rounded-full border border-solid border-white/10 bg-brand-ink/90 p-1.5 shadow-[0_18px_40px_-12px_rgba(7,21,48,0.6)] backdrop-blur-md transition-all duration-300 ease-out sm:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[150%] opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <a
        href={business.phoneHref}
        tabIndex={visible ? 0 : -1}
        className="flex items-center justify-center gap-2 rounded-full py-3 font-display text-sm font-semibold text-white"
      >
        <Phone size={16} aria-hidden />
        Call Now
      </a>
      <EstimateCtaLink
        href="/#estimate"
        tabIndex={visible ? 0 : -1}
        className="flex items-center justify-center rounded-full bg-brand-red py-3 font-display text-sm font-semibold text-white"
      >
        Free Estimate
      </EstimateCtaLink>
    </div>
  );
}
