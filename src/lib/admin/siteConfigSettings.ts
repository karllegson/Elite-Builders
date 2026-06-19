import { business } from "@/lib/site/config";

export const SITE_CONFIG_STORAGE_KEY = "elite-builders-site-config-v1";
export const SITE_CONFIG_UPDATED_EVENT = "elite-builders-site-config-updated";

export type SiteConfigFieldType = "text" | "textarea" | "select";

export type SiteConfigOption = {
  value: string;
  label: string;
};

export type SiteConfigField = {
  key: string;
  label: string;
  type: SiteConfigFieldType;
  help?: string;
  options?: SiteConfigOption[];
};

export type SiteConfigSection = {
  id: string;
  label: string;
  heading: string;
  description: string;
  fields: SiteConfigField[];
};

export type SiteConfigValues = Record<string, string>;

const yesNoDefaultOptions: SiteConfigOption[] = [
  { value: "no", label: "No ( default )" },
  { value: "yes", label: "Yes ( default )" },
];

export const siteConfigSections: SiteConfigSection[] = [
  {
    id: "business-info",
    label: "Business Info",
    heading: "Your company information.",
    description: "Configure the information displayed on your site.",
    fields: [{ key: "businessName", label: "Business Name", type: "text" }],
  },
  {
    id: "contact-info",
    label: "Contact Info",
    heading: "The contact information that will be displayed on the website.",
    description: "Configure phone, location, and map links.",
    fields: [
      { key: "phoneMain", label: "Phone Number", type: "text" },
      { key: "phoneLocation", label: "Phone Location", type: "text" },
      { key: "mainAddressLine1", label: "1st Address Line 1", type: "text" },
      { key: "mainAddressLine2", label: "1st Address Line 2", type: "text" },
      { key: "cityStateZip", label: "City, State, Zip", type: "text" },
      { key: "phoneGoogleMapsUrl", label: "1st Address Map (iframe) URL", type: "textarea" },
    ],
  },
  {
    id: "general",
    label: "General",
    heading: "General settings.",
    description: "Configure preloaders and generic behavior.",
    fields: [
      {
        key: "preloaderAnimation",
        label: "Preloader Animation",
        type: "select",
        options: [
          { value: "preloader-9", label: "Preloader 9" },
          { value: "preloader-3", label: "Preloader 3" },
          { value: "custom", label: "Custom" },
        ],
      },
      { key: "customPreloaderImage", label: "Custom Preloader Image URL", type: "text" },
    ],
  },
  {
    id: "announcement-banner",
    label: "Announcement Banner",
    heading: "Shows content at the top of the page.",
    description: "Leave fields blank to disable the announcement banner.",
    fields: [
      { key: "announcementBannerContent", label: "Banner Content", type: "textarea" },
      { key: "announcementBannerLink", label: "Banner Link", type: "text" },
      { key: "announcementBannerText", label: "Banner Link Text", type: "text" },
    ],
  },
  {
    id: "logo",
    label: "Logo",
    heading: "Controls the logo area.",
    description: "Configure desktop and mobile logo behavior.",
    fields: [
      { key: "logoImage", label: "Logo Image URL", type: "text" },
      { key: "logoMobileImage", label: "Desktop Mobile Menu Logo URL", type: "text" },
      { key: "logoTitleText", label: "Logo Title Text", type: "text" },
      { key: "mobileLogoWidth", label: "Mobile Logo Width", type: "text" },
      { key: "mobileLogoHeight", label: "Mobile Logo Height", type: "text" },
    ],
  },
  {
    id: "header",
    label: "Header",
    heading: "Controls the header area.",
    description: "Header, sticky, and mobile controls.",
    fields: [
      {
        key: "headerPhoneEnabled",
        label: "Menu Header Phone Number",
        type: "select",
        options: yesNoDefaultOptions,
      },
      {
        key: "mobileHeaderLogoLocation",
        label: "Mobile Header Logo Location",
        type: "select",
        options: [
          { value: "middle", label: "Middle ( Default )" },
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      {
        key: "menuHeaderSticky",
        label: "Menu Header Sticky",
        type: "select",
        options: yesNoDefaultOptions,
      },
    ],
  },
  {
    id: "search",
    label: "Search",
    heading: "Controls the search functionality.",
    description: "Choose the search modal behavior.",
    fields: [
      {
        key: "searchModal",
        label: "Search Modal",
        type: "select",
        options: [
          { value: "custom", label: "Custom" },
          { value: "default", label: "Default" },
        ],
      },
    ],
  },
  {
    id: "main-menu",
    label: "Main Menu",
    heading: "Controls the main menu area.",
    description: "Main menu animation and CTA controls.",
    fields: [
      {
        key: "mainMenuAnimation",
        label: "Menu Main Animation",
        type: "select",
        options: [
          { value: "rotate-y", label: "Rotate Y" },
          { value: "slide-down", label: "Slide Down" },
        ],
      },
      { key: "mainMenuTopCtaText", label: "Mobile Menu Top CTA Text", type: "text" },
      { key: "mainMenuTopCtaLink", label: "Mobile Menu Top CTA Link", type: "text" },
      { key: "mainMenuCtaText", label: "CTA Button Text", type: "text" },
      { key: "mainMenuCtaLink", label: "CTA Button Custom URL", type: "text" },
    ],
  },
  {
    id: "homepage",
    label: "Homepage",
    heading: "Controls the homepage area.",
    description: "Homepage hero and form settings connected to the main page.",
    fields: [
      {
        key: "homepageBannerType",
        label: "Home Banner Type",
        type: "select",
        options: [
          { value: "hero-static", label: "Hero w/ Static Image" },
          { value: "video", label: "Video" },
          { value: "slideshow", label: "Slideshow" },
        ],
      },
      { key: "homepageBannerHeadline", label: "Banner Form Headline", type: "text" },
      { key: "homepageBannerSeoTitle", label: "Banner Form SEO title", type: "text" },
      { key: "heroLocationLine", label: "Hero Location Line", type: "text" },
      { key: "heroHeadline", label: "Hero Headline", type: "text" },
      { key: "homepagePrimaryCtaText", label: "Primary CTA Text", type: "text" },
      { key: "homepagePrimaryCtaLink", label: "Primary CTA Link", type: "text" },
    ],
  },
  {
    id: "homepage-banner-centered",
    label: "Homepage Banner Centered",
    heading: "Controls the homepage centered banner area.",
    description: "Centered hero card fields.",
    fields: [
      { key: "centeredHeadline", label: "Headline", type: "textarea" },
      { key: "centeredCtaText", label: "CTA Text", type: "text" },
      { key: "centeredCtaUrl", label: "CTA URL", type: "text" },
      { key: "centeredLogoImage", label: "Logo Image URL", type: "text" },
      { key: "centeredBgImage", label: "Background Image URL", type: "text" },
    ],
  },
  {
    id: "homepage-banner-static",
    label: "Homepage Banner Static",
    heading: "Controls the homepage area.",
    description: "Static banner content fields.",
    fields: [
      { key: "staticBannerText1", label: "Banner Text 1", type: "textarea" },
      { key: "staticBannerText2", label: "Banner Text 2", type: "textarea" },
      { key: "staticBannerCtaText", label: "Banner CTA Text", type: "text" },
      { key: "staticBannerCtaLink", label: "Banner CTA Link", type: "text" },
    ],
  },
  {
    id: "homepage-banner-slideshow",
    label: "Homepage Banner Slideshow",
    heading: "Controls the homepage area.",
    description: "Slideshow controls.",
    fields: [
      {
        key: "slideshowAnimation",
        label: "Slide Animation",
        type: "select",
        options: [
          { value: "fade", label: "Fade" },
          { value: "slide", label: "Slide" },
        ],
      },
      {
        key: "slideshowMaxSlides",
        label: "Maximum Slides",
        type: "select",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
        ],
      },
    ],
  },
  {
    id: "homepage-banner-video",
    label: "Homepage Banner Video",
    heading: "Controls the homepage video area.",
    description: "Configure homepage hero video.",
    fields: [
      { key: "homepageVideoUrl", label: "Video URL", type: "text" },
      { key: "homepageVideoOverlayColor", label: "Overlay Color", type: "text" },
    ],
  },
  {
    id: "title-bar",
    label: "Title Bar",
    heading: "Controls the page title / breadcrumbs area.",
    description: "Title bar and breadcrumb display options.",
    fields: [
      {
        key: "titleBarLocation",
        label: "Title Bar Location",
        type: "select",
        options: [
          { value: "outside", label: "Outside of page content" },
          { value: "inside", label: "Inside of page content" },
        ],
      },
      { key: "titleBarSubtitle", label: "Title Bar Subtitle", type: "text" },
      { key: "titleBarBackgroundImage", label: "Title Bar Background Image URL", type: "text" },
    ],
  },
  {
    id: "sidebar",
    label: "Sidebar",
    heading: "Controls the sidebar area.",
    description: "Sidebar placement and style options.",
    fields: [
      {
        key: "sidebarLocation",
        label: "Sidebar Location",
        type: "select",
        options: [
          { value: "right", label: "Right ( default )" },
          { value: "left", label: "Left" },
          { value: "none", label: "None" },
        ],
      },
      {
        key: "sidebarStyle",
        label: "Sidebar Style",
        type: "select",
        options: [
          { value: "overlay", label: "Overlay" },
          { value: "default", label: "Default" },
        ],
      },
    ],
  },
  {
    id: "call-to-action-button",
    label: "Call-to-Action Button",
    heading: "A button that can be displayed with the [cta-btn] shortcode.",
    description: "Configure the button label and destination.",
    fields: [
      { key: "ctaButtonText", label: "CTA Button Text", type: "text" },
      { key: "ctaButtonPage", label: "CTA Page", type: "text" },
    ],
  },
  {
    id: "page-call-to-action",
    label: "Page Call-to-Action",
    heading: "A call-to-action section that can be displayed with the [cta] shortcode.",
    description: "Configure page CTA content and links.",
    fields: [
      { key: "pageCtaTitle", label: "CTA Title", type: "text" },
      { key: "pageCtaSupportingTitle", label: "CTA Supporting Title", type: "textarea" },
      { key: "pageCtaButtonText", label: "CTA Button Text", type: "text" },
      { key: "pageCtaButtonLink", label: "CTA Button Link", type: "text" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    heading: "Website footer settings.",
    description: "Footer text block controls.",
    fields: [
      { key: "footerHeading", label: "Footer Heading", type: "text" },
      { key: "footerText", label: "Footer Text", type: "textarea" },
      { key: "footerTextSpan", label: "Footer Text Span", type: "text" },
    ],
  },
  {
    id: "footer-map-section",
    label: "Footer Map Section",
    heading: "Configuration of the footer map section.",
    description: "Map and service area options for footer.",
    fields: [
      { key: "mapApiKey", label: "Map Api Key", type: "text" },
      { key: "mapMainUrl", label: "Map Main URL", type: "text" },
      { key: "mapFormShortcode", label: "Contact Form", type: "text" },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    heading: "Controls the review options.",
    description: "Choose review date position.",
    fields: [
      {
        key: "reviewDatePosition",
        label: "Review Date Position",
        type: "select",
        options: [
          { value: "top", label: "Top ( default )" },
          { value: "bottom", label: "Bottom" },
          { value: "hidden", label: "Hidden" },
        ],
      },
    ],
  },
  {
    id: "social-media",
    label: "Social Media",
    heading: "Social media profile URLs.",
    description: "If empty, no icon will be displayed.",
    fields: [
      { key: "socialFacebook", label: "Facebook", type: "text" },
      { key: "socialTwitter", label: "Twitter", type: "text" },
      { key: "socialInstagram", label: "Instagram", type: "text" },
      { key: "socialLinkedIn", label: "LinkedIn", type: "text" },
      { key: "socialYoutube", label: "YouTube", type: "text" },
      { key: "socialPinterest", label: "Pinterest", type: "text" },
    ],
  },
  {
    id: "before-you-go-popup",
    label: "Before You Go Popup",
    heading: "Controls settings for before you go popup.",
    description: "Popup message and CTA options.",
    fields: [
      {
        key: "popupEnabled",
        label: "Enable",
        type: "select",
        options: yesNoDefaultOptions,
      },
      { key: "popupHeadline", label: "Headline", type: "text" },
      { key: "popupSubHeadline", label: "Sub headline", type: "text" },
      { key: "popupText", label: "Text", type: "textarea" },
      { key: "popupButtonText", label: "Mobile CTA Text", type: "text" },
      { key: "popupButtonUrl", label: "Mobile CTA URL", type: "text" },
      { key: "popupDelay", label: "Delay", type: "text", help: "Seconds after mouse leaves before popup appears." },
      {
        key: "popupUseCookie",
        label: "Use Cookie",
        type: "select",
        options: yesNoDefaultOptions,
        help: "Keeps popup closed until browser session ends.",
      },
    ],
  },
  {
    id: "galleries",
    label: "Galleries",
    heading: "Controls settings for galleries.",
    description: "Gallery modal form controls.",
    fields: [
      { key: "galleryModalFormShortcode", label: "Modal Form Shortcode", type: "text" },
      { key: "galleryModalFormHeadline", label: "Modal Form Headline", type: "text" },
    ],
  },
  {
    id: "off-canvas-sidebar",
    label: "Off-Canvas Sidebar",
    heading: "Off-canvas desktop sidebar",
    description: "Configure off-canvas sidebar behavior and content.",
    fields: [
      {
        key: "offCanvasEnabled",
        label: "Enable",
        type: "select",
        options: yesNoDefaultOptions,
      },
      { key: "offCanvasToggleSelectors", label: "Toggle Selectors", type: "text" },
      { key: "offCanvasContent", label: "Content", type: "textarea" },
      { key: "offCanvasFooterContent", label: "Footer Content", type: "textarea" },
    ],
  },
  {
    id: "mobile-bottom-menu",
    label: "Mobile Bottom Menu",
    heading: "Controls mobile bottom menu settings.",
    description: "Configure mobile bottom menu behavior.",
    fields: [
      {
        key: "mobileBottomMenuEnabled",
        label: "Enable",
        type: "select",
        options: yesNoDefaultOptions,
      },
      { key: "mobileBottomDisplayScroll", label: "Display Scroll Position", type: "text" },
    ],
  },
  {
    id: "extra-section",
    label: "Extra Section",
    heading: "Enables an extra section of service area footer.",
    description: "Configure extra section titles.",
    fields: [{ key: "extraSections", label: "Sections", type: "textarea" }],
  },
  {
    id: "google-fonts",
    label: "Google Fonts",
    heading: "The Google font(s) to be loaded by the theme.",
    description: "Preconnect resource hints are added automatically.",
    fields: [{ key: "googleFontsUrl", label: "Font URL", type: "text" }],
  },
  {
    id: "libraries",
    label: "Libraries",
    heading: "3rd party libraries to be loaded by the theme.",
    description: "Toggle optional library bundles.",
    fields: [
      {
        key: "libraryAosEnabled",
        label: "Enable AOS",
        type: "select",
        options: yesNoDefaultOptions,
      },
    ],
  },
  {
    id: "l10-troubleshooting",
    label: "Troubleshooting",
    heading: "Tools for debugging.",
    description: "Low-level troubleshooting toggles.",
    fields: [
      {
        key: "debugBarEnabled",
        label: "Enable Debug Bar",
        type: "select",
        options: yesNoDefaultOptions,
      },
    ],
  },
];

export function migrateLegacyValues(values: SiteConfigValues): SiteConfigValues {
  const next = { ...values };

  if (next.businessName === "Lux Renovations") {
    next.businessName = business.name;
  }

  if (next.logoTitleText === "Lux Renovations Logo") {
    next.logoTitleText = `${business.name} Logo`;
  }

  if (next.footerHeading === "About Lux Renovations") {
    next.footerHeading = `About ${business.displayName}`;
  }

  if (next.homepageBannerSeoTitle?.includes("Lux Renovation")) {
    next.homepageBannerSeoTitle = `Get a ${business.displayName} Quote Today!`;
  }

  if (next.heroLocationLine?.includes("MA, VA, DC")) {
    next.heroLocationLine = business.heroLocationLine;
  }

  if (next.mainMenuTopCtaLink?.includes("lux-renovations")) {
    next.mainMenuTopCtaLink = "/contact";
  }

  return next;
}

export function createDefaultSiteConfigValues(): SiteConfigValues {
  return {
    businessName: business.name,
    phoneMain: business.phone,
    phoneLocation: "Top",
    mainAddressLine1: business.address.street,
    mainAddressLine2: `${business.address.city}, ${business.address.state}`,
    cityStateZip: business.address.zip,
    phoneGoogleMapsUrl: "",
    preloaderAnimation: "preloader-9",
    customPreloaderImage: "",
    announcementBannerContent: "",
    announcementBannerLink: "",
    announcementBannerText: "",
    logoImage: "/logo.png",
    logoMobileImage: "/logo.png",
    logoTitleText: `${business.name} Logo`,
    mobileLogoWidth: "9rem",
    mobileLogoHeight: "5.5rem",
    headerPhoneEnabled: "yes",
    mobileHeaderLogoLocation: "middle",
    menuHeaderSticky: "yes",
    searchModal: "custom",
    mainMenuAnimation: "rotate-y",
    mainMenuTopCtaText: "Request a Free Estimate",
    mainMenuTopCtaLink: "/#estimate",
    mainMenuCtaText: "Request a Free Estimate",
    mainMenuCtaLink: "/#estimate",
    homepageBannerType: "video",
    homepageBannerHeadline: "Get Your Free Quote",
    homepageBannerSeoTitle: `Get a ${business.displayName} Quote Today!`,
    heroLocationLine: business.heroLocationLine,
    heroHeadline: business.heroHeadline,
    homepagePrimaryCtaText: "Speak with Our Team",
    homepagePrimaryCtaLink: "/contact",
    centeredHeadline: "",
    centeredCtaText: "Free Estimate",
    centeredCtaUrl: "/contact",
    centeredLogoImage: "",
    centeredBgImage: "",
    staticBannerText1: "",
    staticBannerText2: "",
    staticBannerCtaText: "",
    staticBannerCtaLink: "",
    slideshowAnimation: "fade",
    slideshowMaxSlides: "2",
    homepageVideoUrl: "",
    homepageVideoOverlayColor: "#1a2744",
    titleBarLocation: "outside",
    titleBarSubtitle: "",
    titleBarBackgroundImage: "",
    sidebarLocation: "right",
    sidebarStyle: "overlay",
    ctaButtonText: "Request a Free Estimate",
    ctaButtonPage: "/contact",
    pageCtaTitle: `Get Started With ${business.displayName}`,
    pageCtaSupportingTitle: "",
    pageCtaButtonText: "Request a Free Estimate",
    pageCtaButtonLink: "/contact",
    footerHeading: `About ${business.displayName}`,
    footerText: business.companyStory,
    footerTextSpan: "Auto ( default )",
    mapApiKey: "",
    mapMainUrl: "",
    mapFormShortcode: "",
    reviewDatePosition: "top",
    socialFacebook: "",
    socialTwitter: "",
    socialInstagram: "",
    socialLinkedIn: "",
    socialYoutube: "",
    socialPinterest: "",
    popupEnabled: "no",
    popupHeadline: "",
    popupSubHeadline: "",
    popupText: "",
    popupButtonText: "Contact Us",
    popupButtonUrl: "/contact",
    popupDelay: "1",
    popupUseCookie: "no",
    galleryModalFormShortcode: "",
    galleryModalFormHeadline: "Free Estimate, Call Now!",
    offCanvasEnabled: "no",
    offCanvasToggleSelectors: ".off-canvas-sidebar-toggle > a",
    offCanvasContent: "",
    offCanvasFooterContent: "",
    mobileBottomMenuEnabled: "yes",
    mobileBottomDisplayScroll: "300",
    extraSections: "Section 1\nSection 2\nSection 3",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Fira+Sans",
    libraryAosEnabled: "no",
    debugBarEnabled: "no",
  };
}

export function readSiteConfigValues(): SiteConfigValues {
  const defaults = createDefaultSiteConfigValues();

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const raw = window.localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!raw) {
      return defaults;
    }

    const parsed = JSON.parse(raw) as SiteConfigValues;
    return migrateLegacyValues({ ...defaults, ...parsed });
  } catch {
    return defaults;
  }
}

export function writeSiteConfigValues(values: SiteConfigValues): void {
  if (typeof window === "undefined") {
    return;
  }

  const migrated = migrateLegacyValues(values);
  window.localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(migrated));
  window.dispatchEvent(new Event(SITE_CONFIG_UPDATED_EVENT));
}
