import Image from "next/image";

type ContentImageProps = {
  src: string;
  alt: string;
  /** Tailwind height class, e.g. h-44 */
  className?: string;
  priority?: boolean;
  /** Pass a full-width sizes hint for banner images so Next.js doesn't serve a tiny srcset. */
  sizes?: string;
  quality?: number;
};

const defaultSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

export default function ContentImage({
  src,
  alt,
  className = "h-48",
  priority = false,
  sizes = defaultSizes,
  quality = 85,
}: ContentImageProps) {

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
