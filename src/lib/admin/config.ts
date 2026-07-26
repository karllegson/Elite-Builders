export const siteConfig = {
  name: "Elite Builders IX",
  shortName: "Elite Builders IX",
  supportEmail: "marketing@elitebuildersco.com",
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
  {
    label: "Pages",
    href: "/admin/pages",
    icon: "files",
    phase: 2,
    children: [
      { label: "All Pages", href: "/admin/pages" },
      { label: "Add Page", href: "/admin/pages/new" },
      { label: "Default Pages", href: "/admin/pages/default" },
    ],
  },
  { label: "Post Widget", href: "/admin/post-widgets", icon: "layout-grid", phase: 3 },
  {
    label: "Forms",
    href: "/admin/forms",
    icon: "clipboard-list",
    phase: 3,
    children: [
      { label: "Elite Forms", href: "/admin/forms" },
      { label: "Contact Submissions", href: "/admin/forms/entries" },
    ],
  },
  { label: "Bookings", href: "/admin/bookings", icon: "calendar-check", phase: 3 },
  {
    label: "Showcase",
    href: "/admin/showcase",
    icon: "monitor",
    phase: 1,
    children: [
      { label: "All Projects", href: "/admin/showcase" },
      { label: "Add Project", href: "/admin/showcase/new" },
    ],
  },
  {
    label: "Service Areas",
    href: "/admin/service-areas",
    icon: "map-pin",
    phase: 3,
    children: [
      { label: "All Service Area", href: "/admin/service-areas" },
      { label: "Add New Service Area", href: "/admin/service-areas/new" },
      { label: "Sorting", href: "/admin/service-areas/sorting" },
      { label: "Nested View", href: "/admin/service-areas/nested" },
    ],
  },
  {
    label: "FAQs",
    href: "/admin/faqs",
    icon: "help-circle",
    phase: 1,
    children: [
      { label: "All FAQs", href: "/admin/faqs" },
      { label: "Add New FAQ", href: "/admin/faqs/new" },
      { label: "Categories", href: "/admin/faqs/categories" },
    ],
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: "star",
    phase: 3,
    children: [
      { label: "All Reviews", href: "/admin/reviews" },
      { label: "Add New Review", href: "/admin/reviews/new" },
      { label: "Categories", href: "/admin/reviews/categories" },
    ],
  },
  { label: "SEO", href: "/admin/seo", icon: "search", phase: 3 },
  { label: "Analytics", href: "/admin/analytics", icon: "bar-chart", phase: 2 },
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
  "/admin/pages/new": "Add Page",
  "/admin/pages/default": "Pages",
  "/admin/post-widgets": "Post Widget Settings",
  "/admin/forms": "Elite Forms",
  "/admin/forms/new": "Add New Form",
  "/admin/forms/entries": "Contact Submissions",
  "/admin/forms/[id]/edit": "Edit Form",
  "/admin/forms/[id]/settings": "Form Settings",
  "/admin/bookings": "Bookings",
  "/admin/showcase": "Lobby Showcase",
  "/admin/showcase/new": "Add Showcase Project",
  "/admin/service-areas": "Service Areas",
  "/admin/service-areas/new": "Add New Service Area",
  "/admin/service-areas/sorting": "Sorting",
  "/admin/service-areas/nested": "Nested View",
  "/admin/services/[category]": "Edit Service Page",
  "/admin/services/[category]/[subslug]": "Edit Service Sub-Page",
  "/admin/faqs": "All FAQs",
  "/admin/faqs/new": "Add New FAQ",
  "/admin/faqs/categories": "Categories",
  "/admin/reviews": "Reviews",
  "/admin/reviews/new": "Add New Review",
  "/admin/reviews/categories": "Categories",
  "/admin/seo": "SEO",
  "/admin/analytics": "Analytics",
  "/admin/site-config": "Site Config",
  "/admin/appearance": "Appearance",
  "/admin/plugins": "Plugins",
  "/admin/users": "Users",
  "/admin/tools": "Tools",
  "/admin/settings": "Settings",
};
