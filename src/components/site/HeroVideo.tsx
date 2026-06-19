/**
 * Fullscreen background video for the homepage hero.
 * Always muted — no audio track.
 */
export default function HeroVideo() {
  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src="/videos/elite-builders-hero.mp4?v=4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Elite Builders commercial video showing framing and construction work"
    />
  );
}
