import { createElement, type ReactNode } from "react";

const COMMENT_RE = /<!--[\s\S]*?-->/g;
const TAG_RE = /<\/?[\w-]+(?:\s+[\w-:@.-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/g;
const ATTR_PAIR_RE =
  /([\w-:@]+)(=(?:("([^"]*)")|('([^']*)')|([^\s>]+)))?/g;

function hlSpan(className: string, text: string, key: string): ReactNode {
  return createElement("span", { key, className }, text);
}

function highlightAttributes(
  attrSource: string,
  keyPrefix: string,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of attrSource.matchAll(ATTR_PAIR_RE)) {
    const full = match[0];
    const name = match[1];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(attrSource.slice(lastIndex, start));
    }

    const eqAndValue = full.slice(name.length);
    nodes.push(
      hlSpan(
        "admin-post-content-hl-attr",
        name,
        `${keyPrefix}-attr-name-${matchIndex}`,
      ),
    );

    if (eqAndValue) {
      const valueMatch = eqAndValue.match(
        /^=(("([^"]*)")|('([^']*)')|([^\s>]+))/,
      );

      if (valueMatch) {
        nodes.push("=");
        nodes.push(
          hlSpan(
            "admin-post-content-hl-value",
            valueMatch[0].slice(1),
            `${keyPrefix}-attr-value-${matchIndex}`,
          ),
        );
      } else {
        nodes.push(eqAndValue);
      }
    }

    lastIndex = start + full.length;
    matchIndex += 1;
  }

  if (lastIndex < attrSource.length) {
    nodes.push(attrSource.slice(lastIndex));
  }

  return nodes;
}

function highlightTag(tag: string, key: string): ReactNode[] {
  const open = tag.startsWith("</") ? "</" : "<";
  const close = tag.endsWith("/>") ? "/>" : ">";
  const inner = tag.slice(open.length, tag.length - close.length);

  const nameMatch = inner.match(/^([\w-]+)([\s\S]*)$/);
  if (!nameMatch) {
    return [hlSpan("admin-post-content-hl-tag", tag, key)];
  }

  const [, tagName, rest] = nameMatch;
  const nodes: ReactNode[] = [
    hlSpan("admin-post-content-hl-tag", open, `${key}-open`),
    hlSpan("admin-post-content-hl-tag", tagName, `${key}-name`),
  ];

  if (rest) {
    nodes.push(...highlightAttributes(rest, `${key}-attrs`));
  }

  nodes.push(hlSpan("admin-post-content-hl-tag", close, `${key}-close`));
  return nodes;
}

function highlightLine(line: string, lineKey: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  const segments: Array<{ start: number; end: number; kind: "comment" | "tag" }> =
    [];

  for (const match of line.matchAll(COMMENT_RE)) {
    const start = match.index ?? 0;
    segments.push({ start, end: start + match[0].length, kind: "comment" });
  }

  for (const match of line.matchAll(TAG_RE)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const overlapsComment = segments.some(
      (segment) =>
        segment.kind === "comment" && start >= segment.start && start < segment.end,
    );

    if (!overlapsComment) {
      segments.push({ start, end, kind: "tag" });
    }
  }

  segments.sort((left, right) => left.start - right.start);

  for (const segment of segments) {
    if (segment.start > cursor) {
      nodes.push(line.slice(cursor, segment.start));
    }

    const text = line.slice(segment.start, segment.end);
    const key = `line-${lineKey}-token-${tokenIndex}`;

    if (segment.kind === "comment") {
      nodes.push(hlSpan("admin-post-content-hl-comment", text, key));
    } else {
      nodes.push(...highlightTag(text, key));
    }

    cursor = segment.end;
    tokenIndex += 1;
  }

  if (cursor < line.length) {
    nodes.push(line.slice(cursor));
  }

  if (nodes.length === 0) {
    nodes.push("\u00a0");
  }

  return nodes;
}

/** VS Code–style HTML syntax highlighting for the admin content editor overlay. */
export function highlightHtml(value: string): ReactNode[] {
  const lines = value.split("\n");

  return lines.map((line, index) =>
    createElement(
      "span",
      { key: `line-${index}`, className: "admin-post-content-highlight-line" },
      ...highlightLine(line, index),
      index < lines.length - 1 ? "\n" : null,
    ),
  );
}
