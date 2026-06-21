export type ContactFormType = "estimate" | "contact";

export type ContactSubmissionInput = {
  name: string;
  phone: string;
  city?: string;
  service?: string;
  message?: string;
  pagePath?: string;
  formType?: ContactFormType;
};

export type ContactSubmission = {
  id: string;
  name: string;
  phone: string;
  city: string;
  service: string;
  message: string;
  pagePath: string;
  formType: ContactFormType;
  isRead: boolean;
  createdAt: string;
};

export const CONTACT_FORM_SERVICE_LABELS: Record<string, string> = {
  "rough-framing": "Rough Framing",
  remodeling: "Remodeling",
  siding: "Siding",
  decks: "Decks & Porches",
  other: "Other",
};

export function formatContactService(value: string): string {
  if (!value.trim()) {
    return "—";
  }

  return CONTACT_FORM_SERVICE_LABELS[value] ?? value;
}

export function formatContactFormType(formType: ContactFormType): string {
  return formType === "contact" ? "Contact Us" : "Free Estimate";
}
