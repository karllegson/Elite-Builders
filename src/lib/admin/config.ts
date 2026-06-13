export const siteConfig = {
  name: "Elite Builders IX",
  shortName: "Elite Builders IX",
  supportEmail: "support@elitebuildersco.com",
  defaultUserRole: "Administrator",
} as const;

export type AdminNavSubItem = {
  label: string;
  href: string;
};

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  phase: 1 | 2 | 3;
  children?: AdminNavSubItem[];
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "layout-dashboard", phase: 1 },
  {
    label: "Posts",
    href: "/admin/posts",
    icon: "file-text",
    phase: 2,
    children: [
      { label: "All Posts", href: "/admin/posts" },
      { label: "Add Post", href: "/admin/posts/new" },
      { label: "Categories", href: "/admin/posts/categories" },
      { label: "Tags", href: "/admin/posts/tags" },
    ],
  },
  { label: "Media", href: "/admin/media", icon: "image", phase: 3 },
  { label: "Pages", href: "/admin/pages", icon: "files", phase: 2 },
  { label: "Post Widget", href: "/admin/post-widgets", icon: "layout-grid", phase: 3 },
  { label: "Forms", href: "/admin/forms", icon: "clipboard-list", phase: 3 },
  { label: "Bookings", href: "/admin/bookings", icon: "calendar-check", phase: 3 },
  { label: "Service Areas", href: "/admin/service-areas", icon: "map-pin", phase: 3 },
  { label: "FAQs", href: "/admin/faqs", icon: "help-circle", phase: 3 },
  { label: "Reviews", href: "/admin/reviews", icon: "star", phase: 3 },
  { label: "SEO", href: "/admin/seo", icon: "search", phase: 3 },
  { label: "Site Config", href: "/admin/site-config", icon: "sliders-horizontal", phase: 3 },
  { label: "Appearance", href: "/admin/appearance", icon: "palette", phase: 3 },
  { label: "Plugins", href: "/admin/plugins", icon: "plug", phase: 3 },
  { label: "Users", href: "/admin/users", icon: "users", phase: 3 },
  { label: "Tools", href: "/admin/tools", icon: "wrench", phase: 3 },
];

export const adminSettingsNav: AdminNavItem = {
  label: "Settings",
  href: "/admin/settings",
  icon: "settings",
  phase: 1,
};

/** Page titles shown in the content header bar below the admin toolbar */
export const adminPageTitles: Record<string, string> = {
  "/admin": "Administration",
  "/admin/posts": "Posts",
  "/admin/posts/new": "Add Post",
  "/admin/posts/categories": "Categories",
  "/admin/posts/tags": "Tags",
  "/admin/media": "Media",
  "/admin/pages": "Pages",
  "/admin/post-widgets": "Post Widget",
  "/admin/forms": "Forms",
  "/admin/bookings": "Bookings",
  "/admin/service-areas": "Service Areas",
  "/admin/faqs": "FAQs",
  "/admin/reviews": "Reviews",
  "/admin/seo": "SEO",
  "/admin/site-config": "Site Config",
  "/admin/appearance": "Appearance",
  "/admin/plugins": "Plugins",
  "/admin/users": "Users",
  "/admin/tools": "Tools",
  "/admin/settings": "Settings",
};
