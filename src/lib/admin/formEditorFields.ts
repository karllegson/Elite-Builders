export type FormCanvasFieldType =
  | "text"
  | "textarea"
  | "radio"
  | "html"
  | "submit"
  | "row";

export type FormCanvasField = {
  id: string;
  type: FormCanvasFieldType;
  label: string;
  required?: boolean;
  value?: string;
  options?: string[];
  children?: FormCanvasField[];
};

export const PLACEHOLDER_FORM_CANVAS_FIELDS: FormCanvasField[] = [
  {
    id: "name-row",
    type: "row",
    label: "",
    children: [
      { id: "first-name", type: "text", label: "First Name", required: true },
      { id: "last-name", type: "text", label: "Last Name", required: true },
    ],
  },
  { id: "email", type: "text", label: "Email Address", required: true },
  { id: "zip", type: "text", label: "Zip Code", required: true },
  { id: "phone", type: "text", label: "Phone Number" },
  {
    id: "book-appointment",
    type: "radio",
    label: "Book Appointment?",
    required: true,
    options: ["Yes", "No"],
  },
  {
    id: "information",
    type: "textarea",
    label: "Please provide more information about your needs here",
  },
  { id: "promo-code", type: "text", label: "Promo Code" },
  { id: "consent", type: "html", label: "Consent" },
  {
    id: "sent-from",
    type: "text",
    label: "Sent From",
    value: "{embed_post:post_title}",
  },
  { id: "submit", type: "submit", label: "Submit" },
];
