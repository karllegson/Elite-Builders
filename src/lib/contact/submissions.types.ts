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
  remodeling: "Remodeling",
  "home-addition-construction": "Home Addition Construction",
  "home-building": "Home Building",
  "luxury-home-building": "Luxury Home Building",
  "fence-building": "Fence Building",
  "deck-construction": "Deck Construction",
  "patio-construction": "Patio Construction",
  "tiny-home-building": "Tiny Home Building",
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
