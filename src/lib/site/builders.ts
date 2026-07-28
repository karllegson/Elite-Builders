/** Production builders and general contractors Elite Builders IX frames for. */
export type Builder = {
  name: string;
  /** Short descriptor of the type of builder. */
  category: string;
  /** Logo path under public/ */
  logo: string;
  /** Optional container height class override. */
  logoClassName?: string;
  /** Optional image max-height class override. */
  logoImageClassName?: string;
  /** Skip Next.js image optimization (best for thin-line logos). */
  logoUnoptimized?: boolean;
  /** Render logo exactly as provided — no marquee grayscale/multiply. */
  logoPreserveOriginal?: boolean;
  logoWidth?: number;
  logoHeight?: number;
};

export const builders: Builder[] = [
  {
    name: "City Ventures",
    category: "Production Builder",
    logo: "/images/builders/city-ventures-dark.svg",
    logoImageClassName: "max-h-11",
  },
  {
    name: "Thomas James Homes",
    category: "Custom Home Builder",
    logo: "/images/builders/thomas-james-homes.jpg",
    logoClassName: "h-16",
    logoImageClassName: "max-h-14",
    logoWidth: 120,
    logoHeight: 120,
  },
  {
    name: "Riviera Development Company",
    category: "Development Company",
    logo: "/images/builders/riviera-development-company.png",
    logoClassName: "h-14",
    logoImageClassName: "max-h-11",
    logoWidth: 220,
    logoHeight: 82,
  },
  {
    name: "Branagh Development",
    category: "Development Company",
    logo: "/images/builders/branagh-development.png",
    logoClassName: "h-[2.75rem] sm:h-12",
    logoPreserveOriginal: true,
    logoUnoptimized: true,
    logoWidth: 584,
    logoHeight: 172,
  },
  {
    name: "Durkin Inc",
    category: "General Contractor",
    logo: "/images/builders/durkin-inc.png",
    logoImageClassName: "max-h-10",
  },
  {
    name: "Precision General",
    category: "General Contractor",
    logo: "/images/builders/precision-general.png",
    logoImageClassName: "max-h-10",
  },
];

export const buildersIntro =
  "Production builders and general contractors across Northern California trust Elite Builders IX as their rough-carpentry subcontractor — from single custom homes to multi-plan production communities.";
