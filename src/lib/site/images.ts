/** CMS-managed homepage/content images — migrate to Supabase Storage via `npm run seed:media`. */
export const homeImages = {
  residentialRoofFraming: {
    src: "/images/home/modesto-residential-roof-framing.png",
    alt: "Residential roof framing contractor leveling rafters in Northern California",
  },
  customKitchenRemodel: {
    src: "/images/home/modesto-custom-kitchen-remodel.png",
    alt: "Custom kitchen cabinet installation during a Northern California home remodel",
  },
  commercialRoofFramingAerial: {
    src: "/images/home/modesto-commercial-roof-framing-aerial.png",
    alt: "Aerial view of commercial roof framing on a Central Valley construction site",
  },
  framingContractorPlanning: {
    src: "/images/home/modesto-framing-contractor-planning.png",
    alt: "Framing contractor reviewing blueprints on a Northern California construction project",
  },
  customHomeFramingCrew: {
    src: "/images/home/modesto-custom-home-framing-crew.png",
    alt: "Elite Builders framing crew building a custom home in Northern California",
  },
  patioDoorsOutdoorLiving: {
    src: "/images/home/modesto-patio-doors-outdoor-living.png",
    alt: "Patio doors and outdoor living space installation in Northern California",
  },
  residentialWindowInstallation: {
    src: "/images/home/modesto-residential-window-installation.png",
    alt: "Residential window and door installation on a new Northern California home build",
  },
  luxuryHomeInterior: {
    src: "/images/home/modesto-luxury-home-interior.png",
    alt: "Finished luxury home interior with floor-to-ceiling windows in the Central Valley",
  },
  bayAreaNorthBayService: {
    src: "/images/home/bay-area-north-bay-service-area.jpg",
    alt: "San Francisco Bay Area and North Bay communities served by Elite Builders framing contractor",
  },
  residentialWallFramingSky: {
    src: "/images/home/modesto-residential-wall-framing-sky.webp",
    alt: "Residential wall framing against a clear blue sky on a Northern California new home build",
  },
  customHomeFramingInterior: {
    src: "/images/home/modesto-custom-home-framing-interior.webp",
    alt: "Interior custom home framing contractor wall studs and joists in Northern California",
  },
  twoStoryHomeFramingExterior: {
    src: "/images/home/modesto-two-story-home-framing-exterior.webp",
    alt: "Two-story residential home framing contractor project in Northern California",
  },
} as const;

export type HomeImageKey = keyof typeof homeImages;

/** All homepage gallery photos — originals plus newer framing shots for variety. */
export const homepageGalleryImageKeys: HomeImageKey[] = [
  "residentialRoofFraming",
  "residentialWallFramingSky",
  "customHomeFramingCrew",
  "customHomeFramingInterior",
  "commercialRoofFramingAerial",
  "twoStoryHomeFramingExterior",
  "framingContractorPlanning",
  "residentialWindowInstallation",
  "patioDoorsOutdoorLiving",
  "customKitchenRemodel",
  "luxuryHomeInterior",
];
