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
    name: "Chadha Construction",
    category: "General Contractor",
    logo: "/images/builders/chadha-construction.png",
    logoClassName: "h-16",
    logoImageClassName: "max-h-[3.25rem]",
    logoWidth: 140,
    logoHeight: 140,
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
