export type FormEditorTab = "edit" | "settings" | "entries";

export type FormSettingsSection =
  | "form-settings"
  | "confirmations"
  | "notifications"
  | "personal-data"
  | "akismet"
  | "post-creation";

export type FormPlacementOption = {
  value: string;
  label: string;
};

export const FORM_LABEL_PLACEMENTS: FormPlacementOption[] = [
  { value: "top", label: "Top aligned" },
  { value: "left", label: "Left aligned" },
  { value: "right", label: "Right aligned" },
];

export const FORM_DESCRIPTION_PLACEMENTS: FormPlacementOption[] = [
  { value: "below", label: "Below inputs" },
  { value: "above", label: "Above inputs" },
];

export const FORM_VALIDATION_PLACEMENTS: FormPlacementOption[] = [
  { value: "below", label: "Below inputs" },
  { value: "above", label: "Above inputs" },
];

export const FORM_SUBLABEL_PLACEMENTS: FormPlacementOption[] = [
  { value: "below", label: "Below inputs" },
  { value: "above", label: "Above inputs" },
];

export type RequiredFieldIndicator = "text" | "asterisk" | "custom";

export type HoneypotAction = "discard" | "mark-spam";

export type FormSettingsState = {
  title: string;
  description: string;
  labelPlacement: string;
  descriptionPlacement: string;
  validationPlacement: string;
  subLabelPlacement: string;
  validationSummary: boolean;
  requiredIndicator: RequiredFieldIndicator;
  requiredCustomText: string;
  cssClassName: string;
  saveAndContinue: boolean;
  limitEntries: boolean;
  scheduleForm: boolean;
  requireLogin: boolean;
  honeypot: boolean;
  honeypotAction: HoneypotAction;
  submissionSpeedCheck: boolean;
  customSpamConfirmation: boolean;
  animatedTransitions: boolean;
};

export const DEFAULT_FORM_SETTINGS: FormSettingsState = {
  title: "",
  description: "",
  labelPlacement: "top",
  descriptionPlacement: "below",
  validationPlacement: "below",
  subLabelPlacement: "below",
  validationSummary: false,
  requiredIndicator: "text",
  requiredCustomText: "",
  cssClassName: "",
  saveAndContinue: false,
  limitEntries: false,
  scheduleForm: false,
  requireLogin: false,
  honeypot: true,
  honeypotAction: "mark-spam",
  submissionSpeedCheck: false,
  customSpamConfirmation: false,
  animatedTransitions: false,
};

export const FORM_SETTINGS_NAV: {
  section: FormSettingsSection;
  label: string;
  path: string;
}[] = [
  { section: "form-settings", label: "Form Settings", path: "" },
  { section: "confirmations", label: "Confirmations", path: "confirmations" },
  { section: "notifications", label: "Notifications", path: "notifications" },
  { section: "personal-data", label: "Personal Data", path: "personal-data" },
  { section: "akismet", label: "Akismet", path: "akismet" },
  { section: "post-creation", label: "Post Creation", path: "post-creation" },
];

export function getFormSettingsHref(formId: number, path = ""): string {
  return path
    ? `/admin/forms/${formId}/settings/${path}`
    : `/admin/forms/${formId}/settings`;
}
