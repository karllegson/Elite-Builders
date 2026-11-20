import { CA_CITY_POINTS, CA_COUNTY_LINES_PATH, CA_OUTLINE_PATH } from "@/lib/site/californiaMap";

type CityAreaMapProps = {
  /** City names to plot (keys of CA_CITY_POINTS). The first one is the focus city. */
  cities: string[];
  homeBase?: string;
};

/** Label placement per city so neighbouring labels don't collide. Defaults to the right. */
const LABEL_SIDE: Record<string, "left" | "right" | "above"> = {
  Modesto: "left",
  Manteca: "left",
  Ripon: "left",
  Salida: "left",
  Oakdale: "above",
};

/**
 * Lightweight blueprint-style local map — plain SVG reusing the pre-projected
 * California data, so no map library or third-party iframe is loaded.
 */
export function CityAreaMap({ cities, homeBase }: CityAreaMapProps) {
  const points = cities
    .map((name) => ({ name, point: CA_CITY_POINTS[name] }))
    .filter((entry): entry is { name: string; point: [number, number] } => Boolean(entry.point));

  if (points.length === 0) {
    return null;
  }

  const xs = points.map(({ point }) => point[0]);
  const ys = points.map(({ point }) => point[1]);
  const pad = 8;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad / 1.6;
  const width = Math.max(...xs) - Math.min(...xs) + pad * 2;
  const height = Math.max(...ys) - Math.min(...ys) + (pad / 1.6) * 2;
  const unit = width / 42; // keeps marker and label sizes consistent if the city set changes
  const font = 1.2 * unit;

  return (
    <figure className="bg-ink overflow-hidden rounded-3xl border border-solid border-white/10">
      <svg
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="block h-auto w-full"
        role="img"
        aria-labelledby="city-area-map-title"
      >
        <title id="city-area-map-title">{`Map of ${cities.join(", ")}`}</title>
        <defs>
          <pattern id="city-map-grid" width={2 * unit} height={2 * unit} patternUnits="userSpaceOnUse">
            <path
              d={`M ${2 * unit} 0 L 0 0 0 ${2 * unit}`}
              fill="none"
              stroke="rgb(255 255 255 / 0.05)"
              strokeWidth={0.06 * unit}
            />
          </pattern>
        </defs>
        <rect x={minX} y={minY} width={width} height={height} fill="url(#city-map-grid)" />
        <path d={CA_OUTLINE_PATH} fill="rgb(255 255 255 / 0.03)" stroke="rgb(255 255 255 / 0.25)" strokeWidth={0.12 * unit} />
        <path
          d={CA_COUNTY_LINES_PATH}
          fill="none"
          stroke="rgb(201 166 107 / 0.35)"
          strokeWidth={0.1 * unit}
          strokeDasharray={`${0.5 * unit} ${0.35 * unit}`}
        />

        {points.map(({ name, point: [x, y] }) => {
          const isHome = name === homeBase;
          const side = LABEL_SIDE[name] ?? "right";
          const gap = (isHome ? 1.9 : 1.1) * unit;
          const labelX = side === "left" ? x - gap : side === "right" ? x + gap : x;
          const labelY = side === "above" ? y - gap : y + font * 0.35;
          const anchor = side === "left" ? "end" : side === "right" ? "start" : "middle";

          return (
            <g key={name}>
              {isHome ? (
                <circle cx={x} cy={y} r={1.6 * unit} fill="none" stroke="#c9a66b" strokeWidth={0.18 * unit} />
              ) : null}
              <circle cx={x} cy={y} r={(isHome ? 0.85 : 0.5) * unit} fill={isHome ? "#e31b23" : "#ffffff"} />
              <text
                x={labelX}
                y={labelY}
                textAnchor={anchor}
                fontSize={isHome ? font * 1.25 : font}
                fontWeight={isHome ? 700 : 500}
                fill={isHome ? "#ffffff" : "rgb(255 255 255 / 0.78)"}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="flex items-center justify-between gap-3 border-t border-solid border-white/10 px-5 py-3 text-xs text-white/60">
        {homeBase ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-brand-red" aria-hidden />
            Our office · {homeBase}
          </span>
        ) : (
          <span>Cities we serve</span>
        )}
        <span className="spec-label !text-[0.625rem]">Not to scale</span>
      </figcaption>
    </figure>
  );
}
