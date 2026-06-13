"use client";

import { useRef, useState, type RefObject } from "react";
import { InsertLinkModal } from "@/components/admin/posts/InsertLinkModal";
import {
  buildLinkSnippet,
  insertH2WithId,
  insertHr,
  insertHtmlAtRange,
  insertShortHr,
  wrapSelection,
  wrapStrongEm,
  type LinkInsertOptions,
} from "@/lib/admin/postEditor";

type PostEditorToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onContentChange: (value: string) => void;
};

type ToolbarButton = {
  label: string;
  action: (textarea: HTMLTextAreaElement) => string;
};

const toolbarButtons: ToolbarButton[] = [
  { label: "H1", action: (textarea) => wrapSelection(textarea, "h1") },
  { label: "H2", action: (textarea) => wrapSelection(textarea, "h2") },
  { label: "H2 w/ ID", action: (textarea) => insertH2WithId(textarea) },
  { label: "H3", action: (textarea) => wrapSelection(textarea, "h3") },
  { label: "H4", action: (textarea) => wrapSelection(textarea, "h4") },
  { label: "p", action: (textarea) => wrapSelection(textarea, "p") },
  { label: "HR", action: (textarea) => insertHr(textarea) },
  { label: "Short HR", action: (textarea) => insertShortHr(textarea) },
  { label: "b", action: (textarea) => wrapSelection(textarea, "strong") },
  { label: "u", action: (textarea) => wrapSelection(textarea, "u") },
  { label: "i", action: (textarea) => wrapSelection(textarea, "em") },
  { label: "/b > i", action: (textarea) => wrapStrongEm(textarea) },
];

export function PostEditorToolbar({
  textareaRef,
  onContentChange,
}: PostEditorToolbarProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [initialLinkText, setInitialLinkText] = useState("");
  const linkSelectionRef = useRef({ start: 0, end: 0 });

  const handleButtonClick = (action: ToolbarButton["action"]) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    onContentChange(action(textarea));
  };

  const openLinkModal = () => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    linkSelectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
    setInitialLinkText(
      textarea.value.slice(textarea.selectionStart, textarea.selectionEnd),
    );
    setLinkModalOpen(true);
  };

  const handleInsertLink = (options: LinkInsertOptions) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const snippet = buildLinkSnippet(options);
    const { start, end } = linkSelectionRef.current;
    onContentChange(insertHtmlAtRange(textarea, start, end, snippet));
  };

  return (
    <>
      <div className="admin-post-toolbar">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            className="admin-post-toolbar-btn"
            onClick={() => handleButtonClick(button.action)}
          >
            {button.label}
          </button>
        ))}
        <button
          type="button"
          className="admin-post-toolbar-btn"
          onClick={openLinkModal}
        >
          link
        </button>
      </div>

      <InsertLinkModal
        isOpen={linkModalOpen}
        initialLinkText={initialLinkText}
        onClose={() => setLinkModalOpen(false)}
        onInsert={handleInsertLink}
      />
    </>
  );
}
