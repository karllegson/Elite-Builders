export type PostWidgetSettingsTab = "general" | "popular" | "widget";

export type PopularPostSource = "categories" | "tags" | "all";

export type WidgetTabIcon = "star" | "flame" | "case-study";

export type WidgetTabItem = {
  id: string;
  enabled: boolean;
  title: string;
  icon: WidgetTabIcon;
};

export type GeneralWidgetSettings = {
  maxPostsHomepage: number;
  maxPostsInterior: number;
  tabColumns: number;
};

export type PopularPostsSettings = {
  enabled: boolean;
  maxAge: string;
  minimumViews: number;
  source: PopularPostSource;
  categories: string;
};

export function createWidgetTabId(): string {
  return `widget-tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefaultGeneralSettings(): GeneralWidgetSettings {
  return {
    maxPostsHomepage: 6,
    maxPostsInterior: 6,
    tabColumns: 3,
  };
}

export function createDefaultPopularSettings(): PopularPostsSettings {
  return {
    enabled: true,
    maxAge: "4y",
    minimumViews: 30,
    source: "categories",
    categories: "",
  };
}

export function createDefaultWidgetTabs(): WidgetTabItem[] {
  return [
    {
      id: createWidgetTabId(),
      enabled: true,
      title: "Recent Posts",
      icon: "star",
    },
    {
      id: createWidgetTabId(),
      enabled: true,
      title: "Popular Posts",
      icon: "flame",
    },
    {
      id: createWidgetTabId(),
      enabled: true,
      title: "Case Studies",
      icon: "case-study",
    },
  ];
}

export function formatNextQueryTime(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
}

export const POPULAR_SOURCE_OPTIONS: { value: PopularPostSource; label: string }[] =
  [
    { value: "categories", label: "Categories" },
    { value: "tags", label: "Tags" },
    { value: "all", label: "All Posts" },
  ];

export const POST_WIDGET_TABS: { value: PostWidgetSettingsTab; label: string }[] =
  [
    { value: "general", label: "General" },
    { value: "popular", label: "Popular Posts" },
    { value: "widget", label: "Widget" },
  ];
