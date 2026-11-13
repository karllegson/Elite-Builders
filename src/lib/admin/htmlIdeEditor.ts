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

/** Replaces the current selection with `snippet` and selects `selectText` within it. */
function insertSnippetSelecting(
  editorInstance: editor.IStandaloneCodeEditor,
  snippet: string,
  selectText: string,
  selectOffset: number,
) {
  const { start, end } = getEditorSelectionOffsets(editorInstance);

  return applyEditorEdit(editorInstance, start, end, snippet, selectOffset, selectText.length);
}

/** Inserts the Related Posts block and selects the first `link` placeholder. */
export function insertEditorRelatedPosts(editorInstance: editor.IStandaloneCodeEditor) {
  return insertSnippetSelecting(
    editorInstance,
    RELATED_POSTS_SNIPPET,
    RELATED_POSTS_LINK_PLACEHOLDER,
    RELATED_POSTS_SNIPPET.indexOf(`"${RELATED_POSTS_LINK_PLACEHOLDER}"`) + 1,
  );
}

const QUICK_LINKS = [
  { id: "intro", label: "Intro" },
  { id: "services", label: "Services" },
  { id: "why-us", label: "Why Us" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "get-started", label: "Get Started" },
];
const QUICK_LINKS_SNIPPET = [
  `<div class="quick-links" id="quick-links" data-sticky-active-offset=""> <!--Start Quick Links-->`,
  ``,
  `  <div class="title">Quick Links</div>`,
  ``,
  `  <div class="links">`,
  ``,
  ...QUICK_LINKS.map(
    ({ id, label }) => `    <a href="#${id}" data-sticky-label="">${label}</a>`,
  ),
  ``,
  `  </div>`,
  ``,
  `</div> <!--End Quick Links-->`,
].join("\n");

/**
 * Inserts the Quick Links block and selects the first anchor id (`intro`) so it
 * can be renamed to match the target `<h2 id="...">`.
 */
export function insertEditorQuickLinks(editorInstance: editor.IStandaloneCodeEditor) {
  const firstId = QUICK_LINKS[0].id;

  return insertSnippetSelecting(
    editorInstance,
    QUICK_LINKS_SNIPPET,
    firstId,
    QUICK_LINKS_SNIPPET.indexOf(`"#${firstId}"`) + 2,
  );
}

const HORIZONTAL_IMAGE_CARD_SNIPPET = [
  `<div class="image-card single horizontal"> <!-- Start Image Card -->`,
  `  <div class="image-card--image">`,
  `    <img src="" alt="" title="">`,
  `  </div>`,
  `  <div class="image-card--content">`,
  `    <h3 class="title">Title</h3>`,
  `    <p>Body</p>`,
  `    <div class="site-btn"><a href="/">CTA</a></div>`,
  `  </div>`,
  `</div> <!-- End Image Card -->`,
].join("\n");

/** Inserts a Horizontal Image Card with the cursor inside the image `src`. */
export function insertEditorHorizontalImageCard(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(
    editorInstance,
    HORIZONTAL_IMAGE_CARD_SNIPPET,
    HORIZONTAL_IMAGE_CARD_SNIPPET.indexOf(`src="`) + `src="`.length,
  );
}

const TABBED_CONTENTS_TABS = ["Tab 1", "Tab 2"];
const TABBED_CONTENTS_SNIPPET = [
  `<div class="site-tabs">`,
  `  <div class="tabs" role="tablist">`,
  ...TABBED_CONTENTS_TABS.map((label, index) =>
    index === 0
      ? `    <div class="tab active" tabindex="0" role="tab">${label}</div>`
      : `    <div class="tab" role="tab">${label}</div>`,
  ),
  `    <!-- Add/remove tabs as needed -->`,
  `  </div>`,
  ``,
  `  <div class="tab-contents">`,
  ...TABBED_CONTENTS_TABS.flatMap(() => [
    `    <div class="content" role="tabpanel">`,
    `      <h4>Heading</h4>`,
    `      <p>Paragraph</p>`,
    `      <ul>`,
    `        <li>List item</li>`,
    `        <li>List item</li>`,
    `        <li>List item</li>`,
    `      </ul>`,
    `      <p>Paragraph</p>`,
    `      <a href="#" class="button">Button Text</a>`,
    `    </div>`,
    ``,
  ]),
  `    <!-- Add/remove .content blocks for more/fewer tabs -->`,
  `  </div>`,
  `</div>`,
].join("\n");

/** Inserts a two-tab Tabbed Contents block and selects the first tab label. */
export function insertEditorTabbedContents(editorInstance: editor.IStandaloneCodeEditor) {
  const firstLabel = TABBED_CONTENTS_TABS[0];

  return insertSnippetSelecting(
    editorInstance,
    TABBED_CONTENTS_SNIPPET,
    firstLabel,
    TABBED_CONTENTS_SNIPPET.indexOf(`>${firstLabel}<`) + 1,
  );
}

/** Inserts the FAQs shortcode with the cursor inside `category` (slug or name). */
export function insertEditorFaqs(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(editorInstance, `[faqs category=""]`, `[faqs category="`.length);
}

/** Inserts the Reviews shortcode with the cursor inside `amount` (defaults to 3 if empty). */
export function insertEditorReviews(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(
    editorInstance,
    `[reviews amount="" category=""]`,
    `[reviews amount="`.length,
  );
}

export function insertEditorCtaButton(editorInstance: editor.IStandaloneCodeEditor) {
  return insertAtEditorCursor(editorInstance, `[cta-btn]`);
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
