export type ContactFormType = "estimate" | "contact";

export type ContactSubmissionInput = {
  name: string;
  phone: string;
  email: string;
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
  email: string;
  city: string;
  service: string;
  message: string;
  pagePath: string;
  formType: ContactFormType;
  isRead: boolean;
  createdAt: string;
};

export const CONTACT_FORM_SERVICE_LABELS: Record<string, string> = {
  "framing-contractor": "Framing Contractor",
  "home-builder": "Home Builder",
  "deck-builder": "Deck Builder",
  "siding-contractor": "Siding Contractor",
  other: "Other",
  // Legacy slugs kept so historical submissions still display a readable label.
  "general-contractor": "Framing Contractor",
  remodeler: "Remodel Framing",
  "construction-company": "Home Builder",
  remodeling: "Remodel Framing",
  "home-addition-construction": "Home Builder",
  "home-building": "Home Builder",
  "luxury-home-building": "Home Builder",
  "fence-building": "Deck Builder",
  "deck-construction": "Deck Builder",
  "patio-construction": "Deck Builder",
  "tiny-home-building": "Home Builder",
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
