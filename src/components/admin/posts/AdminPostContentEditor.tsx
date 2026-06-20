"use client";

import { highlightHtml } from "@/lib/admin/highlightHtml";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type RefObject,
} from "react";

type AdminPostContentEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  ariaLabel: string;
};

export function AdminPostContentEditor({
  id,
  value,
  onChange,
  textareaRef,
  ariaLabel,
}: AdminPostContentEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineCount = useMemo(() => Math.max(value.split("\n").length, 1), [value]);
  const highlighted = useMemo(() => highlightHtml(value), [value]);

  const syncScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;
    const highlight = highlightRef.current;

    if (!textarea) {
      return;
    }

    if (gutter) {
      gutter.scrollTop = textarea.scrollTop;
    }

    if (highlight) {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    }
  }, [textareaRef]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    syncScroll();

    const observer = new ResizeObserver(() => {
      syncScroll();
    });

    observer.observe(textarea);

    return () => {
      observer.disconnect();
    };
  }, [syncScroll, textareaRef, lineCount]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="admin-post-content-wrap">
      <div className="admin-post-content-editor">
        <div
          ref={gutterRef}
          className="admin-post-content-gutter"
          aria-hidden
        >
          <ol className="admin-post-content-line-numbers">
            {Array.from({ length: lineCount }, (_, index) => (
              <li key={index}>{index + 1}</li>
            ))}
          </ol>
        </div>
        <div className="admin-post-content-code-area">
          <pre
            ref={highlightRef}
            className="admin-post-content-highlight"
            aria-hidden="true"
          >
            <code>{highlighted}</code>
          </pre>
          <textarea
            ref={textareaRef}
            id={id}
            className="admin-post-content admin-post-content-input"
            value={value}
            onChange={handleChange}
            onScroll={syncScroll}
            spellCheck={false}
            aria-label={ariaLabel}
          />
        </div>
      </div>
    </div>
  );
}
