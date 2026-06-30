import type { HomeImageKey } from "@/lib/site/images";

export const business = {
  name: "Elite Builders IX",
  legalName: "Elite Builders IX",
  displayName: "Elite Builders",
  slogan: "Build your dream",
  heroLocationLine: "Bay Area · Central Valley · Southern California",
  heroHeadline: "Framing California's Future.",
  companyStory:
    "Family-owned framing-first specialists since 2012 — known for integrity, straight answers, and experienced crews who treat every structure like their own across the Bay Area, Central Valley, and Southern California.",
  phone: "1 (209) 484-2743",
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
    title: "Remodeling",
    slug: "remodeling",
    href: "/services/remodeling",
    shortDescription:
      "Structural modifications, renovations, and upgrades to existing residential and commercial spaces.",
    icon: "clipboard",
    image: "customKitchenRemodel",
  },
  {
    title: "Home Addition Construction",
    slug: "home-addition-construction",
    href: "/services/home-addition-construction",
    shortDescription:
      "Room expansions, second stories, and structural additions that integrate seamlessly with your existing home.",
    icon: "building",
    image: "twoStoryHomeFramingExterior",
  },
  {
    title: "Home Building",
    slug: "home-building",
    href: "/services/home-building",
    shortDescription:
      "Custom and production new home construction — framing-first builds across Northern California.",
    icon: "hammer",
    image: "customHomeFramingCrew",
  },
  {
    title: "Luxury Home Building",
    slug: "luxury-home-building",
    href: "/services/luxury-home-building",
    shortDescription:
      "High-end custom homes built with framing-first precision for homeowners who expect excellence.",
    icon: "building",
    image: "luxuryHomeInterior",
  },
  {
    title: "Fence Building",
    slug: "fence-building",
    href: "/services/fence-building",
    shortDescription:
      "Durable wood and composite fences — privacy, security, and curb appeal built to last.",
    icon: "fence",
    image: "deckPorch",
  },
  {
    title: "Deck Construction",
    slug: "deck-construction",
    href: "/services/deck-construction",
    shortDescription:
      "Custom wood and composite decks built with the same structural precision we bring to every build.",
    icon: "fence",
    image: "deckPorch",
  },
  {
    title: "Patio Construction",
    slug: "patio-construction",
    href: "/services/patio-construction",
    shortDescription:
      "Patios and covered outdoor living spaces designed for California entertaining.",
    icon: "layers",
    image: "patioDoorsOutdoorLiving",
  },
  {
    title: "Tiny Home Building",
    slug: "tiny-home-building",
    href: "/services/tiny-home-building",
    shortDescription:
      "Tiny homes and ADUs — compact, code-compliant builds for extra living space on your property.",
    icon: "building",
    image: "residentialWallFramingSky",
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
  isPlaceholder?: boolean;
  profile?: TeamMemberProfile;
};

/** Homepage team cards — add members here when names and headshots are ready. */
export const teamMembers: TeamMember[] = [
  {
    id: "fernando-gradilla",
    name: "Fernando Gradilla",
    role: "Owner",
    initials: "FG",
    profile: {
      experience: "Construction & framing background",
      bio: "Fernando built his career in construction long before Elite Builders — learning the trade on job sites across Northern California. During a difficult time in his life, he met the Lord, and his Christian faith became the foundation for how he leads today. He founded Elite Builders on no cutting corners, real integrity, and promises kept — treating every residential and commercial project with the honesty and care he'd want on his own home.",
    },
  },
];

/** Top utility bar — hides on scroll (Arlington-style). */
export const utilityNavLinks = [
  { label: "Service Areas", href: "/service-areas" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Projects", href: "/projects" },
] as const;

export const serviceMenuGroups = [
  {
    title: "Remodeling & Additions",
    description:
      "Renovations, structural modifications, and home additions for growing families.",
    href: "/services/remodeling",
    links: [
      { label: "Remodeling", href: "/services/remodeling" },
      { label: "Home Addition Construction", href: "/services/home-addition-construction" },
    ],
  },
  {
    title: "New Construction",
    description:
      "Custom homes, luxury builds, and tiny homes — framing-first construction across Northern California.",
    href: "/services/home-building",
    links: [
      { label: "Home Building", href: "/services/home-building" },
      { label: "Luxury Home Building", href: "/services/luxury-home-building" },
      { label: "Tiny Home Building", href: "/services/tiny-home-building" },
    ],
  },
  {
    title: "Outdoor Structures",
    description:
      "Decks, patios, and fences — outdoor living built with structural precision.",
    href: "/services",
    links: [
      { label: "Deck Construction", href: "/services/deck-construction" },
      { label: "Patio Construction", href: "/services/patio-construction" },
      { label: "Fence Building", href: "/services/fence-building" },
      { label: "All Services", href: "/services" },
    ],
  },
] as const;

/** Flat service list for mobile nav — matches Elite Builders' official service lineup. */
export const serviceNavLinks = services.map((service) => ({
  label: service.title,
  href: service.href,
}));

export const whyUsNavLinks = [
  { label: "Why Choose Elite Builders", href: "/#why-us" },
  { label: "Home Building Expertise", href: "/services/home-building" },
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
