export type NotificationSortKey = "name" | "subject" | "event" | "service";

export type NotificationSortDirection = "asc" | "desc";

export type FormNotificationItem = {
  id: string;
  name: string;
  subject: string;
  event: string;
  service: string;
  isActive: boolean;
  isDefault?: boolean;
};

export const DEFAULT_FORM_NOTIFICATIONS: FormNotificationItem[] = [
  {
    id: "admin-notification",
    name: "Admin Notification",
    subject: "New submission from {form_title}",
    event: "Form is submitted",
    service: "SendGrid",
    isActive: true,
    isDefault: true,
  },
];

export function sortNotifications(
  items: FormNotificationItem[],
  sortKey: NotificationSortKey,
  direction: NotificationSortDirection,
): FormNotificationItem[] {
  const sorted = [...items].sort((a, b) =>
    a[sortKey].localeCompare(b[sortKey], undefined, { sensitivity: "base" }),
  );

  return direction === "asc" ? sorted : sorted.reverse();
}
