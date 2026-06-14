/** Production builders and general contractors Elite Builders IX frames for. */
export type Builder = {
  name: string;
  /** Short descriptor of the type of builder. */
  category: string;
  /** Logo path under public/ */
  logo: string;
};

export const builders: Builder[] = [
  {
    name: "City Ventures",
    category: "Production Builder",
    logo: "/images/builders/city-ventures-dark.svg",
  },
  {
    name: "Thomas James Homes",
    category: "Custom Home Builder",
    logo: "/images/builders/thomas-james-homes.jpg",
  },
  {
    name: "Chadha Construction",
    category: "General Contractor",
    logo: "/images/builders/chadha-construction.png",
  },
  {
    name: "Durkin Inc",
    category: "General Contractor",
    logo: "/images/builders/durkin-inc.png",
  },
  {
    name: "Precision General",
    category: "General Contractor",
    logo: "/images/builders/precision-general.png",
  },
];

export const buildersIntro =
  "Production builders and general contractors across Northern California trust Elite Builders IX as their rough-carpentry subcontractor — from single custom homes to multi-plan production communities.";
