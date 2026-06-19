"use client";

import { Maximize2, Settings2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { PageEditorToolbar } from "@/components/admin/pages/PageEditorToolbar";
import { ReviewEditorSidebar } from "@/components/admin/reviews/ReviewEditorSidebar";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import { countWords } from "@/lib/admin/postEditor";

export function ReviewEditor() {
  const toast = useAdminToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wordCount = countWords(content);
  const lineNumbers = useMemo(() => {
    const count = Math.max(1, content.split("\n").length);
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [content]);

  const handleMediaAction = (label: string) => {
    toast.info(label);
  };

  return (
    <div className={`admin-post-editor admin-page-editor admin-review-editor${isFullscreen ? " is-editor-fullscreen" : ""}`}>
      <div className="admin-post-editor-main">
        <label className="admin-post-title-label" htmlFor="review-title">
          Add title
        </label>
        <input
          id="review-title"
          type="text"
          className="admin-post-title"
          placeholder="Add title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
        />

        <div className="admin-review-toolbar-wrap">
          <PageEditorToolbar
            textareaRef={textareaRef}
            onContentChange={setContent}
            onMediaAction={handleMediaAction}
          />
          <button
            type="button"
            className="admin-review-toolbar-fullscreen"
            aria-label={isFullscreen ? "Exit fullscreen editor" : "Fullscreen editor"}
            onClick={() => setIsFullscreen((current) => !current)}
          >
            <Maximize2 size={14} aria-hidden />
          </button>
        </div>

        <div className="admin-page-content-shell">
          <div className="admin-page-content-linenumbers" aria-hidden>
            {lineNumbers.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <div className="admin-page-content-editor">
            <button
              type="button"
              className="admin-page-content-settings"
              aria-label="Editor settings"
            >
              <Settings2 size={14} aria-hidden />
            </button>
            <textarea
              ref={textareaRef}
              id="review-content"
              className="admin-post-content admin-page-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              spellCheck={false}
              aria-label="Review content"
            />
          </div>
        </div>

        <div className="admin-post-editor-footer admin-page-editor-footer admin-review-editor-footer">
          <div className="admin-review-editor-footer-start">
            <span>Word count: {wordCount}</span>
            <button type="button" className="admin-inline-link admin-page-shortcuts-link">
              Shortcuts ( CTRL + ALT + &quot;below&quot; )
            </button>
          </div>
        </div>
      </div>

      <ReviewEditorSidebar reviewTitle={title} reviewContent={content} />
    </div>
  );
}
