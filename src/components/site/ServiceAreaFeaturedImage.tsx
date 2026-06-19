import Image from "next/image";

type ServiceAreaFeaturedImageProps = {
  src: string;
  alt: string;
};

export function ServiceAreaFeaturedImage({ src, alt }: ServiceAreaFeaturedImageProps) {
  return (
    <div className="service-area-featured-frame relative mt-6 aspect-[2/1] w-full overflow-hidden rounded-2xl">
      <div className="service-area-featured-motion absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          quality={90}
          sizes="(max-width: 1024px) 100vw, calc(99vw - 8vw * 2 - 320px - 2.5rem)"
          className="object-cover"
        />
      </div>
    </div>
  );
}
