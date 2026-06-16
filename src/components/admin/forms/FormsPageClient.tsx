"use client";

import { useCallback, useEffect, useState } from "react";
import { FormTemplatesModal } from "@/components/admin/forms/FormTemplatesModal";
import { FormsList } from "@/components/admin/forms/FormsList";
import {
  FORMS_OPEN_TEMPLATES_EVENT,
  type FormTemplate,
} from "@/lib/admin/formTemplates";

export function FormsPageClient() {
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const openTemplates = useCallback(() => {
    setIsTemplatesOpen(true);
  }, []);

  const closeTemplates = useCallback(() => {
    setIsTemplatesOpen(false);
  }, []);

  useEffect(() => {
    const handleOpen = () => {
      openTemplates();
    };

    window.addEventListener(FORMS_OPEN_TEMPLATES_EVENT, handleOpen);

    return () => {
      window.removeEventListener(FORMS_OPEN_TEMPLATES_EVENT, handleOpen);
    };
  }, [openTemplates]);

  const handleSelectTemplate = (template: FormTemplate) => {
    setStatusMessage(`Selected "${template.label}" — form builder coming soon.`);
    window.setTimeout(() => setStatusMessage(""), 3000);
  };

  return (
    <>
      {statusMessage ? (
        <p className="admin-posts-status-message" role="status">
          {statusMessage}
        </p>
      ) : null}
      <FormsList />
      <FormTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={closeTemplates}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
}
