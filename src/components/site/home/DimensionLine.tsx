type DimensionLineProps = {
  /** Short mark in the middle of the line, like a measurement on a framing plan. */
  label?: string;
  onDark?: boolean;
  className?: string;
};

/** Decorative measurement line (ticked ends, optional label): the home page's framing motif. */
export default function DimensionLine({ label, onDark = false, className = "" }: DimensionLineProps) {
  return (
    <div className={`dim-line ${onDark ? "dim-line--on-dark" : ""} ${className}`} aria-hidden>
      <span className="dim-line__rule" />
      {label ? (
        <>
          <span className="dim-line__label">{label}</span>
          <span className="dim-line__rule" />
        </>
      ) : null}
    </div>
  );
}
