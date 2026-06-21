export type PageStatus = "published" | "draft";

export type PageListView = "all" | "published" | "draft" | "hidden" | "default";

export type PageTreeItem = {
  id: string;
  title: string;
  status: PageStatus;
  href?: string;
  suffix?: string;
  hidden?: boolean;
  isDefault?: boolean;
  children?: PageTreeItem[];
};

export type FlatPageRow = {
  id: string;
  title: string;
  status: PageStatus;
  href?: string;
  suffix?: string;
  hidden?: boolean;
  isDefault?: boolean;
  depth: number;
  hasChildren: boolean;
  parentId: string | null;
  isFirstSibling: boolean;
  isLastSibling: boolean;
};

export type PageRowMoreMenuAction =
  | "add-child-link"
  | "add-child-page"
  | "insert-before"
  | "insert-after"
  | "push-top"
  | "push-bottom"
  | "clone";

export type PageRowMoreMenuItem = {
  id: PageRowMoreMenuAction;
  label: string;
  disabled?: (row: FlatPageRow) => boolean;
};

export const PAGE_ROW_MORE_MENU_ITEMS: PageRowMoreMenuItem[] = [
  { id: "add-child-link", label: "Add Child Link" },
  { id: "add-child-page", label: "Add Child Page" },
  { id: "insert-before", label: "Insert Page Before" },
  { id: "insert-after", label: "Insert Page After" },
  {
    id: "push-top",
    label: "Push to Top",
    disabled: (row) => row.isFirstSibling,
  },
  {
    id: "push-bottom",
    label: "Push to Bottom",
    disabled: (row) => row.isLastSibling,
  },
  { id: "clone", label: "Clone" },
];

export const PAGE_LIST_VIEWS: { value: PageListView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "hidden", label: "Show Hidden" },
  { value: "default", label: "Default Pages" },
];

/** Live Next.js routes — read-only until a pages CMS is connected. */
export function getSitePages(): PageTreeItem[] {
  return [
    {
      id: "home",
      title: "Home",
      status: "published",
      href: "/",
      suffix: "Front Page",
      isDefault: true,
    },
    {
      id: "services",
      title: "Services",
      status: "published",
      href: "/services",
      children: [
        { id: "services-framing", title: "Rough Framing", status: "published", href: "/services/framing" },
        { id: "services-remodeling", title: "Remodeling", status: "published", href: "/services/remodeling" },
        { id: "services-siding", title: "Siding", status: "published", href: "/services/siding" },
        { id: "services-decks", title: "Decks & Porches", status: "published", href: "/services/decks" },
        {
          id: "services-general-contracting",
          title: "General Contracting",
          status: "draft",
          href: "/services/general-contracting",
        },
      ],
    },
    { id: "projects", title: "Projects", status: "published", href: "/projects" },
    { id: "service-areas", title: "Service Areas", status: "published", href: "/service-areas" },
    {
      id: "blog",
      title: "Blog",
      status: "published",
      href: "/blog",
      suffix: "Posts Page",
      isDefault: true,
    },
    { id: "about", title: "About", status: "published", href: "/about" },
    { id: "contact", title: "Contact", status: "published", href: "/contact" },
  ];
}

/** @deprecated Use getSitePages — kept for imports during transition. */
export function getPlaceholderPages(): PageTreeItem[] {
  return getSitePages();
}

function collectParentIds(items: PageTreeItem[]): string[] {
  const ids: string[] = [];

  for (const item of items) {
    if (item.children?.length) {
      ids.push(item.id, ...collectParentIds(item.children));
    }
  }

  return ids;
}

export function getDefaultExpandedPageIds(pages: PageTreeItem[]): string[] {
  return collectParentIds(pages);
}

export function flattenPageTree(
  items: PageTreeItem[],
  expandedIds: Set<string>,
  depth = 0,
  parentId: string | null = null,
): FlatPageRow[] {
  const rows: FlatPageRow[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const hasChildren = Boolean(item.children?.length);

    rows.push({
      id: item.id,
      title: item.title,
      status: item.status,
      href: item.href,
      suffix: item.suffix,
      hidden: item.hidden,
      isDefault: item.isDefault,
      depth,
      hasChildren,
      parentId,
      isFirstSibling: index === 0,
      isLastSibling: index === items.length - 1,
    });

    if (hasChildren && expandedIds.has(item.id)) {
      rows.push(
        ...flattenPageTree(item.children!, expandedIds, depth + 1, item.id),
      );
    }
  }

  return rows;
}

export function countPages(items: PageTreeItem[]): {
  all: number;
  published: number;
  draft: number;
  hidden: number;
  default: number;
} {
  let published = 0;
  let draft = 0;
  let hidden = 0;
  let isDefault = 0;

  const walk = (nodes: PageTreeItem[]) => {
    for (const node of nodes) {
      if (node.status === "published") {
        published += 1;
      } else {
        draft += 1;
      }

      if (node.hidden) {
        hidden += 1;
      }

      if (node.isDefault) {
        isDefault += 1;
      }

      if (node.children?.length) {
        walk(node.children);
      }
    }
  };

  walk(items);

  return {
    all: published + draft,
    published,
    draft,
    hidden,
    default: isDefault,
  };
}

export function filterPageRows(
  rows: FlatPageRow[],
  view: PageListView,
  search: string,
): FlatPageRow[] {
  const query = search.trim().toLowerCase();

  return rows.filter((row) => {
    if (view === "published" && row.status !== "published") {
      return false;
    }

    if (view === "draft" && row.status !== "draft") {
      return false;
    }

    if (view === "hidden" && !row.hidden) {
      return false;
    }

    if (view === "default" && !row.isDefault) {
      return false;
    }

    if (view !== "hidden" && row.hidden) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      row.title.toLowerCase().includes(query) ||
      (row.suffix?.toLowerCase().includes(query) ?? false)
    );
  });
}

export function getViewLabel(view: PageListView, counts: ReturnType<typeof countPages>) {
  if (view === "hidden") {
    return `Show Hidden (${counts.hidden})`;
  }

  const option = PAGE_LIST_VIEWS.find((item) => item.value === view);
  return option?.label ?? view;
}
