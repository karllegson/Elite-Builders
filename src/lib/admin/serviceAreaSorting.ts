import type { ServiceAreaRecord } from "@/lib/admin/serviceAreasData";

export type SortingBoardState = {
  sectionOrder: string[];
  areasBySection: Record<string, ServiceAreaRecord[]>;
};

export function createBoardStateFromColumns(
  columns: { section: { id: string }; areas: ServiceAreaRecord[] }[],
): SortingBoardState {
  const sectionOrder = columns.map((column) => column.section.id);
  const areasBySection: Record<string, ServiceAreaRecord[]> = {};

  for (const column of columns) {
    areasBySection[column.section.id] = column.areas.map((area) => ({ ...area }));
  }

  return { sectionOrder, areasBySection };
}

export function moveSection(
  board: SortingBoardState,
  sectionId: string,
  direction: "up" | "down",
): SortingBoardState {
  const index = board.sectionOrder.indexOf(sectionId);

  if (index === -1) {
    return board;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= board.sectionOrder.length) {
    return board;
  }

  const nextOrder = [...board.sectionOrder];
  [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];

  return {
    ...board,
    sectionOrder: nextOrder,
  };
}

export function findSectionForItem(
  board: SortingBoardState,
  itemId: string,
): string | null {
  for (const sectionId of board.sectionOrder) {
    if (board.areasBySection[sectionId]?.some((area) => area.id === itemId)) {
      return sectionId;
    }
  }

  return null;
}

export function moveItemInBoard(
  board: SortingBoardState,
  activeId: string,
  overId: string,
): SortingBoardState {
  const activeSectionId = findSectionForItem(board, activeId);

  if (!activeSectionId) {
    return board;
  }

  const overSectionId =
    board.sectionOrder.find((sectionId) => sectionId === overId) ??
    findSectionForItem(board, overId);

  if (!overSectionId) {
    return board;
  }

  const nextAreasBySection: Record<string, ServiceAreaRecord[]> = {};

  for (const sectionId of board.sectionOrder) {
    nextAreasBySection[sectionId] = [...(board.areasBySection[sectionId] ?? [])];
  }

  const activeItems = nextAreasBySection[activeSectionId];
  const activeIndex = activeItems.findIndex((area) => area.id === activeId);

  if (activeIndex === -1) {
    return board;
  }

  const [movedItem] = activeItems.splice(activeIndex, 1);

  if (activeSectionId === overSectionId) {
    const overIndex = nextAreasBySection[overSectionId].findIndex(
      (area) => area.id === overId,
    );
    const insertIndex = overIndex === -1 ? nextAreasBySection[overSectionId].length : overIndex;
    nextAreasBySection[overSectionId].splice(insertIndex, 0, movedItem);
  } else {
    const overItems = nextAreasBySection[overSectionId];
    const overIndex = overItems.findIndex((area) => area.id === overId);
    const insertIndex = overIndex === -1 ? overItems.length : overIndex;
    overItems.splice(insertIndex, 0, movedItem);
  }

  return {
    ...board,
    areasBySection: nextAreasBySection,
  };
}

export function addSectionToBoard(
  board: SortingBoardState,
  sectionId: string,
): SortingBoardState {
  if (board.sectionOrder.includes(sectionId)) {
    return board;
  }

  const withoutUnused = board.sectionOrder.filter((id) => id !== "unused");
  const nextOrder = [...withoutUnused, sectionId, "unused"];

  return {
    sectionOrder: nextOrder,
    areasBySection: {
      ...board.areasBySection,
      [sectionId]: board.areasBySection[sectionId] ?? [],
    },
  };
}

export function removeSectionFromBoard(
  board: SortingBoardState,
  sectionId: string,
): SortingBoardState {
  const orphanedItems = board.areasBySection[sectionId] ?? [];
  const nextAreasBySection = { ...board.areasBySection };

  delete nextAreasBySection[sectionId];

  nextAreasBySection.unused = [
    ...(nextAreasBySection.unused ?? []),
    ...orphanedItems,
  ];

  return {
    sectionOrder: board.sectionOrder.filter((id) => id !== sectionId),
    areasBySection: nextAreasBySection,
  };
}
