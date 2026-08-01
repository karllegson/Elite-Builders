export const ESTIMATE_SECTION_ID = "estimate";

export function isEstimateAnchorHref(href: string): boolean {
  if (href === "#estimate" || href === "/#estimate") {
    return true;
  }

  try {
    const url = new URL(href, "http://local");
    return url.pathname === "/" && url.hash === "#estimate";
  } catch {
    return false;
  }
}

export function scrollToEstimateSection(smooth = true): boolean {
  const section = document.getElementById(ESTIMATE_SECTION_ID);
  if (!section) {
    return false;
  }

  section.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start",
  });

  return true;
}
