import type { HomeImageKey } from "@/lib/site/images";

export const business = {
  name: "Elite Builders IX",
  legalName: "Elite Builders IX",
  displayName: "Elite Builders",
  slogan: "Build your dream",
  heroLocationLine: "Proudly based in Modesto, CA",
  heroHeadline: "Expert Home Framing in Modesto & Northern California",
  companyStory:
    "Family-owned in Modesto since 2012, Elite Builders is known for integrity, straight answers, and experienced crews who treat every structure like their own.",
  phone: "1 (209) 484-2743",
  phoneHref: "tel:+12094842743",
  email: "support@elitebuildersco.com",
  foundedYear: 2012,
  address: {
    street: "450 Burney Street",
    city: "Modesto",
    state: "CA",
    zip: "95354",
    region: "Central Valley",
    full: "450 Burney Street, Modesto, CA 95354",
  },
  license: "Licensed California Contractor",
  domain: "https://elitebuildersco.com",
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
    title: "Residential Framing",
    slug: "framing",
    href: "/services/framing",
    shortDescription:
      "Precision house framing for new construction, custom homes, additions, and remodels across the Central Valley.",
    icon: "hammer",
    image: "residentialRoofFraming",
  },
  {
    title: "Commercial Framing",
    slug: "framing",
    href: "/services/framing",
    shortDescription:
      "Structural framing for commercial buildings, multi-family projects, and tenant improvements — on schedule and to code.",
    icon: "building",
    image: "commercialRoofFramingAerial",
  },
  {
    title: "Siding Installation",
    slug: "siding",
    href: "/services/siding",
    shortDescription:
      "Fiber cement, wood, and composite siding installation and repair that protects your home and boosts curb appeal.",
    icon: "layers",
    image: "residentialWindowInstallation",
  },
  {
    title: "Deck Construction",
    slug: "decks",
    href: "/services/decks",
    shortDescription:
      "Custom wood and composite decks built to last through California summers — design, build, and repair.",
    icon: "fence",
    image: "patioDoorsOutdoorLiving",
  },
  {
    title: "General Contracting",
    slug: "general-contracting",
    href: "/services/general-contracting",
    shortDescription:
      "Full project management from plans and permits to final walkthrough for new builds and remodels.",
    icon: "clipboard",
    image: "customKitchenRemodel",
  },
];

export type ServiceArea = {
  city: string;
  slug: string;
  href: string;
  blurb: string;
  region: "Central Valley" | "Bay Area";
};

export const serviceAreas: ServiceArea[] = [
  {
    city: "Modesto",
    slug: "modesto",
    href: "/service-areas/modesto",
    blurb: "Our home base — framing, siding, and decks across every Modesto neighborhood.",
    region: "Central Valley",
  },
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
    blurb: "Framing and general contracting for Ceres homeowners and builders.",
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
    blurb: "Structural framing and general contracting across Fremont and the East Bay.",
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
    city: "Bay Area",
    slug: "bay-area",
    href: "/service-areas/bay-area",
    blurb: "Greater Bay Area coverage — from the Tri-Valley to the South Bay and beyond.",
    region: "Bay Area",
  },
];

function pickServiceAreas(slugs: string[]): ServiceArea[] {
  return slugs
    .map((slug) => serviceAreas.find((area) => area.slug === slug))
    .filter((area): area is ServiceArea => area != null);
}

/** Curated subset for the homepage grid — full list lives on /service-areas */
export const featuredHomeServiceAreas = pickServiceAreas([
  "modesto",
  "stockton",
  "manteca",
  "tracy",
  "san-jose",
  "livermore",
]);

/** Curated subset for the footer — no scroll list */
export const featuredFooterServiceAreas = pickServiceAreas([
  "modesto",
  "stockton",
  "san-jose",
  "livermore",
  "fremont",
  "tracy",
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

/** Homepage team cards — replace placeholders when names and headshots are ready. */
export const teamMembers: TeamMember[] = [
  {
    id: "fernando-gradilla",
    name: "Fernando Gradilla",
    role: "Owner",
    initials: "FG",
    profile: {
      experience: "Construction & framing background",
      bio: "Fernando built his career in construction long before Elite Builders — learning the trade on job sites across the Central Valley. During a difficult time in his life, he met the Lord, and his Christian faith became the foundation for how he leads today. He founded Elite Builders in Modesto on no cutting corners, real integrity, and promises kept — treating every residential and commercial project with the honesty and care he'd want on his own home.",
      testimonial: {
        quote:
          "Cleanest framing work the inspector had seen all year. Fernando's crew was professional from start to finish — zero drama.",
        author: "Michael R.",
      },
    },
  },
  {
    id: "team-slot-lead-framer",
    name: "Coming Soon",
    role: "Lead Framer",
    initials: "",
    isPlaceholder: true,
  },
  {
    id: "team-slot-project-manager",
    name: "Coming Soon",
    role: "Project Manager",
    initials: "",
    isPlaceholder: true,
  },
  {
    id: "team-slot-crew-lead",
    name: "Coming Soon",
    role: "Crew Lead",
    initials: "",
    isPlaceholder: true,
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
    title: "Residential Framing",
    description:
      "Precision house framing for new construction, custom homes, additions, and remodels.",
    href: "/services/framing",
    links: [
      { label: "New Home Framing", href: "/services/framing" },
      { label: "Custom Home Framing", href: "/services/framing" },
      { label: "Additions & Remodels", href: "/services/framing" },
    ],
  },
  {
    title: "Commercial Framing",
    description:
      "Structural framing for commercial buildings, multi-family projects, and tenant improvements.",
    href: "/services/framing",
    links: [
      { label: "Commercial Framing", href: "/services/framing" },
      { label: "Multi-Family Projects", href: "/services/framing" },
      { label: "Tenant Improvements", href: "/services/framing" },
    ],
  },
  {
    title: "Siding, Decks & More",
    description:
      "Siding, deck construction, and full general contracting — built with framing-first precision.",
    href: "/services",
    links: [
      { label: "Siding Installation", href: "/services/siding" },
      { label: "Deck Construction", href: "/services/decks" },
      { label: "General Contracting", href: "/services/general-contracting" },
    ],
  },
] as const;

export const whyUsNavLinks = [
  { label: "Why Choose Elite Builders", href: "/#why-us" },
  { label: "Meet Our Team", href: "/#team" },
  { label: "How It Works", href: "/#process" },
  { label: "Featured Projects", href: "/projects" },
  { label: "Customer Reviews", href: "/#reviews" },
] as const;

export const aboutNavLinks = [
  { label: "Our Story", href: "/about" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
] as const;
