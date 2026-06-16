export type AkismetFieldValue = "" | "name-first" | "name-last" | "email" | "website" | "phone" | "message";

export type FormAkismetState = {
  enabled: boolean;
  firstNameField: AkismetFieldValue;
  lastNameField: AkismetFieldValue;
  emailField: AkismetFieldValue;
  websiteField: AkismetFieldValue;
  subject: string;
  content: string;
};

export const AKISMET_FIELD_OPTIONS: { value: AkismetFieldValue; label: string }[] = [
  { value: "", label: "Select a Field" },
  { value: "name-first", label: "Name (First)" },
  { value: "name-last", label: "Name (Last)" },
  { value: "email", label: "Email Address" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone Number" },
  { value: "message", label: "How can we help?" },
];

export const DEFAULT_FORM_AKISMET: FormAkismetState = {
  enabled: true,
  firstNameField: "name-first",
  lastNameField: "name-last",
  emailField: "email",
  websiteField: "",
  subject: "{form_title}",
  content: "{How can we help?:6}",
};
