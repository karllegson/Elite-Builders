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

type EditorPosition = { lineNumber: number; column: number };

/**
 * Position reached after typing `text` from `from`. Counted in lines and
 * columns (not character offsets) so it stays correct when Monaco converts
 * the snippet's `\n` to the document's CRLF line endings.
 */
function positionAfterText(from: EditorPosition, text: string): EditorPosition {
  const lines = text.split("\n");

  if (lines.length === 1) {
    return { lineNumber: from.lineNumber, column: from.column + text.length };
  }

  return {
    lineNumber: from.lineNumber + lines.length - 1,
    column: lines[lines.length - 1].length + 1,
  };
}

function applyEditorEdit(
  editorInstance: editor.IStandaloneCodeEditor,
  start: number,
  end: number,
  text: string,
  cursorOffset = text.length,
  selectionLength = 0,
) {
  const model = getModel(editorInstance);

  if (!model) {
    return "";
  }

  const startPosition = model.getPositionAt(start);
  const endPosition = model.getPositionAt(end);
  const range = {
    startLineNumber: startPosition.lineNumber,
    startColumn: startPosition.column,
    endLineNumber: endPosition.lineNumber,
    endColumn: endPosition.column,
  };

  editorInstance.executeEdits("html-toolbar", [
    {
      range,
      text,
      forceMoveMarkers: true,
    },
  ]);

  const cursor = positionAfterText(startPosition, text.slice(0, cursorOffset));
  const selectionEnd = positionAfterText(
    startPosition,
    text.slice(0, cursorOffset + selectionLength),
  );
  editorInstance.setSelection({
    startLineNumber: cursor.lineNumber,
    startColumn: cursor.column,
    endLineNumber: selectionEnd.lineNumber,
    endColumn: selectionEnd.column,
  });
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

function buildAttributeString(attributes: Record<string, string>) {
  return Object.entries(attributes)
    .map(([key, attrValue]) => ` ${key}="${attrValue}"`)
    .join("");
}

export function wrapEditorSelection(
  editorInstance: editor.IStandaloneCodeEditor,
  tag: string,
  attributes: Record<string, string> = {},
) {
  const { start, end, value } = getEditorSelectionOffsets(editorInstance);
  const selected = value.slice(start, end);
  const openTag = `<${tag}${buildAttributeString(attributes)}>`;
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

const QUICK_SUMMARY_SNIPPET = `<div class="highlight-box">\n  <span>Quick Summary</span>\n  <p></p>\n</div>`;
const QUICK_SUMMARY_CURSOR_OFFSET =
  `<div class="highlight-box">\n  <span>Quick Summary</span>\n  <p>`.length;

export function insertEditorQuickSummary(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(
    editorInstance,
    QUICK_SUMMARY_SNIPPET,
    QUICK_SUMMARY_CURSOR_OFFSET,
  );
}

export function insertEditorImage(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(editorInstance, `<img src="" alt="">`, `<img src="`.length);
}

const DEFAULT_LIST_ITEM_COUNT = 3;

/**
 * Inserts a list with a blank line after the opening tag and before the
 * closing tag. With text selected, each non-empty selected line becomes a list
 * item; otherwise three empty items are inserted with the cursor in the first.
 */
export function insertEditorList(
  editorInstance: editor.IStandaloneCodeEditor,
  tag: "ul" | "ol",
  attributes: Record<string, string> = {},
) {
  const { start, end, value } = getEditorSelectionOffsets(editorInstance);
  const selectedItems = value
    .slice(start, end)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const items =
    selectedItems.length > 0 ? selectedItems : Array<string>(DEFAULT_LIST_ITEM_COUNT).fill("");
  const openTag = `<${tag}${buildAttributeString(attributes)}>\n\n`;
  const listItems = items.map((item) => `  <li>${item}</li>`).join("\n");
  const snippet = `${openTag}${listItems}\n\n</${tag}>`;
  const cursorOffset =
    selectedItems.length > 0 ? snippet.length : `${openTag}  <li>`.length;

  return applyEditorEdit(editorInstance, start, end, snippet, cursorOffset);
}

const RELATED_POSTS_LINK_PLACEHOLDER = "link";
const RELATED_POSTS_SNIPPET = [
  `<div class="related-links">  <!--Start Related Posts-->`,
  ``,
  `  <h5>Related Posts</h5>`,
  `  <ul>`,
  ``,
  `    <li> <a href="${RELATED_POSTS_LINK_PLACEHOLDER}">First Related Post Title</a> </li>`,
  `    <li> <a href="${RELATED_POSTS_LINK_PLACEHOLDER}">Second Related Post Title</a> </li>`,
  `    <li> <a href="${RELATED_POSTS_LINK_PLACEHOLDER}">Third Related Post Title</a> </li>`,
  ``,
  `  </ul>`,
  `</div> <!--End Related Posts-->`,
].join("\n");

/** Inserts the Related Posts block and selects the first `link` placeholder. */
export function insertEditorRelatedPosts(editorInstance: editor.IStandaloneCodeEditor) {
  const { start, end } = getEditorSelectionOffsets(editorInstance);
  const placeholderOffset =
    RELATED_POSTS_SNIPPET.indexOf(`"${RELATED_POSTS_LINK_PLACEHOLDER}"`) + 1;

  return applyEditorEdit(
    editorInstance,
    start,
    end,
    RELATED_POSTS_SNIPPET,
    placeholderOffset,
    RELATED_POSTS_LINK_PLACEHOLDER.length,
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
