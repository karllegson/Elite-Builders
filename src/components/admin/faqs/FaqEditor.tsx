"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AdminPostContentEditor } from "@/components/admin/posts/AdminPostContentEditor";
import { PostEditorToolbar } from "@/components/admin/posts/PostEditorToolbar";
import { FaqEditorSidebar } from "@/components/admin/faqs/FaqEditorSidebar";
import { countWords } from "@/lib/admin/postEditor";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { getFaqById, upsertFaq } from "@/lib/admin/faqsData";

type FaqEditorProps = {
  faqId?: string;
};

export function FaqEditor({ faqId }: FaqEditorProps) {
  const toast = useAdminToast();
  const router = useRouter();
  const isEditing = Boolean(faqId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recordId, setRecordId] = useState<string | undefined>(faqId);
  const [loaded, setLoaded] = useState(!isEditing);
  const [missing, setMissing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const wordCount = countWords(content);

  useEffect(() => {
    if (!faqId) {
      return;
    }

    const record = getFaqById(faqId);

    if (!record) {
      setMissing(true);
      setLoaded(true);
      return;
    }

    setTitle(record.title);
    setContent(record.content);
    setCategoryId(record.categoryId);
    setLoaded(true);
  }, [faqId]);

  const persistFaq = (status: "published" | "draft") => {
    if (!title.trim()) {
      toast.error("Add a title before saving.");
      return;
    }

    const saved = upsertFaq({
      id: recordId,
      title,
      content,
      status,
      categoryId,
    });

    if (!recordId) {
      setRecordId(saved.id);
      router.replace(`/admin/faqs/${saved.id}`);
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

        <PostEditorToolbar textareaRef={textareaRef} onContentChange={setContent} />

        <AdminPostContentEditor
          id="faq-content"
          value={content}
          onChange={setContent}
          textareaRef={textareaRef}
          ariaLabel="FAQ content"
        />

        <div className="admin-post-editor-footer">
          <span>Word count: {wordCount}</span>
        </div>
      </div>

      <FaqEditorSidebar
        title={title}
        content={content}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        onPublish={() => persistFaq("published")}
        onSaveDraft={() => persistFaq("draft")}
        primaryActionLabel={recordId || isEditing ? "Update" : "Publish"}
      />
    </div>
  );
}
