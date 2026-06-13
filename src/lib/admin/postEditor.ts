export function countWords(html: string): number {
  const stripped = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  if (!stripped) {
    return 0;
  }

  return stripped.split(/\s+/).filter(Boolean).length;
}

export function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  snippet: string,
  cursorOffset = snippet.length,
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const nextValue =
    textarea.value.slice(0, start) + snippet + textarea.value.slice(end);

  textarea.value = nextValue;
  textarea.focus();

  const cursor = start + cursorOffset;
  textarea.setSelectionRange(cursor, cursor);

  return nextValue;
}

export function insertHtmlAtRange(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
  snippet: string,
): string {
  const nextValue =
    textarea.value.slice(0, start) + snippet + textarea.value.slice(end);

  textarea.value = nextValue;
  textarea.focus();

  const cursor = start + snippet.length;
  textarea.setSelectionRange(cursor, cursor);

  return nextValue;
}

export function wrapSelection(
  textarea: HTMLTextAreaElement,
  tag: string,
  attributes: Record<string, string> = {},
): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const attrString = Object.entries(attributes)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");
  const openTag = `<${tag}${attrString}>`;
  const closeTag = `</${tag}>`;
  const nextValue =
    textarea.value.slice(0, start) +
    openTag +
    selected +
    closeTag +
    textarea.value.slice(end);

  textarea.value = nextValue;
  textarea.focus();

  if (selected) {
    const cursor = start + openTag.length + selected.length + closeTag.length;
    textarea.setSelectionRange(cursor, cursor);
  } else {
    const cursor = start + openTag.length;
    textarea.setSelectionRange(cursor, cursor);
  }

  return nextValue;
}

export function insertH2WithId(textarea: HTMLTextAreaElement): string {
  const snippet = `<h2 id="">`;
  return insertAtCursor(textarea, snippet, `<h2 id="`.length);
}

export function insertHr(textarea: HTMLTextAreaElement): string {
  return insertAtCursor(textarea, `<hr>`);
}

export function insertShortHr(textarea: HTMLTextAreaElement): string {
  return insertAtCursor(textarea, `<hr class="short">`);
}

export function wrapStrongEm(textarea: HTMLTextAreaElement): string {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const openTag = `<strong><em>`;
  const closeTag = `</em></strong>`;
  const nextValue =
    textarea.value.slice(0, start) +
    openTag +
    selected +
    closeTag +
    textarea.value.slice(end);

  textarea.value = nextValue;
  textarea.focus();

  if (selected) {
    const cursor = start + openTag.length + selected.length + closeTag.length;
    textarea.setSelectionRange(cursor, cursor);
  } else {
    const cursor = start + openTag.length;
    textarea.setSelectionRange(cursor, cursor);
  }

  return nextValue;
}

export type LinkInsertOptions = {
  url: string;
  linkText: string;
  linkTitle?: string;
  openInNewTab?: boolean;
  relNofollow?: boolean;
  relSponsored?: boolean;
};

export function buildLinkSnippet(options: LinkInsertOptions): string {
  const href = options.url.trim();
  const text = options.linkText.trim() || href;
  const attrs: string[] = [`href="${escapeHtmlAttr(href)}"`];

  if (options.linkTitle?.trim()) {
    attrs.push(`title="${escapeHtmlAttr(options.linkTitle.trim())}"`);
  }

  if (options.openInNewTab) {
    attrs.push('target="_blank"');
  }

  const relValues: string[] = [];

  if (options.openInNewTab) {
    relValues.push("noopener", "noreferrer");
  }

  if (options.relNofollow) {
    relValues.push("nofollow");
  }

  if (options.relSponsored) {
    relValues.push("sponsored");
  }

  if (relValues.length > 0) {
    attrs.push(`rel="${relValues.join(" ")}"`);
  }

  return `<a ${attrs.join(" ")}>${text}</a>`;
}
