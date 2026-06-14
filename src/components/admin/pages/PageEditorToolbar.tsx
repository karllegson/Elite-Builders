"use client";

import { Camera, Circle, ImageIcon } from "lucide-react";
import { useRef, useState, type RefObject } from "react";
import { InsertLinkModal } from "@/components/admin/posts/InsertLinkModal";
import { buildLinkSnippet, insertHtmlAtRange } from "@/lib/admin/postEditor";
import {
  PAGE_EDITOR_HTML_BUTTONS,
  PAGE_EDITOR_MEDIA_ACTIONS,
  PAGE_EDITOR_SHORTCODE_BUTTONS,
  type LinkInsertOptions,
  type PageToolbarButton,
} from "@/lib/admin/pageEditor";

type PageEditorToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onContentChange: (value: string) => void;
  onMediaAction?: (label: string) => void;
};

const mediaIcons = {
  media: ImageIcon,
  gallery: Camera,
  form: Circle,
};

function ToolbarButton({
  button,
  onClick,
}: {
  button: PageToolbarButton;
  onClick: () => void;
}) {
  const variantClass = button.variant
    ? ` admin-page-toolbar-btn-${button.variant}`
    : "";

  return (
    <button
      type="button"
      className={`admin-page-toolbar-btn${variantClass}`}
      onClick={onClick}
    >
      {button.label}
    </button>
  );
}

export function PageEditorToolbar({
  textareaRef,
  onContentChange,
  onMediaAction,
}: PageEditorToolbarProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [initialLinkText, setInitialLinkText] = useState("");
  const linkSelectionRef = useRef({ start: 0, end: 0 });

  const runAction = (action: PageToolbarButton["action"]) => {
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
      <div className="admin-page-toolbar">
        <div className="admin-page-toolbar-media">
          {PAGE_EDITOR_MEDIA_ACTIONS.map((action) => {
            const Icon = mediaIcons[action.icon];

            return (
              <button
                key={action.label}
                type="button"
                className="admin-page-toolbar-media-btn"
                onClick={() => onMediaAction?.(action.label)}
              >
                <Icon size={16} aria-hidden />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>

        <div className="admin-page-toolbar-grid">
          {PAGE_EDITOR_HTML_BUTTONS.map((button) => (
            <ToolbarButton
              key={button.label}
              button={button}
              onClick={() => runAction(button.action)}
            />
          ))}
          <button
            type="button"
            className="admin-page-toolbar-btn"
            onClick={openLinkModal}
          >
            link
          </button>
          {PAGE_EDITOR_SHORTCODE_BUTTONS.map((button) => (
            <ToolbarButton
              key={button.label}
              button={button}
              onClick={() => runAction(button.action)}
            />
          ))}
        </div>
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
