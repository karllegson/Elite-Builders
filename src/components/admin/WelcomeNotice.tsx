"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/admin/config";

const STORAGE_KEY = "eb-admin-welcome-dismissed";

export function WelcomeNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="admin-welcome-notice">
      <button
        type="button"
        className="admin-welcome-dismiss"
        onClick={dismiss}
        aria-label="Dismiss welcome notice"
      >
        <X size={16} />
      </button>
      <h2>{siteConfig.name}</h2>
      <p>
        Welcome to the administration area. To report an issue, please reach out
        to{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
        .
      </p>
    </div>
  );
}
