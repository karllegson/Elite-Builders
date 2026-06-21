"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical, List, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import {
  addCustomSection,
  buildSortingColumns,
  readServiceAreasStore,
  removeCustomSection,
  resetServiceAreasStore,
  saveSortingLayout,
  stateCodeToSectionId,
  UNUSED_SECTION_ID,
  type ServiceAreaRecord,
  type ServiceAreaSortSection,
} from "@/lib/admin/serviceAreasData";
import {
  addSectionToBoard,
  createBoardStateFromColumns,
  moveItemInBoard,
  moveSection,
  removeSectionFromBoard,
  type SortingBoardState,
} from "@/lib/admin/serviceAreaSorting";

type SortableAreaItemProps = {
  area: ServiceAreaRecord;
};

function SortableAreaItem({ area }: SortableAreaItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: area.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`admin-sa-sort-item${isDragging ? " is-dragging" : ""}`}
    >
      <button
        type="button"
        className="admin-sa-sort-item-handle"
        aria-label={`Drag ${area.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} aria-hidden />
      </button>
      <span className="admin-sa-sort-item-label">{area.title}</span>
    </div>
  );
}

type SortingSectionColumnProps = {
  section: ServiceAreaSortSection;
  areas: ServiceAreaRecord[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

function SortingSectionColumn({
  section,
  areas,
  canMoveUp,
  canMoveDown,
  canRemove,
  onMoveUp,
  onMoveDown,
  onRemove,
}: SortingSectionColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });

  return (
    <div className="admin-sa-sort-column">
      <div
        className={`admin-sa-sort-column-header${
          section.isUnused ? " is-unused" : ""
        }`}
      >
        <span className="admin-sa-sort-column-title">{section.name}</span>
        <div className="admin-sa-sort-column-actions">
          <span className="admin-sa-sort-column-icon" aria-hidden>
            <List size={14} />
          </span>
          {!section.isUnused ? (
            <>
              <button
                type="button"
                className="admin-sa-sort-column-action"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                aria-label={`Move ${section.name} section up`}
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                className="admin-sa-sort-column-action"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                aria-label={`Move ${section.name} section down`}
              >
                <ArrowDown size={14} />
              </button>
              {canRemove ? (
                <button
                  type="button"
                  className="admin-sa-sort-column-action"
                  onClick={onRemove}
                  aria-label={`Remove ${section.name} section`}
                >
                  <X size={14} />
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {section.isUnused ? (
        <p className="admin-sa-sort-unused-note">
          Reserved for unused service areas. These do not appear on the frontend.
        </p>
      ) : null}

      <div
        ref={setNodeRef}
        className={`admin-sa-sort-dropzone${isOver ? " is-over" : ""}${
          areas.length === 0 ? " is-empty" : ""
        }`}
      >
        <SortableContext items={areas.map((area) => area.id)} strategy={verticalListSortingStrategy}>
          {areas.map((area) => (
            <SortableAreaItem key={area.id} area={area} />
          ))}
        </SortableContext>
        {areas.length === 0 ? (
          <p className="admin-sa-sort-empty">Drop service areas here</p>
        ) : null}
      </div>
    </div>
  );
}

const SORTING_MODES = [{ value: "custom", label: "Custom" }] as const;

export function ServiceAreaSortingManager() {
  const toast = useAdminToast();
  const [board, setBoard] = useState<SortingBoardState>(() => {
    const store = readServiceAreasStore();
    const columns = buildSortingColumns(store);
    return createBoardStateFromColumns(columns);
  });
  const [activeItem, setActiveItem] = useState<ServiceAreaRecord | null>(null);
  const [sortingMode, setSortingMode] = useState<(typeof SORTING_MODES)[number]["value"]>("custom");
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionStateCode, setNewSectionStateCode] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns = useMemo(() => {
    const store = readServiceAreasStore();

    return board.sectionOrder.map((sectionId) => {
      const existingColumn = buildSortingColumns(store).find(
        (column) => column.section.id === sectionId,
      );
      const section =
        existingColumn?.section ??
        ({
          id: sectionId,
          name: sectionId,
          stateCode: null,
          isUnused: sectionId === UNUSED_SECTION_ID,
        } satisfies ServiceAreaSortSection);

      return {
        section,
        areas: board.areasBySection[sectionId] ?? [],
      };
    });
  }, [board]);

  const showStatus = (message: string) => {
    toast.success(message);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const itemId = String(event.active.id);

    for (const column of columns) {
      const match = column.areas.find((area) => area.id === itemId);
      if (match) {
        setActiveItem(match);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) {
      return;
    }

    setBoard((current) => moveItemInBoard(current, activeId, overId));
  };

  const handleSave = () => {
    saveSortingLayout(board.sectionOrder, board.areasBySection);
    showStatus("Sorting saved.");
  };

  const handleReset = () => {
    const seeded = resetServiceAreasStore();
    const nextColumns = buildSortingColumns(seeded);
    setBoard(createBoardStateFromColumns(nextColumns));
    showStatus("Sorting reset to default service areas.");
  };

  const handleAddSection = (event: React.FormEvent) => {
    event.preventDefault();

    const stateCode = newSectionStateCode.trim().toUpperCase();

    if (stateCode.length !== 2) {
      showStatus("Enter a two-letter state code (e.g. CA, MA).");
      return;
    }

    const section = addCustomSection(newSectionName, stateCode);
    setBoard((current) => addSectionToBoard(current, section.id));
    setNewSectionName("");
    setNewSectionStateCode("");
    setAddSectionOpen(false);
    showStatus(`Added ${section.name} section.`);
  };

  const handleRemoveSection = (sectionId: string) => {
    removeCustomSection(sectionId);
    setBoard((current) => removeSectionFromBoard(current, sectionId));
    showStatus("Section removed. Items moved to Unused.");
  };

  return (
    <div className="admin-sa-sort-page">
      <p className="admin-sa-sort-intro">
        Sort top-level parent service areas by dragging and dropping them in the desired order. Only
        pages with <strong>This page is the parent</strong> in Page Attributes appear here — sub-pages
        are managed in Nested View under their parent.
      </p>

      <div className="admin-sa-sort-toolbar">
        <label className="admin-sa-sort-mode">
          <span>Sorting</span>
          <select
            value={sortingMode}
            onChange={(event) =>
              setSortingMode(event.target.value as (typeof SORTING_MODES)[number]["value"])
            }
          >
            {SORTING_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>

        <div className="admin-sa-sort-toolbar-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => setAddSectionOpen((open) => !open)}
          >
            <Plus size={14} aria-hidden />
            Add Section
          </button>
          <button type="button" className="admin-btn-secondary" onClick={handleReset}>
            Reset to default
          </button>
        </div>
      </div>

      {addSectionOpen ? (
        <form className="admin-sa-sort-add-section" onSubmit={handleAddSection}>
          <label>
            <span>Section name</span>
            <input
              type="text"
              value={newSectionName}
              onChange={(event) => setNewSectionName(event.target.value)}
              placeholder="California"
            />
          </label>
          <label>
            <span>State code</span>
            <input
              type="text"
              value={newSectionStateCode}
              onChange={(event) => setNewSectionStateCode(event.target.value)}
              placeholder="CA"
              maxLength={2}
            />
          </label>
          <button type="submit" className="admin-btn-primary-inline">
            Add
          </button>
        </form>
      ) : null}

      <h2 className="admin-sa-sort-heading">Custom Sorting</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="admin-sa-sort-board">
          {columns.map((column, index) => (
            <SortingSectionColumn
              key={column.section.id}
              section={column.section}
              areas={column.areas}
              canMoveUp={index > 0 && column.section.id !== UNUSED_SECTION_ID}
              canMoveDown={
                index < columns.length - 1 && column.section.id !== UNUSED_SECTION_ID
              }
              canRemove={
                !column.section.isUnused &&
                column.section.id !== stateCodeToSectionId("CA") &&
                column.areas.length === 0
              }
              onMoveUp={() =>
                setBoard((current) => moveSection(current, column.section.id, "up"))
              }
              onMoveDown={() =>
                setBoard((current) => moveSection(current, column.section.id, "down"))
              }
              onRemove={() => handleRemoveSection(column.section.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="admin-sa-sort-item is-overlay">
              <span className="admin-sa-sort-item-handle" aria-hidden>
                <GripVertical size={14} />
              </span>
              <span className="admin-sa-sort-item-label">{activeItem.title}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="admin-sa-sort-footer">
        <button type="button" className="admin-btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
