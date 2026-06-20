export type AdminToastVariant = "success" | "error" | "info";

export type AdminToastItem = {
  id: string;
  message: string;
  variant: AdminToastVariant;
};

export type AdminToastOptions = {
  variant?: AdminToastVariant;
  duration?: number;
};
