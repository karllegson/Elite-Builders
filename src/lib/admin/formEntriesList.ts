export type FormEntryView = "all" | "unread" | "starred" | "spam" | "trash";

export type FormEntrySortKey =
  | "first"
  | "last"
  | "email"
  | "zipCode"
  | "phone"
  | "message";

export type FormEntrySortDirection = "asc" | "desc";

export type FormEntrySearchField =
  | "any"
  | "first"
  | "last"
  | "email"
  | "zipCode"
  | "phone"
  | "message";

export type FormEntrySearchOperator = "contains" | "is" | "is-not" | "starts-with";

export type FormEntryItem = {
  id: number;
  first: string;
  last: string;
  email: string;
  zipCode: string;
  phone: string;
  message: string;
  isRead: boolean;
  isStarred: boolean;
  isSpam: boolean;
  isTrash: boolean;
};

export type FormOption = {
  id: number;
  label: string;
};

export const FORM_ENTRY_FORMS: FormOption[] = [];

export const FORM_ENTRY_VIEWS: { value: FormEntryView; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "starred", label: "Starred" },
  { value: "spam", label: "Spam" },
  { value: "trash", label: "Trash" },
];

export const FORM_ENTRY_BULK_ACTIONS = [
  { value: "", label: "Bulk actions" },
  { value: "mark-read", label: "Mark as read" },
  { value: "mark-unread", label: "Mark as unread" },
  { value: "star", label: "Add star" },
  { value: "unstar", label: "Remove star" },
  { value: "spam", label: "Mark as spam" },
  { value: "not-spam", label: "Mark as not spam" },
  { value: "trash", label: "Move to Trash" },
  { value: "restore", label: "Restore" },
  { value: "delete", label: "Delete Permanently" },
] as const;

export const FORM_ENTRY_SEARCH_FIELDS: { value: FormEntrySearchField; label: string }[] = [
  { value: "any", label: "Any form field" },
  { value: "first", label: "First" },
  { value: "last", label: "Last" },
  { value: "email", label: "Email Address" },
  { value: "zipCode", label: "Zip Code" },
  { value: "phone", label: "Phone Number" },
  { value: "message", label: "How can we help?" },
];

export const FORM_ENTRY_SEARCH_OPERATORS: {
  value: FormEntrySearchOperator;
  label: string;
}[] = [
  { value: "contains", label: "contains" },
  { value: "is", label: "is" },
  { value: "is-not", label: "is not" },
  { value: "starts-with", label: "starts with" },
];

export function getFormEntryViewCounts(entries: FormEntryItem[]) {
  const active = entries.filter((entry) => !entry.isTrash && !entry.isSpam);

  return {
    all: active.length,
    unread: active.filter((entry) => !entry.isRead).length,
    starred: active.filter((entry) => entry.isStarred).length,
    spam: entries.filter((entry) => entry.isSpam && !entry.isTrash).length,
    trash: entries.filter((entry) => entry.isTrash).length,
  };
}

function matchesSearchOperator(
  value: string,
  query: string,
  operator: FormEntrySearchOperator,
): boolean {
  const normalizedValue = value.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  switch (operator) {
    case "is":
      return normalizedValue === normalizedQuery;
    case "is-not":
      return normalizedValue !== normalizedQuery;
    case "starts-with":
      return normalizedValue.startsWith(normalizedQuery);
    case "contains":
    default:
      return normalizedValue.includes(normalizedQuery);
  }
}

function getEntryFieldValue(entry: FormEntryItem, field: FormEntrySearchField): string {
  if (field === "any") {
    return [
      entry.first,
      entry.last,
      entry.email,
      entry.zipCode,
      entry.phone,
      entry.message,
    ].join(" ");
  }

  return entry[field];
}

export function filterFormEntries(
  entries: FormEntryItem[],
  view: FormEntryView,
  searchField: FormEntrySearchField,
  searchOperator: FormEntrySearchOperator,
  searchQuery: string,
): FormEntryItem[] {
  const query = searchQuery.trim();

  return entries.filter((entry) => {
    if (view === "trash") {
      if (!entry.isTrash) {
        return false;
      }
    } else if (entry.isTrash) {
      return false;
    } else if (view === "spam") {
      if (!entry.isSpam) {
        return false;
      }
    } else if (entry.isSpam) {
      return false;
    } else if (view === "unread" && entry.isRead) {
      return false;
    } else if (view === "starred" && !entry.isStarred) {
      return false;
    }

    if (!query) {
      return true;
    }

    return matchesSearchOperator(
      getEntryFieldValue(entry, searchField),
      query,
      searchOperator,
    );
  });
}

export function sortFormEntries(
  entries: FormEntryItem[],
  sortKey: FormEntrySortKey,
  direction: FormEntrySortDirection,
): FormEntryItem[] {
  const sorted = [...entries].sort((a, b) => {
    const valueA = a[sortKey];
    const valueB = b[sortKey];
    return valueA.localeCompare(valueB, undefined, { sensitivity: "base" });
  });

  return direction === "asc" ? sorted : sorted.reverse();
}

export function paginateFormEntries<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    currentPage: safePage,
    totalPages,
    totalItems: items.length,
  };
}
