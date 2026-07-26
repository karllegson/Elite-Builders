import Image from "next/image";
import type { TeamMember } from "@/lib/site/config";
import { parseObjectPosition } from "@/lib/site/teamHeadshotCrop";

type TeamHeadshotImageProps = {
  member: Pick<TeamMember, "name" | "imageSrc" | "imageObjectPosition" | "imageScale">;
  /** Tailwind size classes for the circular frame, e.g. "size-20 sm:size-36" */
  frameClassName: string;
  sizes: string;
  priority?: boolean;
};

/**
 * Circular headshot. object-position controls which part of the portrait shows
 * (use a low Y% to keep headroom above the face). Scale zooms from that focal point.
 */
export function TeamHeadshotImage({
  member,
  frameClassName,
  sizes,
  priority = false,
}: TeamHeadshotImageProps) {
  if (!member.imageSrc) {
    return null;
  }

  const { x, y } = parseObjectPosition(member.imageObjectPosition);
  const scale = Math.max(member.imageScale ?? 1, 1);

  return (
    <div className={`relative overflow-hidden rounded-full ${frameClassName}`}>
      <Image
        src={member.imageSrc}
        alt={member.name}
        fill
        quality={95}
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={{
          objectPosition: `${x}% ${y}%`,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: `${x}% ${y}%`,
        }}
      />
    </div>
  );
}
