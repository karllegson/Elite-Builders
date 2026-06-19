type SectionIntroProps = {
  eyebrow: string;
  title: string;
  lede?: string;
};

/** Centered section intro — compact on mobile, full size from sm up. */
export default function SectionIntro({ eyebrow, title, lede }: SectionIntroProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-site-accent sm:text-sm sm:tracking-[0.18em]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-lg font-bold leading-snug text-site-text-dark sm:mt-3 sm:text-3xl sm:leading-tight lg:text-4xl">
        {title}
      </h2>
      {lede ? (
        <p className="mt-2 text-xs leading-relaxed text-site-text sm:mt-4 sm:text-base">{lede}</p>
      ) : null}
    </div>
  );
}
