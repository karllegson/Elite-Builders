export type RetentionPolicy = "retain" | "trash" | "delete";

export type FormPersonalDataState = {
  preventIpStorage: boolean;
  retentionPolicy: RetentionPolicy;
  enableExportErase: boolean;
};

export const DEFAULT_FORM_PERSONAL_DATA: FormPersonalDataState = {
  preventIpStorage: false,
  retentionPolicy: "retain",
  enableExportErase: false,
};

export const RETENTION_POLICY_OPTIONS: {
  value: RetentionPolicy;
  label: string;
}[] = [
  { value: "retain", label: "Retain entries indefinitely" },
  { value: "trash", label: "Trash entries automatically" },
  { value: "delete", label: "Delete entries permanently automatically" },
];
