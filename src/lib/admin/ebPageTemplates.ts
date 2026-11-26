import { addMissingHeadingBars, stackH1OnFirstSection } from "@/lib/site/ebContent";

/** Short Version, line, H1 stacked on The Basics; a short red bar under every heading. */
function finishTemplate(html: string): string {
  return addMissingHeadingBars(stackH1OnFirstSection(html));
}

/**
 * Starter content for Elite-format pages, filled in for one city (and service).
 * Every "WRITE:" line is a prompt for the writer; the Page check flags any left behind.
 */

export const EB_WRITE_PROMPT = "WRITE:";

/** Framing services in website order; `slug` is the city sub-page slug. */
export const EB_FRAMING_SERVICES = [
  { name: "Residential Framing", slug: "residential-framing", href: "/services/framing-contractor/residential-framing" },
  { name: "New Construction Framing", slug: "new-construction-framing", href: "/services/framing-contractor/new-construction-framing" },
  { name: "Custom Home Framing", slug: "custom-home-framing", href: "/services/framing-contractor/custom-framing" },
  { name: "Home Addition Framing", slug: "home-addition-framing", href: "/services/home-builder/home-addition-construction" },
  { name: "Rough Framing", slug: "rough-framing", href: "/services/framing-contractor/rough-framing" },
  { name: "Structural Framing", slug: "structural-framing", href: "/services/framing-contractor/structural-framing" },
] as const;

/** Counties for the cities Elite serves, so the template can name the wider area. */
const CITY_COUNTIES: Record<string, string> = {
  modesto: "Stanislaus County",
  turlock: "Stanislaus County",
  ceres: "Stanislaus County",
  oakdale: "Stanislaus County",
  riverbank: "Stanislaus County",
  patterson: "Stanislaus County",
  salida: "Stanislaus County",
  hughson: "Stanislaus County",
  stockton: "San Joaquin County",
  tracy: "San Joaquin County",
  manteca: "San Joaquin County",
  "mountain house": "San Joaquin County",
  lodi: "San Joaquin County",
  ripon: "San Joaquin County",
  escalon: "San Joaquin County",
  "san jose": "Santa Clara County",
  fremont: "Alameda County",
  livermore: "Alameda County",
  pleasanton: "Alameda County",
  dublin: "Alameda County",
  "san ramon": "Contra Costa County",
  "walnut creek": "Contra Costa County",
  richmond: "Contra Costa County",
  "san bruno": "San Mateo County",
  pasadena: "Los Angeles County",
  "mammoth lakes": "Mono County",
};

export function countyForCity(city: string): string | null {
  return CITY_COUNTIES[city.trim().toLowerCase()] ?? null;
}

function cityLabel(city: string) {
  return city.trim() ? `${city.trim()}, CA` : "City, CA";
}

function card(title: string, alt: string, buttonHref: string, buttonLabel: string) {
  return [
    `<div class="eb-card">`,
    `  <img src="" alt="${alt}" title="${title}">`,
    `  <h3>${title}</h3>`,
    `  <p>${EB_WRITE_PROMPT} 2 to 3 sentences on this service in this city.</p>`,
    `  [button href="${buttonHref}"]${buttonLabel}[/button]`,
    `</div>`,
  ].join("\n");
}

const TILES = [
  `<ul class="eb-tiles">`,
  `  <li><strong>Framing-First Specialists</strong> ${EB_WRITE_PROMPT} one sentence.</li>`,
  `  <li><strong>Family-Owned Since 2012</strong> ${EB_WRITE_PROMPT} one sentence.</li>`,
  `  <li><strong>Licensed California Contractor</strong> ${EB_WRITE_PROMPT} one sentence (CSLB #970551).</li>`,
  `  <li><strong>Built For Builders And Homeowners</strong> ${EB_WRITE_PROMPT} one sentence.</li>`,
  `</ul>`,
].join("\n");

type CityTemplateInput = {
  city: string;
  /** Existing sub-pages of this city: service slug -> public URL. */
  subPageHrefs?: Record<string, string>;
};

/** Full city landing page in the Elite format, with all six service cards. */
export function buildEbCityTemplate({ city, subPageHrefs = {} }: CityTemplateInput): string {
  return finishTemplate(buildCityBody(city, subPageHrefs));
}

function buildCityBody(city: string, subPageHrefs: Record<string, string>): string {
  const place = cityLabel(city);
  const name = city.trim() || "City";
  const county = countyForCity(name) ?? "the county";
  const cards = EB_FRAMING_SERVICES.map((service) =>
    card(
      service.name,
      `${service.name.toLowerCase()} in ${place}`,
      subPageHrefs[service.slug] ?? service.href,
      `More on ${service.name}`,
    ),
  ).join("\n\n");

  return [
    `<div class="eb-short">`,
    `  <p>${EB_WRITE_PROMPT} 1 to 2 sentences. Who Elite Builders IX is and what we frame in ${place}.</p>`,
    `</div>`,
    ``,
    `<h1>Framing Contractor In ${place}</h1>`,
    ``,
    `<h2 id="the-basics">${EB_WRITE_PROMPT} heading about framing in ${name}</h2>`,
    ``,
    `<p>${EB_WRITE_PROMPT} 2 to 4 paragraphs. What we build in ${place}, who we work for, and something true and local about ${name} (neighbourhoods, housing, building department). Mention ${county} once.</p>`,
    ``,
    `[estimate_button]`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="our-services">Framing Services In ${place}</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `<p>${EB_WRITE_PROMPT} 1 to 2 paragraphs introducing the services.</p>`,
    ``,
    cards,
    ``,
    `<hr>`,
    ``,
    `<h2 id="the-elite-difference">Why ${name} Builders And Homeowners Choose Elite Builders IX</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `[stats]`,
    ``,
    `<p>${EB_WRITE_PROMPT} 1 to 2 paragraphs with real proof (projects, builders, crew size).</p>`,
    ``,
    TILES,
    ``,
    `<hr>`,
    ``,
    `<h2 id="what-clients-say">What Clients In ${name} Say</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `[reviews amount="3"]`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="our-process">How A Framing Job Works In ${name}</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `<ul>`,
    `  <li><strong>Estimate:</strong> ${EB_WRITE_PROMPT} one sentence.</li>`,
    `  <li><strong>Plan review:</strong> ${EB_WRITE_PROMPT} one sentence.</li>`,
    `  <li><strong>Framing:</strong> ${EB_WRITE_PROMPT} one sentence.</li>`,
    `  <li><strong>Inspection:</strong> ${EB_WRITE_PROMPT} one sentence naming the ${name} building department.</li>`,
    `  <li><strong>Handoff:</strong> ${EB_WRITE_PROMPT} one sentence.</li>`,
    `</ul>`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="questions">Framing Questions In ${place}</h2>`,
    ``,
    `<p>${EB_WRITE_PROMPT} one sentence introducing the FAQs.</p>`,
    ``,
    `[faqs category="${EB_WRITE_PROMPT} faq-category-slug"]`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="where-we-work">Serving ${place} And Nearby Communities</h2>`,
    ``,
    `<p>${EB_WRITE_PROMPT} name the nearby towns we also serve.</p>`,
    ``,
    `[map]`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="book-an-estimate">Get A Free Framing Estimate In ${place}</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `<p>${EB_WRITE_PROMPT} 1 short paragraph.</p>`,
    ``,
    `[estimate_button]`,
  ].join("\n");
}

type SubPageTemplateInput = {
  city: string;
  service: string;
  /** Public URL of the main service page for the card button. */
  serviceHref?: string;
  /** Public URL of the parent city page. */
  cityHref?: string;
};

/** One service in one city (e.g. Residential Framing In Modesto, CA). Mirrors the Modesto sub-pages. */
export function buildEbSubPageTemplate(input: SubPageTemplateInput): string {
  return finishTemplate(buildSubPageBody(input));
}

function buildSubPageBody({ city, service, serviceHref, cityHref }: SubPageTemplateInput): string {
  const place = cityLabel(city);
  const name = city.trim() || "City";
  const svc = service.trim() || "Service";
  const svcLower = svc.toLowerCase();
  const county = countyForCity(name) ?? "the county";
  const known = EB_FRAMING_SERVICES.find((item) => item.name.toLowerCase() === svcLower);
  const buttonHref = serviceHref ?? known?.href ?? "/services/framing-contractor";

  return [
    `<div class="eb-short">`,
    `  <p>${EB_WRITE_PROMPT} 1 to 2 sentences. What ${svcLower} Elite Builders IX does in ${place}.</p>`,
    `</div>`,
    ``,
    `<h1>${svc} In ${place}</h1>`,
    ``,
    `<h2 id="the-basics">${EB_WRITE_PROMPT} heading about ${svcLower} in ${name}</h2>`,
    ``,
    `<p>${EB_WRITE_PROMPT} 3 to 4 paragraphs. What ${svcLower} covers, the kinds of ${name} projects it suits, and one local detail. Mention ${county} once.</p>`,
    ``,
    `[estimate_button]`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="our-services">${svc} Services For ${place} Projects</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `<p>${EB_WRITE_PROMPT} 2 to 3 paragraphs: what is included (walls, floors, roof, headers, hardware...).</p>`,
    ``,
    card(`${svc} In ${place}`, `${svcLower} crew working in ${place}`, buttonHref, `More on Our ${svc} Services`),
    ``,
    `<img src="" alt="${EB_WRITE_PROMPT} describe the photo" title="${svc} In ${place}">`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="the-elite-difference">Why ${name} Clients Choose Elite Builders IX For ${svc}</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `[stats]`,
    ``,
    `<p>${EB_WRITE_PROMPT} 2 to 3 paragraphs with real proof.</p>`,
    ``,
    TILES,
    ``,
    `<hr>`,
    ``,
    `<h2 id="what-clients-say">${svc} Reviews From ${place} Clients</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `[reviews amount="3"]`,
    ``,
    `[button href="${cityHref ?? "/"}"]More About Framing In ${name}[/button]`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="questions">Frequently Asked Questions About ${svc} In ${place}</h2>`,
    ``,
    `<p>${EB_WRITE_PROMPT} one sentence introducing the FAQs.</p>`,
    ``,
    `[faqs category="${EB_WRITE_PROMPT} faq-category-slug"]`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="where-we-work">Serving ${place} And Nearby Communities</h2>`,
    ``,
    `<p>${EB_WRITE_PROMPT} name the nearby towns we also serve.</p>`,
    ``,
    `[map]`,
    ``,
    `<hr>`,
    ``,
    `<h2 id="book-an-estimate">Start Your ${name} ${svc} Project</h2>`,
    `<h3>${EB_WRITE_PROMPT} subheading</h3>`,
    ``,
    `<p>${EB_WRITE_PROMPT} 1 to 2 short paragraphs.</p>`,
    ``,
    `[estimate_button]`,
  ].join("\n");
}

/**
 * Service name from a sub-page title, whatever way it was typed:
 * "Residential Framing", "Modesto Residential Framing", "Residential Framing In Modesto, CA".
 */
export function serviceNameFromTitle(title: string, city: string): string {
  let name = title.replace(/\s*\|.*$/, "").trim();
  if (city.trim()) {
    const cityPattern = city.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    name = name
      .replace(new RegExp(`\\s+in\\s+${cityPattern}(,\\s*[A-Z]{2})?$`, "i"), "")
      .replace(new RegExp(`^${cityPattern}(,\\s*[A-Z]{2})?\\s+`, "i"), "");
  }
  return name.trim();
}
