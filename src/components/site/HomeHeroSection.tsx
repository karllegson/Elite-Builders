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
  const [videoReady, setVideoReady] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowVideo(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      void video.play().catch(() => markVideoReady());
      if (!video.paused) {
        markVideoReady();
        return;
      }
    }

    const onPlaying = () => markVideoReady();

    const onCanPlayThrough = () => {
      void video.play().catch(() => markVideoReady());
    };

    video.addEventListener("playing", onPlaying, { once: true });
    video.addEventListener("canplaythrough", onCanPlayThrough, { once: true });

    const fallback = window.setTimeout(markVideoReady, READY_FALLBACK_MS);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplaythrough", onCanPlayThrough);
      window.clearTimeout(fallback);
    };
  }, [markVideoReady]);

  return (
    <section
      id="home-hero"
      className="relative min-h-[58dvh] overflow-hidden bg-brand-navy sm:min-h-[75dvh]"
    >
      {showVideo ? (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            videoReady ? "opacity-100" : "opacity-0"
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
          aria-hidden={!videoReady}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={homeImages.residentialRoofFraming.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      )}

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-navy/60 via-brand-navy/25 to-transparent"
      />

      <div className="site-container relative z-10 flex min-h-[58dvh] items-center py-8 sm:min-h-[75dvh] sm:py-14">
        {children}
      </div>
    </section>
  );
}
