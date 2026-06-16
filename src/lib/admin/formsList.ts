export type FormListView = "all" | "active" | "inactive" | "trash";

export type FormStatus = "active" | "inactive" | "trash";

export type FormSortKey =
  | "status"
  | "title"
  | "id"
  | "entries"
  | "views"
  | "conversion";

export type FormSortDirection = "asc" | "desc";

export type FormListItem = {
  id: number;
  title: string;
  status: FormStatus;
  entries: number;
  views: number;
  conversion: number;
};

export const FORM_LIST_VIEWS: { value: FormListView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "trash", label: "Trash" },
];

export const FORM_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "activate", label: "Activate" },
  { value: "deactivate", label: "Deactivate" },
  { value: "trash", label: "Move to Trash" },
  { value: "restore", label: "Restore" },
  { value: "delete", label: "Delete Permanently" },
] as const;

export function getFormViewCounts(forms: FormListItem[]) {
  const nonTrash = forms.filter((form) => form.status !== "trash");

  return {
    all: nonTrash.length,
    active: forms.filter((form) => form.status === "active").length,
    inactive: forms.filter((form) => form.status === "inactive").length,
    trash: forms.filter((form) => form.status === "trash").length,
  };
}

export function filterForms(
  forms: FormListItem[],
  view: FormListView,
  search: string,
): FormListItem[] {
  const query = search.trim().toLowerCase();

  return forms.filter((form) => {
    if (view === "active" && form.status !== "active") {
      return false;
    }

    if (view === "inactive" && form.status !== "inactive") {
      return false;
    }

    if (view === "trash" && form.status !== "trash") {
      return false;
    }

    if (view !== "trash" && form.status === "trash") {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      form.title.toLowerCase().includes(query) ||
      String(form.id).includes(query)
    );
  });
}

export function sortForms(
  forms: FormListItem[],
  sortKey: FormSortKey,
  direction: FormSortDirection,
): FormListItem[] {
  const sorted = [...forms].sort((a, b) => {
    switch (sortKey) {
      case "status":
        return a.status.localeCompare(b.status);
      case "title":
        return a.title.localeCompare(b.title);
      case "id":
        return a.id - b.id;
      case "entries":
        return a.entries - b.entries;
      case "views":
        return a.views - b.views;
      case "conversion":
        return a.conversion - b.conversion;
      default:
        return 0;
    }
  });

  return direction === "asc" ? sorted : sorted.reverse();
}

export function formatFormConversion(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getFormStatusLabel(status: FormStatus): string {
  if (status === "active") {
    return "Active";
  }

  if (status === "inactive") {
    return "Inactive";
  }

  return "Trash";
}
