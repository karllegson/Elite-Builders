"use client";

import {
  AlignLeft,
  Banknote,
  Calendar,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock,
  Code2,
  EyeOff,
  FileText,
  Hash,
  Image,
  Link2,
  List,
  ListChecks,
  Mail,
  MapPin,
  Minus,
  MousePointer2,
  Phone,
  RefreshCw,
  Search,
  ShoppingCart,
  SquareCheckBig,
  Tag,
  Tags,
  TextCursorInput,
  Truck,
  Type,
  Upload,
  User,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

type PaletteField = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type PaletteGroup = {
  id: string;
  title: string;
  fields: PaletteField[];
};

const PALETTE_GROUPS: PaletteGroup[] = [
  {
    id: "standard",
    title: "Standard Fields",
    fields: [
      { id: "single-line-text", label: "Single Line Text", icon: Type },
      { id: "paragraph-text", label: "Paragraph Text", icon: AlignLeft },
      { id: "drop-down", label: "Drop Down", icon: ChevronDown },
      { id: "number", label: "Number", icon: Hash },
      { id: "checkboxes", label: "Checkboxes", icon: CheckSquare },
      { id: "radio-buttons", label: "Radio Buttons", icon: CircleDot },
      { id: "hidden", label: "Hidden", icon: EyeOff },
      { id: "html", label: "HTML", icon: Code2 },
      { id: "section", label: "Section", icon: Minus },
      { id: "page", label: "Page", icon: FileText },
      { id: "multiple-choice", label: "Multiple Choice", icon: SquareCheckBig },
      { id: "image-choice", label: "Image Choice", icon: Image },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Fields",
    fields: [
      { id: "name", label: "Name", icon: User },
      { id: "date", label: "Date", icon: Calendar },
      { id: "time", label: "Time", icon: Clock },
      { id: "phone", label: "Phone", icon: Phone },
      { id: "address", label: "Address", icon: MapPin },
      { id: "website", label: "Website", icon: Link2 },
      { id: "email", label: "Email", icon: Mail },
      { id: "file-upload", label: "File Upload", icon: Upload },
      { id: "captcha", label: "CAPTCHA", icon: RefreshCw },
      { id: "list", label: "List", icon: List },
      { id: "multi-select", label: "Multi Select", icon: ListChecks },
      { id: "consent", label: "Consent", icon: FileText },
      { id: "map", label: "Map", icon: MapPin },
      { id: "booking", label: "Booking", icon: CalendarClock },
    ],
  },
  {
    id: "post",
    title: "Post Fields",
    fields: [
      { id: "title", label: "Title", icon: Type },
      { id: "body", label: "Body", icon: AlignLeft },
      { id: "excerpt", label: "Excerpt", icon: TextCursorInput },
      { id: "tags", label: "Tags", icon: Tag },
      { id: "category", label: "Category", icon: Tags },
      { id: "post-image", label: "Post Image", icon: Image },
      { id: "custom-field", label: "Custom Field", icon: List },
    ],
  },
  {
    id: "pricing",
    title: "Pricing Fields",
    fields: [
      { id: "product", label: "Product", icon: ShoppingCart },
      { id: "quantity", label: "Quantity", icon: Hash },
      { id: "option", label: "Option", icon: ListChecks },
      { id: "shipping", label: "Shipping", icon: Truck },
      { id: "total", label: "Total", icon: Banknote },
    ],
  },
];

type SidebarTab = "add-fields" | "field-settings";

export function FormEditorSidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("add-fields");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    standard: true,
    advanced: true,
    post: true,
    pricing: true,
  });

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return PALETTE_GROUPS;
    }

    return PALETTE_GROUPS.map((group) => ({
      ...group,
      fields: group.fields.filter((field) => field.label.toLowerCase().includes(query)),
    })).filter((group) => group.fields.length > 0);
  }, [searchQuery]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  };

  return (
    <aside className="admin-form-editor-sidebar">
      <div className="admin-form-editor-sidebar-search">
        <Search size={16} className="admin-form-editor-sidebar-search-icon" aria-hidden />
        <input
          type="search"
          className="admin-form-editor-sidebar-search-input"
          placeholder="Search for a field"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <div className="admin-form-editor-sidebar-tabs" role="tablist" aria-label="Field sidebar">
        <button
          type="button"
          role="tab"
          className={`admin-form-editor-sidebar-tab${activeTab === "add-fields" ? " is-active" : ""}`}
          aria-selected={activeTab === "add-fields"}
          onClick={() => setActiveTab("add-fields")}
        >
          Add Fields
        </button>
        <button
          type="button"
          role="tab"
          className={`admin-form-editor-sidebar-tab${activeTab === "field-settings" ? " is-active" : ""}`}
          aria-selected={activeTab === "field-settings"}
          onClick={() => setActiveTab("field-settings")}
        >
          Field Settings
        </button>
      </div>

      {activeTab === "add-fields" ? (
        <>
          <p className="admin-form-editor-sidebar-hint">
            <MousePointer2 size={14} aria-hidden />
            Drag a field to the left to start building your form and then start configuring it.
          </p>

          <div className="admin-form-editor-sidebar-groups">
            {filteredGroups.map((group) => {
              const isExpanded = expandedGroups[group.id] ?? true;

              return (
                <section key={group.id} className="admin-form-editor-sidebar-group">
                  <button
                    type="button"
                    className="admin-form-editor-sidebar-group-header"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isExpanded}
                  >
                    <span>{group.title}</span>
                    {isExpanded ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />}
                  </button>

                  {isExpanded ? (
                    <div className="admin-form-editor-sidebar-grid">
                      {group.fields.map((field) => {
                        const Icon = field.icon;

                        return (
                          <button
                            key={field.id}
                            type="button"
                            className="admin-form-editor-sidebar-field"
                            draggable
                          >
                            <Icon size={22} aria-hidden />
                            <span>{field.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </>
      ) : (
        <div className="admin-form-editor-sidebar-empty">
          <p>Select a field on the left to configure its settings.</p>
        </div>
      )}
    </aside>
  );
}
