"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { FormTemplatePreview } from "@/components/admin/forms/FormTemplatePreview";
import { FORM_TEMPLATES, type FormTemplate } from "@/lib/admin/formTemplates";

export type FormTemplatesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: FormTemplate) => void;
};

export function FormTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: FormTemplatesModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (template: FormTemplate) => {
    onSelectTemplate?.(template);
    onClose();
  };

  return (
    <div className="admin-link-modal-backdrop" onClick={onClose}>
      <div
        className="admin-form-templates-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-templates-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-form-templates-header">
          <div>
            <h2 id="form-templates-title">Explore Form Templates</h2>
            <p className="admin-form-templates-subtitle">
              Quickly create an amazing form by using a pre-made template, or start from scratch
              to tailor your form to your specific needs.
            </p>
          </div>
          <button
            type="button"
            className="admin-form-templates-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="admin-form-templates-body">
          <div className="admin-form-templates-grid">
            {FORM_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                className="admin-form-template-card"
                onClick={() => handleSelect(template)}
              >
                <FormTemplatePreview template={template} />
                <span className="admin-form-template-label">{template.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
