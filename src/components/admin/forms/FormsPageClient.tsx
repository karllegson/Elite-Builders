"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { FormTemplatesModal } from "@/components/admin/forms/FormTemplatesModal";
import { FormsList } from "@/components/admin/forms/FormsList";
import {
  FORMS_OPEN_TEMPLATES_EVENT,
  type FormTemplate,
} from "@/lib/admin/formTemplates";

export function FormsPageClient() {
  const toast = useAdminToast();
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

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
    toast.info(`Selected "${template.label}" — form builder coming soon.`);
  };

  return (
    <>
      <FormsList />
      <FormTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={closeTemplates}
        onSelectTemplate={handleSelectTemplate}
      />
    </>
  );
}
