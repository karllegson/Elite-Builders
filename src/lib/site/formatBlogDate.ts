export function formatBlogDateLong(value: string | null): string {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export type BlogFeaturedDateTag = {
  iso: string;
  month: string;
  day: string;
  year: string;
};

export function formatBlogFeaturedDateTag(
  value: string | null,
): BlogFeaturedDateTag | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    iso: date.toISOString(),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
    year: date.toLocaleDateString("en-US", { year: "numeric" }),
  };
}
