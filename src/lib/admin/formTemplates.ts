export type FormTemplateIcon =
  | "plus"
  | "message"
  | "list"
  | "trophy"
  | "heart-hand"
  | "shopping-bag"
  | "shopping-basket"
  | "id-badge"
  | "calendar"
  | "gift"
  | "newspaper"
  | "file-dollar"
  | "smile"
  | "user-check"
  | "laptop"
  | "file-signature"
  | "quote"
  | "credit-card"
  | "graduation-cap"
  | "briefcase";

export type FormTemplateVariant =
  | "blank"
  | "simple-contact"
  | "advanced-contact"
  | "contest"
  | "donation"
  | "ecommerce"
  | "stripe-checkout"
  | "paypal-checkout"
  | "employment"
  | "event"
  | "gift"
  | "newsletter"
  | "quote"
  | "survey"
  | "user-registration"
  | "webinar"
  | "signature"
  | "testimonial"
  | "membership"
  | "sponsorship"
  | "support"
  | "course"
  | "school"
  | "agency";

export type FormTemplateAccent = "red" | "blue" | "yellow" | "orange" | "none";

export type FormTemplate = {
  id: string;
  label: string;
  bg: string;
  icon: FormTemplateIcon;
  variant: FormTemplateVariant;
  accent?: FormTemplateAccent;
};

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "blank",
    label: "Blank Form",
    bg: "#e8f0fe",
    icon: "plus",
    variant: "blank",
    accent: "none",
  },
  {
    id: "simple-contact",
    label: "Simple Contact Form",
    bg: "#fde8dc",
    icon: "message",
    variant: "simple-contact",
    accent: "red",
  },
  {
    id: "advanced-contact",
    label: "Advanced Contact Form",
    bg: "#e8edf2",
    icon: "list",
    variant: "advanced-contact",
    accent: "none",
  },
  {
    id: "contest",
    label: "Contest Entry Form",
    bg: "#dff5e8",
    icon: "trophy",
    variant: "contest",
    accent: "none",
  },
  {
    id: "donation",
    label: "Donation Form",
    bg: "#e3eef8",
    icon: "heart-hand",
    variant: "donation",
    accent: "none",
  },
  {
    id: "ecommerce",
    label: "eCommerce Form",
    bg: "#dff3f0",
    icon: "shopping-bag",
    variant: "ecommerce",
    accent: "none",
  },
  {
    id: "stripe-checkout",
    label: "Stripe Checkout Form",
    bg: "#e3f0fa",
    icon: "shopping-basket",
    variant: "stripe-checkout",
    accent: "blue",
  },
  {
    id: "paypal-checkout",
    label: "PayPal Checkout Form",
    bg: "#dff5f5",
    icon: "shopping-basket",
    variant: "paypal-checkout",
    accent: "yellow",
  },
  {
    id: "employment",
    label: "Employment Application Form",
    bg: "#ebe4f5",
    icon: "id-badge",
    variant: "employment",
    accent: "none",
  },
  {
    id: "event",
    label: "Event Registration Form",
    bg: "#eceff3",
    icon: "calendar",
    variant: "event",
    accent: "none",
  },
  {
    id: "gift-certificate",
    label: "Gift Certificate Form",
    bg: "#fff4d6",
    icon: "gift",
    variant: "gift",
    accent: "none",
  },
  {
    id: "newsletter",
    label: "Newsletter Signup Form",
    bg: "#e3f5ea",
    icon: "newspaper",
    variant: "newsletter",
    accent: "orange",
  },
  {
    id: "request-quote",
    label: "Request a Quote Form",
    bg: "#e8edf3",
    icon: "file-dollar",
    variant: "quote",
    accent: "none",
  },
  {
    id: "survey",
    label: "Survey Form",
    bg: "#dff5f8",
    icon: "smile",
    variant: "survey",
    accent: "none",
  },
  {
    id: "user-registration",
    label: "User Registration Form",
    bg: "#ebe4f5",
    icon: "user-check",
    variant: "user-registration",
    accent: "none",
  },
  {
    id: "webinar",
    label: "Webinar Registration Form",
    bg: "#eceff3",
    icon: "laptop",
    variant: "webinar",
    accent: "none",
  },
  {
    id: "signature",
    label: "Signature Consent Form",
    bg: "#e8edf3",
    icon: "file-signature",
    variant: "signature",
    accent: "none",
  },
  {
    id: "testimonial",
    label: "Testimonial Form",
    bg: "#eceff3",
    icon: "quote",
    variant: "testimonial",
    accent: "none",
  },
  {
    id: "stripe-membership",
    label: "Stripe Membership Form",
    bg: "#ebe4f5",
    icon: "credit-card",
    variant: "membership",
    accent: "blue",
  },
  {
    id: "stripe-sponsorship",
    label: "Stripe Event Sponsorship Form",
    bg: "#fff4d6",
    icon: "calendar",
    variant: "sponsorship",
    accent: "blue",
  },
  {
    id: "support",
    label: "Support Request Form",
    bg: "#e3f0fa",
    icon: "message",
    variant: "support",
    accent: "none",
  },
  {
    id: "square-course",
    label: "Square Course Registration Form",
    bg: "#dff3f0",
    icon: "list",
    variant: "course",
    accent: "none",
  },
  {
    id: "square-school",
    label: "Square School Enrollment Form",
    bg: "#dff5f8",
    icon: "graduation-cap",
    variant: "school",
    accent: "none",
  },
  {
    id: "agency-project",
    label: "Agency Project Inquiry Form",
    bg: "#fff8e6",
    icon: "briefcase",
    variant: "agency",
    accent: "none",
  },
];

export const FORMS_OPEN_TEMPLATES_EVENT = "admin:forms-open-templates";
