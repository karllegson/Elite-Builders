import type { HomeImageKey } from "@/lib/site/images";
import { getServiceSubPagesForCategory } from "@/lib/site/serviceSubPages";

export const business = {
  name: "Elite Builders IX",
  legalName: "Elite Builders IX",
  displayName: "Elite Builders IX",
  slogan: "Build your dream",
  heroLocationLine: "Serving California Since 2012",
  heroHeadline: "Framing Contractor Serving the Bay Area & Central Valley",
  companyStory:
    "Family-owned framing-first specialists since 2012 — known for integrity, straight answers, and experienced crews who treat every structure like their own across the Bay Area, Central Valley, and Southern California.",
  phone: "(209) 484-2743",
  phoneHref: "tel:+12094842743",
  email: "marketing@elitebuildersco.com",
  foundedYear: 2012,
  address: {
    street: "450 Burney Street",
    city: "Modesto",
    state: "CA",
    zip: "95354",
    region: "Central Valley",
    full: "450 Burney Street, Modesto, CA 95354",
  },
  license: "CSLB #970551",
  licenseNumber: "970551",
  domain: "https://www.elitebuildersco.com",
} as const;

export type SiteService = {
  title: string;
  slug: string;
  href: string;
  shortDescription: string;
  icon: "hammer" | "building" | "layers" | "fence" | "clipboard";
  image: HomeImageKey;
};

export const services: SiteService[] = [
  {
    title: "Framing Contractor",
    slug: "framing-contractor",
    href: "/services/framing-contractor",
    shortDescription:
      "Custom, production, and addition framing — residential, commercial, rough, and structural work across California.",
    icon: "clipboard",
    image: "framingContractorPlanning",
  },
  {
    title: "Home Builder",
    slug: "home-builder",
    href: "/services/home-builder",
    shortDescription:
      "Custom home building, production home framing, and home additions — framing-first builds across California.",
    icon: "hammer",
    image: "customHomeFramingCrew",
  },
  {
    title: "Deck Builder",
    slug: "deck-builder",
    href: "/services/deck-builder",
    shortDescription:
      "Wood deck construction and deck replacement built with the same structural precision we bring to framing.",
    icon: "fence",
    image: "deckPorch",
  },
  {
    title: "Siding Contractor",
    slug: "siding-contractor",
    href: "/services/siding-contractor",
    shortDescription:
      "Siding installation and siding replacement — exterior protection built to withstand California weather.",
    icon: "building",
    image: "sidingInstallation",
  },
];

export type ServiceArea = {
  city: string;
  slug: string;
  href: string;
  blurb: string;
  region: "Central Valley" | "Bay Area" | "Southern California" | "Eastern Sierra";
};

export const serviceAreas: ServiceArea[] = [
  {
    city: "Stockton",
    slug: "stockton",
    href: "/service-areas/stockton",
    blurb: "Residential and commercial framing throughout Stockton and San Joaquin County.",
    region: "Central Valley",
  },
  {
    city: "Manteca",
    slug: "manteca",
    href: "/service-areas/manteca",
    blurb: "Serving Manteca's fast-growing new construction communities.",
    region: "Central Valley",
  },
  {
    city: "Tracy",
    slug: "tracy",
    href: "/service-areas/tracy",
    blurb: "Quality framing and outdoor living projects for Tracy homeowners.",
    region: "Central Valley",
  },
  {
    city: "Turlock",
    slug: "turlock",
    href: "/service-areas/turlock",
    blurb: "Trusted craftsmanship for Turlock homes, additions, and remodels.",
    region: "Central Valley",
  },
  {
    city: "Ceres",
    slug: "ceres",
    href: "/service-areas/ceres",
    blurb: "Rough framing and remodeling for Ceres homeowners and builders.",
    region: "Central Valley",
  },
  {
    city: "Oakdale",
    slug: "oakdale",
    href: "/service-areas/oakdale",
    blurb: "Custom home framing and remodels throughout Oakdale and eastern Stanislaus County.",
    region: "Central Valley",
  },
  {
    city: "Riverbank",
    slug: "riverbank",
    href: "/service-areas/riverbank",
    blurb: "Residential framing and deck construction for Riverbank families.",
    region: "Central Valley",
  },
  {
    city: "Mountain House",
    slug: "mountain-house",
    href: "/service-areas/mountain-house",
    blurb: "Production-builder framing for Mountain House's fast-growing master-planned communities.",
    region: "Central Valley",
  },
  {
    city: "San Jose",
    slug: "san-jose",
    href: "/service-areas/san-jose",
    blurb: "Framing contractor services for San Jose new builds, additions, and remodels.",
    region: "Bay Area",
  },
  {
    city: "Livermore",
    slug: "livermore",
    href: "/service-areas/livermore",
    blurb: "Residential and commercial framing throughout Livermore and the Tri-Valley.",
    region: "Bay Area",
  },
  {
    city: "Fremont",
    slug: "fremont",
    href: "/service-areas/fremont",
    blurb: "Structural framing and remodeling across Fremont and the East Bay.",
    region: "Bay Area",
  },
  {
    city: "Pleasanton",
    slug: "pleasanton",
    href: "/service-areas/pleasanton",
    blurb: "Quality framing for Pleasanton custom homes and commercial projects.",
    region: "Bay Area",
  },
  {
    city: "Dublin",
    slug: "dublin",
    href: "/service-areas/dublin",
    blurb: "Framing, siding, and deck services for Dublin homeowners.",
    region: "Bay Area",
  },
  {
    city: "Walnut Creek",
    slug: "walnut-creek",
    href: "/service-areas/walnut-creek",
    blurb: "Select framing and contracting projects in Walnut Creek and Contra Costa County.",
    region: "Bay Area",
  },
  {
    city: "San Ramon",
    slug: "san-ramon",
    href: "/service-areas/san-ramon",
    blurb: "Framing and production-builder partnerships across San Ramon and the Tri-Valley.",
    region: "Bay Area",
  },
  {
    city: "San Bruno",
    slug: "san-bruno",
    href: "/service-areas/san-bruno",
    blurb: "Residential and multi-family framing for San Bruno and the Peninsula.",
    region: "Bay Area",
  },
  {
    city: "Bay Area",
    slug: "bay-area",
    href: "/service-areas/bay-area",
    blurb: "Greater Bay Area coverage — from the Tri-Valley to the South Bay and beyond.",
    region: "Bay Area",
  },
  {
    city: "Pasadena",
    slug: "pasadena",
    href: "/service-areas/pasadena",
    blurb: "Rough framing, remodeling, and siding for Pasadena and the greater Southern California region.",
    region: "Southern California",
  },
  {
    city: "Mammoth Lakes",
    slug: "mammoth-lakes",
    href: "/service-areas/mammoth-lakes",
    blurb: "Mountain-region framing and custom builds serving Mammoth Lakes and the Eastern Sierra.",
    region: "Eastern Sierra",
  },
];

function pickServiceAreas(slugs: string[]): ServiceArea[] {
  return slugs
    .map((slug) => serviceAreas.find((area) => area.slug === slug))
    .filter((area): area is ServiceArea => area != null);
}

/** Curated subset for the homepage grid — full list lives on /service-areas */
export const featuredHomeServiceAreas = pickServiceAreas([
  "san-jose",
  "livermore",
  "fremont",
  "stockton",
  "tracy",
  "pasadena",
]);

/** Curated subset for the footer — no scroll list */
export const featuredFooterServiceAreas = pickServiceAreas([
  "san-jose",
  "livermore",
  "fremont",
  "stockton",
  "tracy",
  "pasadena",
]);

export type TeamMemberTestimonial = {
  quote: string;
  author: string;
};

export type TeamMemberProfile = {
  experience?: string;
  jobsDone?: string;
  bio: string;
  testimonial?: TeamMemberTestimonial;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  imageSrc?: string;
  /** CSS object-position for circular crops (e.g. "50% 20%"). */
  imageObjectPosition?: string;
  /** Display-only zoom on the website crop — does not change the source file. */
  imageScale?: number;
  isPlaceholder?: boolean;
  profile?: TeamMemberProfile;
};

/**
 * Homepage team cards.
 * Headshots live in /public/images/team/. Replace placeholder names/roles when ready.
 */
export const teamMembers: TeamMember[] = [
  {
    id: "fernando-gradilla",
    name: "Fernando Gradilla",
    role: "Owner",
    initials: "FG",
    imageSrc: "/images/team/fernando-gradilla.webp",
    // Low Y keeps the edited headroom visible (center-crop was cutting it off).
    imageObjectPosition: "51% 15%",
    imageScale: 1.08,
    profile: {
      experience: "Construction & framing background",
      bio: "Fernando built his career in construction long before Elite Builders — learning the trade on job sites across Northern California. During a difficult time in his life, he met the Lord, and his Christian faith became the foundation for how he leads today. He founded Elite Builders on no cutting corners, real integrity, and promises kept — treating every residential and commercial project with the honesty and care he'd want on his own home.",
    },
  },
  {
    id: "juan-carlos-marin",
    name: "Juan Carlos Marin",
    role: "Team Member",
    initials: "JC",
    imageSrc: "/images/team/team-member-01.webp",
    imageObjectPosition: "50% 18%",
    imageScale: 1.44,
  },
  {
    id: "ramon-baltazar",
    name: "Ramon Baltazar",
    role: "Team Member",
    initials: "RB",
    imageSrc: "/images/team/team-member-02.webp",
    imageObjectPosition: "47% 22%",
    imageScale: 1.24,
  },
  {
    id: "maria-zavalza",
    name: "Maria Zavalza",
    role: "Team Member",
    initials: "MZ",
    imageSrc: "/images/team/team-member-03.webp",
    imageObjectPosition: "50% 48%",
    imageScale: 1,
  },
  {
    id: "edith-pelayo",
    name: "Edith Pelayo",
    role: "Team Member",
    initials: "EP",
    imageSrc: "/images/team/team-member-04.webp",
    imageObjectPosition: "50% 26%",
    imageScale: 1,
  },
  {
    id: "francisco-gradilla",
    name: "Francisco Gradilla",
    role: "Team Member",
    initials: "FC",
    imageSrc: "/images/team/team-member-05.webp",
    imageObjectPosition: "2% 38%",
    imageScale: 1,
  },
];

/** Top utility bar — hides on scroll (Arlington-style). */
export const utilityNavLinks = [
  { label: "Service Areas", href: "/service-areas" },
  { label: "Blog", href: "/blog" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Projects", href: "/projects" },
] as const;

/** Desktop mega-menu — one group per main service category, sub-services as links. */
const serviceMenuIcons: Record<(typeof services)[number]["slug"], string> = {
  "framing-contractor": "hardhat",
  "home-builder": "home",
  "deck-builder": "fence",
  "siding-contractor": "panels",
};

export const serviceMenuGroups = services.map((service) => ({
  title: service.title,
  href: service.href,
  icon: serviceMenuIcons[service.slug],
  links: getServiceSubPagesForCategory(service.slug).map((subPage) => ({
    label: subPage.label,
    href: subPage.href,
  })),
}));

/** Flat service list for mobile nav — matches Elite Builders' official service lineup. */
export const serviceNavLinks = services.map((service) => ({
  label: service.title,
  href: service.href,
}));

export const whyUsNavLinks = [
  { label: "Why Choose Elite Builders", href: "/#why-us" },
  { label: "Framing Specialists", href: "/services/framing-contractor/custom-framing" },
  { label: "Meet Our Team", href: "/#team" },
  { label: "Featured Projects", href: "/projects" },
  { label: "Customer Reviews", href: "/#reviews" },
] as const;

export const aboutNavLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
] as const;
