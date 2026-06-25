import Image from "next/image";

/** Max quality for hero/featured images — avoids visible compression on large displays. */
const FEATURED_IMAGE_QUALITY = 100;

/**
 * Request a wide enough source so Next.js does not pick an undersized srcset entry.
 * The frame is full content width (sidebar layout); 1920px covers retina on ~960px columns.
 */
const FEATURED_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px";

type ServiceAreaFeaturedImageProps = {
  src: string;
  alt: string;
};

function shouldServeFeaturedImageUnoptimized(src: string): boolean {
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return true;
  }

  // CMS uploads: serve the original file from storage (no Next.js recompression).
  if (src.includes("/storage/v1/object/public/")) {
    return true;
  }

  // Remote URLs (WordPress, CDN, etc.) — skip the optimizer to avoid hostname config errors.
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return true;
  }

  return false;
}

export function ServiceAreaFeaturedImage({ src, alt }: ServiceAreaFeaturedImageProps) {
  return (
    <div className="service-area-featured-frame relative mt-6 aspect-[2/1] w-full overflow-hidden rounded-2xl">
      {/* Overscan layer: pan animation moves this layer without upscaling a compressed bitmap. */}
      <div className="service-area-featured-motion absolute -inset-[5%] h-[110%] w-[110%]">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          quality={FEATURED_IMAGE_QUALITY}
          sizes={FEATURED_IMAGE_SIZES}
          unoptimized={shouldServeFeaturedImageUnoptimized(src)}
          className="object-cover"
        />
      </div>
    </div>
  );
}
