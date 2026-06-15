"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PostEditorToolbar } from "@/components/admin/posts/PostEditorToolbar";
import { FaqEditorSidebar } from "@/components/admin/faqs/FaqEditorSidebar";
import { countWords } from "@/lib/admin/postEditor";
import { getFaqById, upsertFaq } from "@/lib/admin/faqsData";

type FaqEditorProps = {
  faqId?: string;
};

export function FaqEditor({ faqId }: FaqEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(faqId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [recordId, setRecordId] = useState<string | undefined>(faqId);
  const [loaded, setLoaded] = useState(!isEditing);
  const [missing, setMissing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

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
      setSaveMessage("Add a title before saving.");
      window.setTimeout(() => setSaveMessage(""), 3000);
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

    setSaveMessage(
      status === "published"
        ? recordId || isEditing
          ? "FAQ updated."
          : "FAQ published."
        : "Draft saved.",
    );
    window.setTimeout(() => setSaveMessage(""), 4000);
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
      {saveMessage ? (
        <p className="admin-categories-status-message admin-post-editor-status" role="status">
          {saveMessage}
        </p>
      ) : null}

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

        <div className="admin-post-content-wrap">
          <textarea
            ref={textareaRef}
            id="faq-content"
            className="admin-post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            spellCheck={false}
            aria-label="FAQ content"
          />
        </div>

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
