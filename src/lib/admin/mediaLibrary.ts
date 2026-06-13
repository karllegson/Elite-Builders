import { homeImages } from "@/lib/site/images";

export type MediaAttachment = {
  id: string;
  src: string;
  filename: string;
  title: string;
  alt: string;
  caption: string;
  description: string;
  mimeType: string;
  fileSize: number;
  width: number;
  height: number;
  uploadedAt: Date;
};

const SAMPLE_DIMENSIONS: Record<string, { width: number; height: number; fileSize: number }> =
  {
    residentialRoofFraming: { width: 1400, height: 933, fileSize: 142336 },
    customKitchenRemodel: { width: 1400, height: 933, fileSize: 128000 },
    commercialRoofFramingAerial: { width: 1600, height: 900, fileSize: 156672 },
    framingContractorPlanning: { width: 1400, height: 933, fileSize: 131072 },
    customHomeFramingCrew: { width: 1400, height: 929, fileSize: 139264 },
    patioDoorsOutdoorLiving: { width: 1400, height: 933, fileSize: 124928 },
    residentialWindowInstallation: { width: 1400, height: 933, fileSize: 135168 },
    luxuryHomeInterior: { width: 1400, height: 933, fileSize: 147456 },
    bayAreaNorthBayService: { width: 1200, height: 800, fileSize: 98304 },
    residentialWallFramingSky: { width: 1400, height: 933, fileSize: 118784 },
    customHomeFramingInterior: { width: 1400, height: 933, fileSize: 126976 },
    twoStoryHomeFramingExterior: { width: 1400, height: 933, fileSize: 133120 },
  };

const SAMPLE_UPLOAD_DATES = [
  new Date("2026-05-29"),
  new Date("2026-05-15"),
  new Date("2026-04-22"),
  new Date("2026-04-08"),
  new Date("2026-03-18"),
  new Date("2026-03-02"),
  new Date("2026-02-14"),
  new Date("2026-01-30"),
  new Date("2026-01-12"),
  new Date("2025-12-20"),
  new Date("2025-11-05"),
  new Date("2025-10-18"),
];

function filenameFromSrc(src: string): string {
  return src.split("/").pop() ?? "image";
}

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function createMediaId(): string {
  return `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMediaDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getDefaultMediaLibrary(): MediaAttachment[] {
  return Object.entries(homeImages).map(([key, image], index) => {
    const filename = filenameFromSrc(image.src);
    const dimensions = SAMPLE_DIMENSIONS[key] ?? {
      width: 1400,
      height: 933,
      fileSize: 131072,
    };
    const title = titleFromFilename(filename);

    return {
      id: `library-${key}`,
      src: image.src,
      filename,
      title,
      alt: image.alt,
      caption: "",
      description: title,
      mimeType: filename.endsWith(".webp")
        ? "image/webp"
        : filename.endsWith(".png")
          ? "image/png"
          : "image/jpeg",
      fileSize: dimensions.fileSize,
      width: dimensions.width,
      height: dimensions.height,
      uploadedAt: SAMPLE_UPLOAD_DATES[index % SAMPLE_UPLOAD_DATES.length],
    };
  });
}

function loadImageDimensions(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    image.src = src;
  });
}

export async function createMediaFromFile(file: File): Promise<MediaAttachment> {
  const src = URL.createObjectURL(file);
  const dimensions = await loadImageDimensions(src);
  const filename = file.name;
  const title = titleFromFilename(filename);

  return {
    id: createMediaId(),
    src,
    filename,
    title,
    alt: "",
    caption: "",
    description: title,
    mimeType: file.type || "image/jpeg",
    fileSize: file.size,
    width: dimensions.width,
    height: dimensions.height,
    uploadedAt: new Date(),
  };
}

export const MAX_UPLOAD_FILE_SIZE_BYTES = 256 * 1024 * 1024;

export function getUploadDateOptions(
  attachments: MediaAttachment[],
): { value: string; label: string }[] {
  const months = new Map<string, string>();

  for (const attachment of attachments) {
    const value = `${attachment.uploadedAt.getFullYear()}-${attachment.uploadedAt.getMonth()}`;
    const label = attachment.uploadedAt.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    months.set(value, label);
  }

  return Array.from(months.entries()).map(([value, label]) => ({ value, label }));
}
