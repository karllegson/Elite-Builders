"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const HERO_VIDEO_SRC = "/videos/elite-builders-hero.mp4?v=5";
/** Exact first frame of the hero video — first paint is identical to the video start. */
const HERO_POSTER_SRC = "/videos/elite-builders-hero-poster.jpg";
/**
 * Tiny inlined copy of the video's first frame. Ships inside the HTML itself,
 * so the very first paint already shows the frame — zero network wait, no blank flash.
 */
const HERO_INLINE_PLACEHOLDER =
  "data:image/jpeg;base64,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";

type HomeHeroSectionProps = {
  children: ReactNode;
};

export default function HomeHeroSection({ children }: HomeHeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowVideo(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      void video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay, { once: true });

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
    };
  }, []);

  return (
    <section
      id="home-hero"
      className="relative min-h-[46dvh] overflow-hidden bg-brand-navy bg-cover bg-center sm:min-h-[75dvh]"
      style={{ backgroundImage: `url("${HERO_INLINE_PLACEHOLDER}")` }}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            backgroundImage: `url("${HERO_INLINE_PLACEHOLDER}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          src={HERO_VIDEO_SRC}
          poster={HERO_POSTER_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          {...({ fetchPriority: "high" } as ComponentPropsWithoutRef<"video">)}
          aria-label="Elite Builders commercial video showing framing and construction work"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HERO_POSTER_SRC}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      )}

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-navy/35 via-brand-navy/12 to-transparent"
      />

      <div className="site-container relative z-10 flex min-h-[46dvh] items-center py-5 sm:min-h-[75dvh] sm:py-14">
        {children}
      </div>
    </section>
  );
}
