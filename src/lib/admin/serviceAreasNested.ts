import type { ServiceAreaRecord, ServiceAreaStatus } from "@/lib/admin/serviceAreasData";

export type NestedListView = "all" | "published" | "draft";

export type NestedServiceAreaNode = {
  area: ServiceAreaRecord;
  children: NestedServiceAreaNode[];
};

export type FlatNestedServiceAreaRow = {
  area: ServiceAreaRecord;
  depth: number;
  hasChildren: boolean;
};

export type NestedViewCounts = {
  all: number;
  published: number;
  draft: number;
  hidden: number;
};

export function getNestedViewCounts(areas: ServiceAreaRecord[]): NestedViewCounts {
  const visible = areas.filter((area) => !area.unused);

  return {
    all: visible.length,
    published: visible.filter((area) => area.status === "published").length,
    draft: visible.filter((area) => area.status === "draft").length,
    hidden: visible.filter((area) => area.hidden).length,
  };
}

export function filterServiceAreasForNestedView(
  areas: ServiceAreaRecord[],
  options: {
    view: NestedListView;
    showHidden: boolean;
    search: string;
  },
): ServiceAreaRecord[] {
  const query = options.search.trim().toLowerCase();

  return areas.filter((area) => {
    if (area.unused) {
      return false;
    }

    if (!options.showHidden && area.hidden) {
      return false;
    }

    if (options.view === "published" && area.status !== "published") {
      return false;
    }

    if (options.view === "draft" && area.status !== "draft") {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      area.title.toLowerCase().includes(query) ||
      area.city.toLowerCase().includes(query) ||
      area.slug.toLowerCase().includes(query)
    );
  });
}

function sortByOrder(left: ServiceAreaRecord, right: ServiceAreaRecord): number {
  return left.sortOrder - right.sortOrder || left.title.localeCompare(right.title);
}

export function buildServiceAreaTree(areas: ServiceAreaRecord[]): NestedServiceAreaNode[] {
  const byParent = new Map<string | null, ServiceAreaRecord[]>();

  for (const area of areas) {
    const parentKey = area.parentId;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(area);
    byParent.set(parentKey, siblings);
  }

  for (const siblings of byParent.values()) {
    siblings.sort(sortByOrder);
  }

  const buildBranch = (parentId: string | null): NestedServiceAreaNode[] => {
    const siblings = byParent.get(parentId) ?? [];

    return siblings.map((area) => ({
      area,
      children: buildBranch(area.id),
    }));
  };

  return buildBranch(null);
}

function nodeMatchesSearch(node: NestedServiceAreaNode, matchingIds: Set<string>): boolean {
  if (matchingIds.has(node.area.id)) {
    return true;
  }

  return node.children.some((child) => nodeMatchesSearch(child, matchingIds));
}

export function buildFilteredServiceAreaTree(
  allAreas: ServiceAreaRecord[],
  filteredAreas: ServiceAreaRecord[],
): NestedServiceAreaNode[] {
  const matchingIds = new Set(filteredAreas.map((area) => area.id));
  const tree = buildServiceAreaTree(allAreas);

  const prune = (nodes: NestedServiceAreaNode[]): NestedServiceAreaNode[] =>
    nodes
      .filter((node) => nodeMatchesSearch(node, matchingIds))
      .map((node) => ({
        area: node.area,
        children: prune(node.children),
      }));

  return prune(tree);
}

export function flattenServiceAreaTree(
  nodes: NestedServiceAreaNode[],
  expandedIds: Set<string>,
  depth = 0,
): FlatNestedServiceAreaRow[] {
  const rows: FlatNestedServiceAreaRow[] = [];

  for (const node of nodes) {
    const hasChildren = node.children.length > 0;

    rows.push({
      area: node.area,
      depth,
      hasChildren,
    });

    if (hasChildren && expandedIds.has(node.area.id)) {
      rows.push(...flattenServiceAreaTree(node.children, expandedIds, depth + 1));
    }
  }

  return rows;
}

export function collectExpandableIds(nodes: NestedServiceAreaNode[]): string[] {
  const ids: string[] = [];

  const walk = (branch: NestedServiceAreaNode[]) => {
    for (const node of branch) {
      if (node.children.length > 0) {
        ids.push(node.area.id);
        walk(node.children);
      }
    }
  };

  walk(nodes);
  return ids;
}

export function formatNestedStatusLabel(status: ServiceAreaStatus): string {
  return status === "published" ? "Published" : "Draft";
}
