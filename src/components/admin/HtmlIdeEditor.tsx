"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { editor } from "monaco-editor";
import { InsertLinkModal } from "@/components/admin/posts/InsertLinkModal";
import { countWords } from "@/lib/admin/postEditor";
import { buildLinkSnippet, type LinkInsertOptions } from "@/lib/admin/postEditor";
import {
  insertEditorH2WithId,
  insertEditorHighlightBox,
  insertEditorQuickSummary,
  insertEditorHr,
  insertEditorShortHr,
  insertHtmlAtEditorRange,
  wrapEditorSelection,
  wrapEditorStrongEm,
} from "@/lib/admin/htmlIdeEditor";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="admin-html-ide-loading" aria-hidden>
      Loading editor…
    </div>
  ),
});

type ToolbarButton = {
  label: string;
  action: (editorInstance: editor.IStandaloneCodeEditor) => string;
};

const toolbarButtons: ToolbarButton[] = [
  { label: "H1", action: (ed) => wrapEditorSelection(ed, "h1") },
  { label: "H2", action: (ed) => wrapEditorSelection(ed, "h2") },
  { label: "H2 w/ ID", action: insertEditorH2WithId },
  { label: "H3", action: (ed) => wrapEditorSelection(ed, "h3") },
  { label: "H4", action: (ed) => wrapEditorSelection(ed, "h4") },
  { label: "p", action: (ed) => wrapEditorSelection(ed, "p") },
  { label: "HR", action: insertEditorHr },
  { label: "Short HR", action: insertEditorShortHr },
  { label: "Highlight Box", action: insertEditorHighlightBox },
  { label: "Quick Summary", action: insertEditorQuickSummary },
  { label: "b", action: (ed) => wrapEditorSelection(ed, "strong") },
  { label: "u", action: (ed) => wrapEditorSelection(ed, "u") },
  { label: "i", action: (ed) => wrapEditorSelection(ed, "em") },
  { label: "/b > i", action: wrapEditorStrongEm },
];

type HtmlIdeEditorProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
};

export function HtmlIdeEditor({
  id = "html-ide-editor",
  value,
  onChange,
  ariaLabel = "HTML content editor",
}: HtmlIdeEditorProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [initialLinkText, setInitialLinkText] = useState("");
  const linkSelectionRef = useRef({ start: 0, end: 0 });
  const wordCount = countWords(value);

  const runToolbarAction = (action: ToolbarButton["action"]) => {
    const editorInstance = editorRef.current;

    if (!editorInstance) {
      return;
    }

    onChange(action(editorInstance));
  };

  const openLinkModal = () => {
    const editorInstance = editorRef.current;
    const model = editorInstance?.getModel();
    const selection = editorInstance?.getSelection();

    if (!editorInstance || !model || !selection) {
      return;
    }

    const start = model.getOffsetAt(selection.getStartPosition());
    const end = model.getOffsetAt(selection.getEndPosition());

    linkSelectionRef.current = { start, end };
    setInitialLinkText(model.getValue().slice(start, end));
    setLinkModalOpen(true);
  };

  const handleInsertLink = (options: LinkInsertOptions) => {
    const editorInstance = editorRef.current;

    if (!editorInstance) {
      return;
    }

    const snippet = buildLinkSnippet(options);
    const { start, end } = linkSelectionRef.current;
    onChange(insertHtmlAtEditorRange(editorInstance, start, end, snippet));
  };

  const handleEditorMount = (editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;
    setEditorReady(true);
    requestAnimationFrame(() => editorInstance.layout());
    editorInstance.focus();
  };

  useEffect(() => {
    if (!editorReady) {
      return;
    }

    const editorInstance = editorRef.current;
    const surface = surfaceRef.current;

    if (!editorInstance || !surface) {
      return;
    }

    const relayout = () => {
      requestAnimationFrame(() => editorInstance.layout());
    };

    relayout();

    const observer = new ResizeObserver(relayout);
    observer.observe(surface);

    if (surface.parentElement) {
      observer.observe(surface.parentElement);
    }

    window.addEventListener("resize", relayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", relayout);
    };
  }, [editorReady]);
  return (
    <div className="admin-html-ide">
      <div className="admin-post-toolbar admin-html-ide-toolbar">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            type="button"
            className="admin-post-toolbar-btn"
            onClick={() => runToolbarAction(button.action)}
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

      <div className="admin-html-ide-surface" id={id} ref={surfaceRef}>
        <MonacoEditor
          language="html"
          theme="vs-dark"
          height="100%"
          width="100%"
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          onMount={handleEditorMount}
          options={{
            ariaLabel,
            automaticLayout: true,
            minimap: { enabled: true, scale: 1 },
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            renderLineHighlight: "all",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            wordWrapBreakAfterCharacters: " \t})]>+;.,",
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: 13,
            lineHeight: 20,
            padding: { top: 12, bottom: 12 },
            tabSize: 2,
            insertSpaces: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            bracketPairColorization: { enabled: true },
            guides: {
              indentation: true,
              bracketPairs: true,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 12,
              horizontal: "hidden",
              horizontalScrollbarSize: 0,
            },
          }}
        />
      </div>

      <div className="admin-post-editor-footer admin-html-ide-footer">
        <span>Word count: {wordCount}</span>
      </div>

      <InsertLinkModal
        isOpen={linkModalOpen}
        initialLinkText={initialLinkText}
        onClose={() => setLinkModalOpen(false)}
        onInsert={handleInsertLink}
      />
    </div>
  );
}
