export type ConfirmationSortKey = "name" | "type" | "content";

export type ConfirmationSortDirection = "asc" | "desc";

export type ConfirmationType = "page" | "message" | "redirect";

export type FormConfirmationItem = {
  id: string;
  name: string;
  type: ConfirmationType;
  content: string;
  isDefault?: boolean;
};

export const CONFIRMATION_TYPE_LABELS: Record<ConfirmationType, string> = {
  page: "Page",
  message: "Text",
  redirect: "Redirect",
};

export const DEFAULT_FORM_CONFIRMATIONS: FormConfirmationItem[] = [
  {
    id: "default",
    name: "Default Confirmation",
    type: "page",
    content: "Thank You",
    isDefault: true,
  },
];

export function sortConfirmations(
  items: FormConfirmationItem[],
  sortKey: ConfirmationSortKey,
  direction: ConfirmationSortDirection,
): FormConfirmationItem[] {
  const sorted = [...items].sort((a, b) => {
    const valueA = sortKey === "type" ? CONFIRMATION_TYPE_LABELS[a.type] : a[sortKey];
    const valueB = sortKey === "type" ? CONFIRMATION_TYPE_LABELS[b.type] : b[sortKey];
    return valueA.localeCompare(valueB, undefined, { sensitivity: "base" });
  });

  return direction === "asc" ? sorted : sorted.reverse();
}
