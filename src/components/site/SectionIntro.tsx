import type { ReactNode } from "react";

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
  /** Optional action (e.g. a button) shown beside a left-aligned intro on wide screens. */
  action?: ReactNode;
  className?: string;
};

/** Section heading block — eyebrow, display title, optional lede and action. */
export default function SectionIntro({
  eyebrow,
  title,
  lede,
  align = "center",
  tone = "light",
  action,
  className = "",
}: SectionIntroProps) {
  const dark = tone === "dark";
  const centered = align === "center";

  const copy = (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p className={`eyebrow ${dark ? "eyebrow-light" : ""}`}>{eyebrow}</p>
      <h2 className={`section-title mt-4 ${dark ? "text-white" : ""}`}>{title}</h2>
      {lede ? <p className="section-lede mt-5">{lede}</p> : null}
    </div>
  );

  if (!action || centered) {
    return (
      <div className={className}>
        {copy}
        {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12 ${className}`}
    >
      {copy}
      <div className="shrink-0">{action}</div>
    </div>
  );
}
