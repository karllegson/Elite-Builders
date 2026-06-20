export type FrontendAdminBarItem = {
  label: string;
  href: string;
  /** Resolved on the client for service area pages (slug → admin record id). */
  resolveServiceAreaId?: boolean;
};

type RouteMatcher = {
  test: (pathname: string) => boolean;
  items: (pathname: string) => FrontendAdminBarItem[];
};

const PAGE_EDIT_ROUTES: Record<string, string> = {
  "/": "home",
  "/about": "about-us",
  "/contact": "contact-us",
  "/blog": "blog",
};

const ROUTE_MATCHERS: RouteMatcher[] = [
  {
    test: (pathname) => pathname === "/",
    items: () => [
      { label: "Edit Page", href: "/admin/pages/new?page=home" },
      { label: "Dashboard", href: "/admin" },
    ],
  },
  {
    test: (pathname) => pathname === "/service-areas",
    items: () => [
      { label: "Edit Service Areas", href: "/admin/service-areas" },
      { label: "Dashboard", href: "/admin" },
    ],
  },
  {
    test: (pathname) => /^\/service-areas\/[^/]+\/[^/]+\/?$/.test(pathname),
    items: () => [
      {
        label: "Edit Service Area",
        href: "/admin/service-areas",
        resolveServiceAreaId: true,
      },
      { label: "All Service Areas", href: "/admin/service-areas" },
      { label: "Dashboard", href: "/admin" },
    ],
  },
  {
    test: (pathname) => /^\/service-areas\/[^/]+\/?$/.test(pathname),
    items: () => [
      {
        label: "Edit Service Area",
        href: "/admin/service-areas",
        resolveServiceAreaId: true,
      },
      { label: "All Service Areas", href: "/admin/service-areas" },
      { label: "Dashboard", href: "/admin" },
    ],
  },
  {
    test: (pathname) => pathname === "/blog",
    items: () => [
      { label: "Edit Posts", href: "/admin/posts" },
      { label: "Dashboard", href: "/admin" },
    ],
  },
  {
    test: (pathname) => pathname === "/projects",
    items: () => [
      { label: "Edit Gallery", href: "/admin/gallery" },
      { label: "Dashboard", href: "/admin" },
    ],
  },
  {
    test: (pathname) => pathname.startsWith("/services"),
    items: () => [
      { label: "Edit Pages", href: "/admin/pages" },
      { label: "Dashboard", href: "/admin" },
    ],
  },
  {
    test: (pathname) => pathname in PAGE_EDIT_ROUTES,
    items: (pathname) => {
      const pageId = PAGE_EDIT_ROUTES[pathname];

      return [
        { label: "Edit Page", href: `/admin/pages/new?page=${pageId}` },
        { label: "Dashboard", href: "/admin" },
      ];
    },
  },
  {
    test: () => true,
    items: () => [{ label: "Dashboard", href: "/admin" }],
  },
];

export function getFrontendAdminBarItems(pathname: string): FrontendAdminBarItem[] {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const matcher = ROUTE_MATCHERS.find((route) => route.test(normalized));

  return matcher ? matcher.items(normalized) : [{ label: "Dashboard", href: "/admin" }];
}

export function getServiceAreaSlugFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/service-areas\/([^/]+)\/?$/);

  if (!match) {
    return null;
  }

  return decodeURIComponent(match[1]);
}
