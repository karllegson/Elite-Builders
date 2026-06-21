import type { editor } from "monaco-editor";

function getModel(editorInstance: editor.IStandaloneCodeEditor) {
  return editorInstance.getModel();
}

export function getEditorSelectionOffsets(editorInstance: editor.IStandaloneCodeEditor) {
  const model = getModel(editorInstance);
  const selection = editorInstance.getSelection();

  if (!model || !selection) {
    return { start: 0, end: 0, value: "" };
  }

  return {
    start: model.getOffsetAt(selection.getStartPosition()),
    end: model.getOffsetAt(selection.getEndPosition()),
    value: model.getValue(),
  };
}

function applyEditorEdit(
  editorInstance: editor.IStandaloneCodeEditor,
  start: number,
  end: number,
  text: string,
  cursorOffset = text.length,
) {
  const model = getModel(editorInstance);

  if (!model) {
    return "";
  }

  const range = {
    startLineNumber: model.getPositionAt(start).lineNumber,
    startColumn: model.getPositionAt(start).column,
    endLineNumber: model.getPositionAt(end).lineNumber,
    endColumn: model.getPositionAt(end).column,
  };

  editorInstance.executeEdits("html-toolbar", [
    {
      range,
      text,
      forceMoveMarkers: true,
    },
  ]);

  const cursor = start + cursorOffset;
  const position = model.getPositionAt(cursor);
  editorInstance.setPosition(position);
  editorInstance.focus();

  return model.getValue();
}

export function insertAtEditorCursor(
  editorInstance: editor.IStandaloneCodeEditor,
  snippet: string,
  cursorOffset = snippet.length,
) {
  const { start, end } = getEditorSelectionOffsets(editorInstance);
  return applyEditorEdit(editorInstance, start, end, snippet, cursorOffset);
}

export function insertHtmlAtEditorRange(
  editorInstance: editor.IStandaloneCodeEditor,
  start: number,
  end: number,
  snippet: string,
) {
  return applyEditorEdit(editorInstance, start, end, snippet, snippet.length);
}

export function wrapEditorSelection(
  editorInstance: editor.IStandaloneCodeEditor,
  tag: string,
  attributes: Record<string, string> = {},
) {
  const { start, end, value } = getEditorSelectionOffsets(editorInstance);
  const selected = value.slice(start, end);
  const attrString = Object.entries(attributes)
    .map(([key, attrValue]) => ` ${key}="${attrValue}"`)
    .join("");
  const openTag = `<${tag}${attrString}>`;
  const closeTag = `</${tag}>`;
  const snippet = `${openTag}${selected}${closeTag}`;
  const cursorOffset = selected
    ? openTag.length + selected.length + closeTag.length
    : openTag.length;

  return applyEditorEdit(editorInstance, start, end, snippet, cursorOffset);
}

export function insertEditorH2WithId(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(editorInstance, `<h2 id="">`, `<h2 id="`.length);
}

export function insertEditorHr(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(editorInstance, `<hr>`);
}

export function insertEditorShortHr(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(editorInstance, `<hr class="short">`);
}

const HIGHLIGHT_BOX_SNIPPET = `<div class="highlight-box" style="margin:0 0 1.5rem;padding:1.25rem 1.5rem;background:#f7f8f9;border:1px solid #e2e5e9;border-radius:0.375rem"> <!-- Start Highlight Box -->\n  \n</div> <!-- End Highlight Box -->`;
const HIGHLIGHT_BOX_CURSOR_OFFSET =
  `<div class="highlight-box" style="margin:0 0 1.5rem;padding:1.25rem 1.5rem;background:#f7f8f9;border:1px solid #e2e5e9;border-radius:0.375rem"> <!-- Start Highlight Box -->\n  `.length;

export function insertEditorHighlightBox(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(
    editorInstance,
    HIGHLIGHT_BOX_SNIPPET,
    HIGHLIGHT_BOX_CURSOR_OFFSET,
  );
}

const QUICK_SUMMARY_SNIPPET = `<div class="quick-summary" style="margin:0 0 1.5rem;padding:1.25rem 1.5rem;background:#f7f8f9;border:1px solid #e2e5e9;border-radius:0.375rem">\n  <h2 style="margin:0 0 0.75rem;font-size:clamp(1.35rem,2.2vw,1.75rem);font-weight:700;color:#00205b">Quick Summary</h2>\n  <p style="margin:0;color:#353638;font-style:normal;line-height:1.75"></p>\n</div>`;
const QUICK_SUMMARY_CURSOR_OFFSET = `<div class="quick-summary" style="margin:0 0 1.5rem;padding:1.25rem 1.5rem;background:#f7f8f9;border:1px solid #e2e5e9;border-radius:0.375rem">\n  <h2 style="margin:0 0 0.75rem;font-size:clamp(1.35rem,2.2vw,1.75rem);font-weight:700;color:#00205b">Quick Summary</h2>\n  <p style="margin:0;color:#353638;font-style:normal;line-height:1.75">`.length;

export function insertEditorQuickSummary(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(
    editorInstance,
    QUICK_SUMMARY_SNIPPET,
    QUICK_SUMMARY_CURSOR_OFFSET,
  );
}

export function wrapEditorStrongEm(editorInstance: editor.IStandaloneCodeEditor) {
  const { start, end, value } = getEditorSelectionOffsets(editorInstance);
  const selected = value.slice(start, end);
  const openTag = `<strong><em>`;
  const closeTag = `</em></strong>`;
  const snippet = `${openTag}${selected}${closeTag}`;
  const cursorOffset = selected
    ? openTag.length + selected.length + closeTag.length
    : openTag.length;

  return applyEditorEdit(editorInstance, start, end, snippet, cursorOffset);
}
