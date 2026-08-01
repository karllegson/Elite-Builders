"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { builders } from "@/lib/site/builders";

function LogoGroup({
  ariaHidden = false,
  groupRef,
  onImageLoad,
}: {
  ariaHidden?: boolean;
  groupRef?: React.RefObject<HTMLUListElement | null>;
  onImageLoad?: () => void;
}) {
  return (
    <ul
      ref={groupRef}
      className="builder-marquee__group flex shrink-0 items-center"
      aria-hidden={ariaHidden || undefined}
    >
      {builders.map((builder) => {
        const marqueeTreatment = builder.logoPreserveOriginal
          ? "opacity-60 hover:opacity-100"
          : "opacity-60 grayscale [mix-blend-mode:multiply] hover:opacity-100 hover:grayscale-0";

        const logoClassName = [
          "h-full w-auto max-w-none object-contain transition duration-300",
          marqueeTreatment,
          builder.logoImageClassName,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li
            key={builder.name}
            className={`builder-marquee__item flex shrink-0 items-center justify-center ${
              builder.logoClassName ?? "h-9 sm:h-11"
            }`}
          >
            <Image
              src={builder.logo}
              alt={builder.name}
              width={builder.logoWidth ?? 180}
              height={builder.logoHeight ?? 56}
              unoptimized={builder.logoUnoptimized}
              onLoad={onImageLoad}
              className={logoClassName}
            />
          </li>
        );
      })}
    </ul>
  );
}

export default function BuilderMarquee() {
  const groupRef = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const measure = () => {
      setDistance(group.getBoundingClientRect().width);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(group);

    window.addEventListener("load", measure);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const ready = distance > 0;
  const durationSeconds = ready ? Math.max(55, Math.round(distance / 18)) : 70;

  return (
    <div className="builder-marquee mt-6 sm:mt-10">
      <div
        className="builder-marquee__track"
        data-ready={ready ? "true" : "false"}
        style={
          ready
            ? ({
                "--marquee-distance": `${distance}px`,
                "--marquee-duration": `${durationSeconds}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <LogoGroup groupRef={groupRef} onImageLoad={() => {
          const group = groupRef.current;
          if (group) {
            setDistance(group.getBoundingClientRect().width);
          }
        }} />
        <LogoGroup ariaHidden />
      </div>
    </div>
  );
}
