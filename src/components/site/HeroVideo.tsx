"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Fullscreen background video for the homepage hero.
 * Autoplays muted (required by browsers); visitors can toggle sound.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/elite-builders-hero-loop.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Elite Builders commercial video showing framing and construction work"
      />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/70"
      >
        {muted ? <VolumeX size={16} aria-hidden /> : <Volume2 size={16} aria-hidden />}
        {muted ? "Sound On" : "Sound Off"}
      </button>
    </>
  );
}
