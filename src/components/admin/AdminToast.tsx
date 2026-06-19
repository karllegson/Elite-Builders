"use client";

import { useEffect } from "react";

type AdminToastProps = {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
  variant?: "success" | "error";
};

export function AdminToast({
  message,
  onDismiss,
  durationMs = 4000,
  variant = "success",
}: AdminToastProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(onDismiss, durationMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message, onDismiss, durationMs]);

  if (!message) {
    return null;
  }

  return (
    <div
      className={`admin-toast admin-toast-${variant}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
