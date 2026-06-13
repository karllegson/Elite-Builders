export type PostStatus = "draft" | "pending" | "published";

export type PostVisibility = "public" | "password" | "private";

export type PublishSettings = {
  status: PostStatus;
  visibility: PostVisibility;
  password: string;
  stickToFrontPage: boolean;
  publishDate: Date;
  lockModifiedDate: boolean;
};

export type PublishEditPanel = "status" | "visibility" | "publish" | null;

export const POST_STATUS_OPTIONS: { value: PostStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending Review" },
  { value: "published", label: "Published" },
];

export const MONTH_OPTIONS = [
  { value: 0, label: "01-Jan" },
  { value: 1, label: "02-Feb" },
  { value: 2, label: "03-Mar" },
  { value: 3, label: "04-Apr" },
  { value: 4, label: "05-May" },
  { value: 5, label: "06-Jun" },
  { value: 6, label: "07-Jul" },
  { value: 7, label: "08-Aug" },
  { value: 8, label: "09-Sep" },
  { value: 9, label: "10-Oct" },
  { value: 10, label: "11-Nov" },
  { value: 11, label: "12-Dec" },
];

export function createDefaultPublishSettings(now = new Date()): PublishSettings {
  return {
    status: "draft",
    visibility: "public",
    password: "",
    stickToFrontPage: false,
    publishDate: new Date(now),
    lockModifiedDate: false,
  };
}

export function formatStatusLabel(status: PostStatus): string {
  return POST_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "Draft";
}

export function formatVisibilityLabel(
  visibility: PostVisibility,
  password?: string,
): string {
  if (visibility === "password") {
    return password?.trim() ? "Password protected" : "Password protected";
  }

  if (visibility === "private") {
    return "Private";
  }

  return "Public";
}

export function isPublishImmediately(publishDate: Date, now = new Date()): boolean {
  return publishDate.getTime() <= now.getTime();
}

export function formatPublishScheduleLabel(
  publishDate: Date,
  now = new Date(),
): string {
  if (isPublishImmediately(publishDate, now)) {
    return "immediately";
  }

  const datePart = publishDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = publishDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `on ${datePart} at ${timePart}`;
}

export function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}

export function buildPublishDate(
  month: number,
  day: number,
  year: number,
  hour: number,
  minute: number,
): Date {
  const next = new Date(year, month, day, hour, minute, 0, 0);
  return next;
}

export type SeoScoreInput = {
  postTitle: string;
  postContent: string;
  seoTitle: string;
  permalink: string;
  metaDescription: string;
  hasFeaturedImage?: boolean;
};

export function calculateSeoScore(input: SeoScoreInput): number {
  let score = 0;

  if (input.postTitle.trim().length >= 10) {
    score += 15;
  } else if (input.postTitle.trim().length > 0) {
    score += 8;
  }

  if (input.seoTitle.trim().length >= 30 && input.seoTitle.trim().length <= 60) {
    score += 20;
  } else if (input.seoTitle.trim().length > 0) {
    score += 10;
  }

  if (input.permalink.trim().length >= 8) {
    score += 10;
  }

  if (input.metaDescription.trim().length >= 120) {
    score += 20;
  } else if (input.metaDescription.trim().length > 0) {
    score += 10;
  }

  const wordCount = input.postContent.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount >= 300) {
    score += 25;
  } else if (wordCount >= 100) {
    score += 12;
  } else if (wordCount > 0) {
    score += 5;
  }

  if (input.hasFeaturedImage) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function getSeoScoreTone(score: number): "bad" | "ok" | "good" {
  if (score >= 70) {
    return "good";
  }

  if (score >= 40) {
    return "ok";
  }

  return "bad";
}
