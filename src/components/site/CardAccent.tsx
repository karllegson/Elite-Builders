/** Minimal card accent — numbered index + red rule. No stock icons. */
export function CardIndex({ index }: { index: number }) {
  const label = String(index + 1).padStart(2, "0");
  return (
    <span className="font-display text-2xl font-extrabold tracking-tight text-brand-red">
      {label}
    </span>
  );
}

export function CardAccentBar({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block h-1 w-10 rounded-full bg-brand-red ${className}`}
      aria-hidden
    />
  );
}
