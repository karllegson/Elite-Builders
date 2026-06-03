export const siteConfig = {
  name: "Elite Builders IX",
  supportEmail: "support@elitebuildersco.com",
} as const;

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  phase: 1 | 2 | 3;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "layout-dashboard", phase: 1 },
  { label: "Posts", href: "/admin/posts", icon: "file-text", phase: 2 },
  { label: "Pages", href: "/admin/pages", icon: "files", phase: 2 },
  { label: "Gallery", href: "/admin/gallery", icon: "images", phase: 3 },
  { label: "Service Areas", href: "/admin/service-areas", icon: "map-pin", phase: 3 },
  { label: "FAQs", href: "/admin/faqs", icon: "help-circle", phase: 3 },
  { label: "Reviews", href: "/admin/reviews", icon: "star", phase: 3 },
  { label: "Media", href: "/admin/media", icon: "image", phase: 3 },
];

export const adminSettingsNav: AdminNavItem = {
  label: "Settings",
  href: "/admin/settings",
  icon: "settings",
  phase: 1,
};
