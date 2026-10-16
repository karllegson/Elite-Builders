import type { HomeImageKey } from "@/lib/site/images";

/** Real Elite Builders IX project portfolio — completed and in-progress work. */
export type ProjectType =
  | "Apartments"
  | "Condominiums"
  | "Custom Homes"
  | "Production Homes"
  | "Multi-Family"
  | "Single Family"
  | "Roof Framing"
  | "Remodeling"
  | "Framing";

export type ProjectStatus = "completed" | "current";

export type Project = {
  id: string;
  name: string;
  /** General location — kept conservative where the exact city isn't confirmed. */
  location: string;
  /** General contractor / production builder we performed the work for. */
  builder: string;
  type: ProjectType;
  status: ProjectStatus;
  /** Optional link to a service-area city page when the location is confirmed. */
  citySlug?: string;
  image: HomeImageKey;
  blurb: string;
};

export const completedProjects: Project[] = [
  {
    id: "moffet-road-apartments",
    name: "2125 Moffet Road",
    location: "Northern California",
    builder: "Riviera Development Company",
    type: "Apartments",
    status: "completed",
    image: "commercialRoofFramingAerial",
    blurb:
      "Full rough-carpentry framing package for a multi-building apartment community.",
  },
  {
    id: "highland-ridge-condominiums",
    name: "Highland Ridge Condominiums",
    location: "Northern California",
    builder: "City Ventures",
    type: "Condominiums",
    status: "completed",
    image: "twoStoryHomeFramingExterior",
    blurb:
      "Structural framing for a multi-story condominium development delivered on schedule.",
  },
  {
    id: "tjh-custom-homes",
    name: "Custom Homes",
    location: "Northern California",
    builder: "Thomas James Homes",
    type: "Custom Homes",
    status: "completed",
    image: "customHomeFramingCrew",
    blurb:
      "Precision framing for a series of architect-designed custom homes.",
  },
  {
    id: "stony-point",
    name: "Stony Point",
    location: "Northern California",
    builder: "Precision General",
    type: "Multi-Family",
    status: "completed",
    image: "residentialWallFramingSky",
    blurb:
      "Rough carpentry and structural framing for a multi-family residential project.",
  },
];

export const currentProjects: Project[] = [
  {
    id: "minarets-road",
    name: "6060 Minarets Rd",
    location: "Northern California",
    builder: "Durkin Inc",
    type: "Custom Homes",
    status: "current",
    image: "customHomeFramingInterior",
    blurb:
      "Custom-home framing package built to architectural and structural specifications.",
  },
  {
    id: "heritage-park",
    name: "Heritage Park",
    location: "Northern California",
    builder: "Precision General",
    type: "Multi-Family",
    status: "current",
    image: "framingContractorPlanning",
    blurb:
      "Ongoing structural framing for a multi-family residential community.",
  },
  {
    id: "tjh-multiple-custom",
    name: "Thomas James Homes (Multiple Custom Homes)",
    location: "Northern California",
    builder: "Thomas James Homes",
    type: "Custom Homes",
    status: "current",
    image: "luxuryHomeInterior",
    blurb:
      "Concurrent custom-home framing across multiple active build sites.",
  },
  {
    id: "san-bruno-city-ventures",
    name: "San Bruno",
    location: "San Bruno, CA",
    builder: "City Ventures",
    type: "Multi-Family",
    status: "current",
    citySlug: "san-bruno",
    image: "residentialWindowInstallation",
    blurb:
      "Framing for a Peninsula residential development with City Ventures.",
  },
];

export const allProjects: Project[] = [...currentProjects, ...completedProjects];

/** Projects tied to a specific service-area city (for city pages). */
export function projectsForCity(citySlug: string): Project[] {
  return allProjects.filter((project) => project.citySlug === citySlug);
}
