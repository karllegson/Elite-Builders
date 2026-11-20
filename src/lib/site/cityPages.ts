import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";

/**
 * City landing pages — the reusable "Field Set" template.
 *
 * Each city gets its own config with genuinely local content (intro, services notes,
 * neighborhoods, FAQs, projects). Shared sections (why framing-first, process, builder
 * band) live in `cityPageShared` and are the same everywhere.
 *
 * Content the client still has to supply is wrapped in `clientTodo(...)`. Todos are
 * rendered as dashed notes for logged-in admins only and are hidden from the public,
 * so an unfinished page never shows placeholder text to visitors.
 *
 * Next step (CMS phase): move these fields onto the service-area record so editors can
 * fill them from the dashboard. Keep this shape so the view does not change.
 */

/* ── Placeholder helpers ─────────────────────────────────────── */

export type ClientTodo = { todo: string };

export function clientTodo(note: string): ClientTodo {
  return { todo: note };
}

export type Draft<T> = T | ClientTodo;

export function isClientTodo(value: unknown): value is ClientTodo {
  return typeof value === "object" && value !== null && "todo" in value;
}

/* ── Types ───────────────────────────────────────────────────── */

export type CityAudience = "homeowner" | "builder";

export type CityServiceIcon = "residential" | "new-construction" | "custom" | "rough" | "structural";

export type CityService = {
  title: string;
  description: string;
  href?: string;
  icon: CityServiceIcon;
  /** Who this service is mainly for — shown as small tags on the card. */
  audiences: CityAudience[];
  /** When set, the service is unconfirmed: shown to admins only, with this note. */
  pending?: ClientTodo;
};

export type CityProjectType = {
  value: string;
  label: string;
  audience: CityAudience;
  pending?: ClientTodo;
};

export type CityFaq = {
  question: string;
  answer: Draft<string>;
};

export type NearbyCity = {
  name: string;
  /** Service-area slug; linked only if that page is published. */
  slug?: string;
};

export type CityPageConfig = {
  /** Service-area slug in the CMS, e.g. "modesto-ca". */
  slug: string;
  city: string;
  county: string;
  region: "Central Valley" | "Bay Area" | "Southern California";
  /** True for the office city — drives "home base" copy and map marker. */
  isHomeBase: boolean;

  seo: { title: string; description: string };

  hero: {
    eyebrow: string;
    h1: string;
    subhead: string;
    image: { src: string; alt: string; objectPosition?: string };
    imageTodo?: ClientTodo;
  };

  /** Quick summary shown right after the trust bar. Keep it short — one sentence + 3 points. */
  localIntro: {
    heading: string;
    summary: string;
    points: { title: string; body: string }[];
    todos: ClientTodo[];
  };

  /** Framing Contractor sub-services offered in this city. */
  services: CityService[];

  projects: {
    heading: string;
    lede: string;
    /** Project ids from `lib/site/projects.ts`. Only label a project with this city once confirmed. */
    projectIds: string[];
    todo?: ClientTodo;
  };

  /** Tag used to pick reviews for this page from the Reviews module. */
  reviewTag: string;

  builderBand: {
    heading: string;
    body: string;
    points: Draft<string>[];
  };

  areas: {
    heading: string;
    lede: string;
    neighborhoods: Draft<string[]>;
    nearbyCities: NearbyCity[];
    /** City names (keys of CA_CITY_POINTS) shown on the local map. */
    mapCities: string[];
  };

  faq: {
    /** Optional FAQ category in the dashboard; when it has published FAQs they replace `items`. */
    categoryRef?: string;
    items: CityFaq[];
  };

  estimate: {
    heading: string;
    lede: string;
    defaultCity: string;
    projectTypes: CityProjectType[];
  };

  finalCta: { title: string; body: string };
};

/* ── Shared sections (same on every city page) ───────────────── */

export const cityPageShared = {
  whyFramingFirst: {
    heading: "Why framing-first matters",
    lede: "The frame is the first thing to disappear behind drywall — and everything else in the house depends on it.",
    image: {
      src: homeImages.twoStoryHomeFramingExterior.src,
      alt: "Two-story home with exterior walls, window openings, and roof framed, before sheathing",
      width: 483,
      height: 322,
    },
    /** Callouts are positioned as % of the image box. */
    callouts: [
      { x: 67, y: 24, label: "Roof framing carries roof loads down into the walls" },
      { x: 51, y: 58, label: "Headers over windows and doors, sized to the plans" },
      { x: 22, y: 63, label: "Plumb, square walls so drywall, cabinets, and trim fit" },
      { x: 63, y: 82, label: "Sill plates anchored to the foundation" },
    ],
    points: [
      {
        title: "Every trade builds on it",
        body: "Windows, roofing, drywall, cabinets, and trim all go in straighter and faster on a plumb, square frame.",
      },
      {
        title: "Mistakes get expensive later",
        body: "A framing problem found after drywall means tearing out finished work. Getting it right the first time protects the budget.",
      },
      {
        title: "It's an inspection milestone",
        body: "Framing has to pass inspection before the project moves on, so careful framing keeps the whole schedule moving.",
      },
    ],
  },

  process: {
    heading: "How a project works with us",
    lede: "Five clear steps from first call to a frame that's ready for the next trades.",
    steps: [
      {
        title: "Free estimate",
        body: "Call or send the form. We talk through the project, your timeline, and what you have so far — plans, engineering, or just an idea.",
        duration: clientTodo("Typical time from first call to estimate"),
      },
      {
        title: "Plan review",
        body: "We go through the plans and engineering and turn them into a clear framing scope and price, so you know what's included before work starts.",
        duration: clientTodo("Typical plan-review turnaround"),
      },
      {
        title: "Framing",
        body: "Our crews build the floors, walls, and roof system to the approved plans and structural engineering.",
        duration: clientTodo("Typical framing duration by project size"),
      },
      {
        title: "Inspection",
        body: "We prepare for the framing inspection with the local building department and take care of any corrections.",
        duration: clientTodo("How inspections are scheduled and how long they usually take"),
      },
      {
        title: "Handoff",
        body: "Once framing passes inspection, the structure is ready for the next trades — roofing, mechanicals, insulation, and drywall.",
        duration: clientTodo("What the handoff/walkthrough includes"),
      },
    ] as { title: string; body: string; duration: Draft<string> }[],
  },

  financing: {
    body: "Planning the budget? Financing is available for qualified homeowners through our partner RenoFi.",
    href: "/financing",
  },
} as const;

/* ── Modesto ─────────────────────────────────────────────────── */

const modesto: CityPageConfig = {
  slug: "modesto-ca",
  city: "Modesto",
  county: "Stanislaus",
  region: "Central Valley",
  isHomeBase: true,

  seo: {
    title: "Framing Contractor in Modesto, CA",
    description:
      "Modesto-based framing contractor (CSLB #970551) serving California since 2012. Residential, custom home & structural framing. Free estimates.",
  },

  hero: {
    eyebrow: "Modesto · Stanislaus County",
    h1: "Framing Contractor in Modesto, CA",
    subhead:
      "Residential, custom home, rough, and structural framing for homeowners, builders, and general contractors — from our office on Burney Street in Modesto.",
    image: {
      src: homeImages.residentialWallFramingSky.src,
      alt: "Wall and roof framing for a new home against a blue sky",
      objectPosition: "30% 50%",
    },
    imageTodo: clientTodo(
      "Replace the hero with a real Modesto job-site photo (landscape, at least 2000px wide, with permission to use).",
    ),
  },

  localIntro: {
    heading: "Modesto is our home base",
    summary: `A licensed framing contractor with our office right here on ${business.address.street.replace(/\s+Street$/, " St")} — serving California since ${business.foundedYear}.`,
    points: [
      {
        title: "Local office",
        body: "When your project is in Stanislaus County, our office is just down the road.",
      },
      {
        title: "Framing is our core trade",
        body: "Straight, square, code-compliant frames that every trade after us can build on.",
      },
      {
        title: "Homeowners & builders",
        body: "Custom home framing for homeowners, and a dependable framing sub for builders and GCs.",
      },
    ],
    todos: [
      clientTodo("Local building trends — where new homes and additions are going up in Modesto right now."),
      clientTodo("How quickly the team can visit a Stanislaus County job site for an estimate."),
      clientTodo("In the owner's words: why being based in Modesto matters to local clients."),
    ],
  },

  // Framing Contractor sub-services only (matches the site menu). Home Builder services are
  // intentionally left out until the client decides whether to keep that category.
  services: [
    {
      title: "Residential Framing",
      description: "Single-family and multi-family homes framed to plan — floors, walls, and roof systems.",
      href: "/services/framing-contractor/residential-framing",
      icon: "residential",
      audiences: ["homeowner", "builder"],
    },
    {
      title: "New Construction Framing",
      description: "Production and tract framing scheduled around your build calendar.",
      href: "/services/framing-contractor/new-construction-framing",
      icon: "new-construction",
      audiences: ["builder"],
    },
    {
      title: "Custom Home Framing",
      description: "Precision framing for architect-designed custom homes, built to the plans and engineering.",
      href: "/services/framing-contractor/custom-framing",
      icon: "custom",
      audiences: ["homeowner", "builder"],
    },
    {
      title: "Rough Framing",
      description: "Complete rough framing packages — floors, walls, and roof systems built to plan.",
      href: "/services/framing-contractor/rough-framing",
      icon: "rough",
      audiences: ["builder"],
    },
    {
      title: "Structural Framing",
      description: "Shear walls, beams, and load paths built to the structural engineer's plans.",
      href: "/services/framing-contractor/structural-framing",
      icon: "structural",
      audiences: ["homeowner", "builder"],
    },
  ],

  projects: {
    heading: "Recent work from our crews",
    lede: "A sample of framing projects for builders and homeowners across Northern California.",
    projectIds: ["tjh-custom-homes", "highland-ridge-condominiums", "moffet-road-apartments"],
    todo: clientTodo(
      "Add confirmed Modesto-area projects with real job-site photos (and permission to show them). Then retitle this section “Projects in and near Modesto”.",
    ),
  },

  reviewTag: "modesto-ca",

  builderBand: {
    heading: "Need a framing sub in the Modesto area?",
    body: "We frame for production builders, developers, and general contractors — from single custom homes to multi-family communities.",
    points: [
      `Licensed & insured · ${business.license}`,
      "Rough, structural, and new-construction framing packages",
      clientTodo("Confirm: certificate of insurance available on request"),
      clientTodo("Crew capacity / how many projects can run at once"),
    ],
  },

  areas: {
    heading: "Areas we serve near Modesto",
    lede: "From our Modesto office we cover Stanislaus County and the surrounding Central Valley.",
    neighborhoods: clientTodo(
      "List the Modesto neighborhoods the team has worked in (planning docs suggest Village One, College Area, Downtown — confirm before publishing).",
    ),
    nearbyCities: [
      { name: "Ceres", slug: "ceres" },
      { name: "Turlock", slug: "turlock" },
      { name: "Riverbank", slug: "riverbank" },
      { name: "Salida" },
      { name: "Oakdale", slug: "oakdale" },
      { name: "Manteca", slug: "manteca" },
      { name: "Stockton", slug: "stockton" },
    ],
    mapCities: ["Modesto", "Ceres", "Turlock", "Riverbank", "Salida", "Oakdale", "Manteca", "Ripon", "Stockton"],
  },

  faq: {
    categoryRef: "modesto",
    items: [
      {
        question: "Are you licensed and insured?",
        answer: `Yes. Elite Builders IX is a licensed California contractor (${business.license}) and is insured. You can verify the license on the Contractors State License Board website.`,
      },
      {
        question: "Do you work with homeowners or only with builders?",
        answer:
          "Both. We frame custom homes for homeowners, and we work as the framing subcontractor for builders, developers, and general contractors.",
      },
      {
        question: "Who handles permits and the framing inspection in Modesto?",
        answer: clientTodo(
          "Explain who pulls permits and schedules the framing inspection — City of Modesto vs. Stanislaus County (unincorporated areas) — and how Elite helps.",
        ),
      },
      {
        question: "How long does framing take?",
        answer: clientTodo("Typical framing timelines by project size, and what can change them."),
      },
      {
        question: "What affects the cost of framing?",
        answer: clientTodo("Main cost drivers, plus any typical ranges the owner is comfortable publishing."),
      },
      {
        question: "Where are you located, and which areas do you cover?",
        answer: `Our office is at ${business.address.full}. We serve Modesto and nearby cities including Ceres, Turlock, Riverbank, Salida, Oakdale, and Manteca, as well as the wider Central Valley, the Bay Area, and Southern California.`,
      },
      {
        question: "How do I get an estimate?",
        answer: `Use the form on this page or call ${business.phone}. Tell us about the project and send plans if you have them, and we'll follow up to talk through scope and next steps.`,
      },
    ],
  },

  estimate: {
    heading: "Get a free estimate for your Modesto project",
    lede: "Tell us about the framing you need — for your own home or for a project you're building. No pressure, no obligation.",
    defaultCity: "Modesto",
    projectTypes: [
      { value: "custom-home-framing", label: "Custom home framing", audience: "homeowner" },
      { value: "residential-framing", label: "Residential framing", audience: "homeowner" },
      { value: "structural-framing", label: "Structural framing", audience: "homeowner" },
      { value: "builder-framing-sub", label: "I'm a builder / GC", audience: "builder" },
      { value: "other", label: "Something else", audience: "homeowner" },
    ],
  },

  finalCta: {
    title: "Ready to talk about your Modesto project?",
    body: "Send us your plans or just an idea — we'll walk you through scope, schedule, and next steps.",
  },
};

const cityPages: CityPageConfig[] = [modesto];

export function getCityPageConfig(slug: string): CityPageConfig | null {
  return cityPages.find((page) => page.slug === slug) ?? null;
}

export function listCityPageSlugs(): string[] {
  return cityPages.map((page) => page.slug);
}
