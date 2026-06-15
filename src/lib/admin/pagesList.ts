export type PageStatus = "published" | "draft";

export type PageListView = "all" | "published" | "draft" | "hidden" | "default";

export type PageTreeItem = {
  id: string;
  title: string;
  status: PageStatus;
  suffix?: string;
  hidden?: boolean;
  isDefault?: boolean;
  children?: PageTreeItem[];
};

export type FlatPageRow = {
  id: string;
  title: string;
  status: PageStatus;
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

export function getPlaceholderPages(): PageTreeItem[] {
  return [
    {
      id: "resources",
      title: "Resources",
      status: "published",
      children: [
        { id: "careers", title: "Careers", status: "published" },
        { id: "testimonials", title: "Testimonials", status: "published" },
        { id: "financing", title: "Financing", status: "published" },
        {
          id: "blog",
          title: "Blog",
          status: "published",
          suffix: "Posts Page",
          isDefault: true,
        },
        { id: "service-areas", title: "Service Areas", status: "published" },
      ],
    },
    {
      id: "about-us",
      title: "About Us",
      status: "published",
      children: [
        { id: "our-story", title: "Our Story", status: "published" },
        { id: "our-promises", title: "Our Promises", status: "published" },
        { id: "company-faqs", title: "Company FAQs", status: "published" },
        {
          id: "awards-accolades",
          title: "Awards & Accolades",
          status: "published",
        },
        {
          id: "lifetime-warranty",
          title: "Lifetime Transferable Warranty",
          status: "published",
        },
        { id: "reviews", title: "Reviews", status: "published" },
      ],
    },
    { id: "terms-of-service", title: "Terms of service", status: "published" },
    {
      id: "basement-system",
      title: "The Elite Builders Basement Finishing System",
      status: "published",
    },
    {
      id: "why-elite-builders",
      title: "Why Elite Builders",
      status: "published",
      children: [
        { id: "why-us-overview", title: "Why Us Overview", status: "published" },
        {
          id: "golden-standard",
          title: "Golden-Standard System",
          status: "published",
        },
        {
          id: "certified-installers",
          title: "Specialized Certified Installers",
          status: "published",
        },
        {
          id: "personalized-service",
          title: "Personalized Service",
          status: "published",
        },
        {
          id: "values-driving-us",
          title: "The Values Driving Us",
          status: "published",
        },
        {
          id: "family-focused",
          title: "A Family-Focused Company",
          status: "published",
        },
      ],
    },
    {
      id: "home",
      title: "Home",
      status: "published",
      suffix: "Front Page",
      isDefault: true,
    },
    { id: "contact-us", title: "Contact Us", status: "published" },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      status: "published",
    },
    { id: "design-assets", title: "Design Assets", status: "published" },
    { id: "thank-you", title: "Thank You", status: "published" },
    { id: "privacy-policy", title: "Privacy Policy", status: "published" },
  ];
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
