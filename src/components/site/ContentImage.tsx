import Image from "next/image";

type ContentImageProps = {
  src: string;
  alt: string;
  /** Tailwind height/aspect classes on the wrapper, e.g. h-48 or aspect-[3/2] */
  className?: string;
  priority?: boolean;
  /** Pass a full-width sizes hint for banner images so Next.js doesn't serve a tiny srcset. */
  sizes?: string;
  quality?: number;
  objectFit?: "cover" | "contain";
  /** Focal point when using cover, e.g. "center 30%" */
  objectPosition?: string;
};

const defaultSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

export default function ContentImage({
  src,
  alt,
  className = "h-48",
  priority = false,
  sizes = defaultSizes,
  quality = 75,
  objectFit = "cover",
  objectPosition,
}: ContentImageProps) {
  return (
    <div
      className={`relative w-full overflow-hidden ${
        objectFit === "contain" ? "bg-gray-100" : ""
      } ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={objectFit === "contain" ? "object-contain" : "object-cover"}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}
