import type { ComponentPropsWithoutRef } from "react";
import { homeImages } from "@/lib/site/images";

/**
 * Fullscreen background video for the homepage hero.
 * Always muted — no audio track.
 *
 * Uses the loop encode (~8.5 MB vs ~15 MB full cut) with a poster so LCP
 * paints immediately while the video buffer fills.
 */
export default function HeroVideo() {
  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src="/videos/elite-builders-hero-loop.mp4?v=1"
      poster={homeImages.residentialRoofFraming.src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      {...({ fetchPriority: "high" } as ComponentPropsWithoutRef<"video">)}
      aria-label="Elite Builders commercial video showing framing and construction work"
    />
  );
}
