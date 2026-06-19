"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AdminToastItem,
  AdminToastOptions,
  AdminToastVariant,
} from "@/components/admin/toast/adminToast.types";

const DEFAULT_DURATION_MS = 3500;

type AdminToastContextValue = {
  show: (message: string, options?: AdminToastOptions) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

export const AdminToastContext = createContext<AdminToastContextValue | null>(
  null,
);

function createToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ToastIcon({ variant }: { variant: AdminToastVariant }) {
  if (variant === "success") {
    return <CheckCircle2 size={18} strokeWidth={2} aria-hidden />;
  }

  if (variant === "error") {
    return <XCircle size={18} strokeWidth={2} aria-hidden />;
  }

  return <Info size={18} strokeWidth={2} aria-hidden />;
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AdminToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);

    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: AdminToastVariant, duration = DEFAULT_DURATION_MS) => {
      const trimmed = message.trim();

      if (!trimmed) {
        return;
      }

      const id = createToastId();
      const toast: AdminToastItem = { id, message: trimmed, variant };

      setToasts((current) => [...current, toast]);

      const timer = window.setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo<AdminToastContextValue>(
    () => ({
      show: (message, options) =>
        push(message, options?.variant ?? "info", options?.duration),
      success: (message, duration) => push(message, "success", duration),
      error: (message, duration) => push(message, "error", duration),
      info: (message, duration) => push(message, "info", duration),
    }),
    [push],
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div
        className="admin-toast-viewport"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`admin-toast admin-toast-${toast.variant}`}
            role={toast.variant === "error" ? "alert" : "status"}
          >
            <span className="admin-toast-icon">
              <ToastIcon variant={toast.variant} />
            </span>
            <p className="admin-toast-message">{toast.message}</p>
            <button
              type="button"
              className="admin-toast-close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              <X size={14} strokeWidth={2} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}
