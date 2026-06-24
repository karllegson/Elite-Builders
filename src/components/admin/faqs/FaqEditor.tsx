"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchFaqForEditAction,
  saveFaqAction,
} from "@/app/admin/(shell)/faqs/actions";
import { HtmlIdeEditor } from "@/components/admin/HtmlIdeEditor";
import { FaqEditorSidebar } from "@/components/admin/faqs/FaqEditorSidebar";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";

type FaqEditorProps = {
  faqId?: string;
};

export function FaqEditor({ faqId }: FaqEditorProps) {
  const toast = useAdminToast();
  const router = useRouter();
  const isEditing = Boolean(faqId);
  const [recordId, setRecordId] = useState<string | undefined>(faqId);
  const [loaded, setLoaded] = useState(!isEditing);
  const [missing, setMissing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!faqId) {
      return;
    }

    void (async () => {
      const result = await fetchFaqForEditAction(faqId);

      if (!result.faq) {
        setMissing(true);
        setLoaded(true);
        return;
      }

      setTitle(result.faq.title);
      setContent(result.faq.content);
      setCategoryId(result.faq.categoryId);
      setLoaded(true);
    })();
  }, [faqId]);

  const persistFaq = async (status: "published" | "draft") => {
    if (!title.trim()) {
      toast.error("Add a title before saving.");
      return;
    }

    if (!categoryId) {
      toast.error("Select a category before saving.");
      return;
    }

    setIsSaving(true);

    const result = await saveFaqAction({
      id: recordId,
      title,
      content,
      status,
      categoryId,
    });

    setIsSaving(false);

    if (result.error || !result.faq) {
      toast.error(result.error ?? "Could not save FAQ.");
      return;
    }

    if (!recordId) {
      setRecordId(result.faq.id);
      router.replace(`/admin/faqs/${result.faq.id}`);
    }

    toast.success(
      status === "published"
        ? recordId || isEditing
          ? "FAQ updated."
          : "FAQ published."
        : "Draft saved.",
    );
  };

  if (!loaded) {
    return <p className="admin-post-editor-status">Loading FAQ…</p>;
  }

  if (missing) {
    return (
      <div className="admin-post-editor">
        <p className="admin-categories-status-message admin-post-editor-status" role="status">
          FAQ not found. <Link href="/admin/faqs">Return to all FAQs</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-post-editor">
      <div className="admin-post-editor-main">
        <label className="admin-post-title-label" htmlFor="faq-title">
          {isEditing ? "Edit title" : "Add title"}
        </label>
        <input
          id="faq-title"
          type="text"
          className="admin-post-title"
          placeholder="Add title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
        />

        <HtmlIdeEditor
          id="faq-content"
          value={content}
          onChange={setContent}
          ariaLabel="FAQ HTML content"
        />
      </div>

      <FaqEditorSidebar
        title={title}
        content={content}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        onPublish={() => void persistFaq("published")}
        onSaveDraft={() => void persistFaq("draft")}
        primaryActionLabel={
          isSaving ? "Saving…" : recordId || isEditing ? "Update" : "Publish"
        }
        isSaving={isSaving}
      />
    </div>
  );
}
