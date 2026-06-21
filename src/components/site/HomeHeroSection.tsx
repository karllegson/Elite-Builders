"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { homeImages } from "@/lib/site/images";

const HERO_VIDEO_SRC = "/videos/elite-builders-hero.mp4?v=5";
const READY_FALLBACK_MS = 10_000;

type HomeHeroSectionProps = {
  children: ReactNode;
};

export default function HomeHeroSection({ children }: HomeHeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  const markReady = useCallback(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markReady();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      void video.play().catch(() => markReady());
      if (!video.paused) {
        markReady();
        return;
      }
    }

    const onPlaying = () => markReady();

    const onCanPlayThrough = () => {
      void video.play().catch(() => markReady());
    };

    video.addEventListener("playing", onPlaying, { once: true });
    video.addEventListener("canplaythrough", onCanPlayThrough, { once: true });

    const fallback = window.setTimeout(markReady, READY_FALLBACK_MS);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplaythrough", onCanPlayThrough);
      window.clearTimeout(fallback);
    };
  }, [markReady]);

  return (
    <section className="relative min-h-[58dvh] overflow-hidden bg-brand-navy sm:min-h-[75dvh]">
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        src={HERO_VIDEO_SRC}
        poster={homeImages.residentialRoofFraming.src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        {...({ fetchPriority: "high" } as ComponentPropsWithoutRef<"video">)}
        aria-label="Elite Builders commercial video showing framing and construction work"
        aria-hidden={!isReady}
      />

      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-r from-brand-navy/60 via-brand-navy/25 to-transparent transition-opacity duration-500 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`site-container relative z-10 flex min-h-[58dvh] items-center py-8 transition-opacity duration-500 sm:min-h-[75dvh] sm:py-14 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </section>
  );
}
