const QUICK_SUMMARY_SHORTCODE_PATTERN = /\[quick_summary\]/i;

const QUICK_SUMMARY_CLASS_PATTERN = /class=["'][^"']*\bquick-summary\b[^"']*["']/i;

const QUICK_SUMMARY_BLOCK_PATTERN =

  /<div[^>]*class=["'][^"']*\bquick-summary\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi;

const QUICK_SUMMARY_SHORTCODE_BLOCK_PATTERN =

  /\[quick_summary\][\s\S]*?\[\/quick_summary\]/gi;

const HIGHLIGHT_BOX_SHORTCODE_BLOCK_PATTERN =

  /\[highlight_box\][\s\S]*?\[\/highlight_box\]/gi;

const HEADING_TAG_PATTERN = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;

const QUICK_SUMMARY_LABEL_PARAGRAPH_PATTERN =

  /<p[^>]*>\s*(?:<(?:strong|em|b|i)[^>]*>\s*)*Quick\s+Summary(?:\s*<\/(?:strong|em|b|i)\s*>\s*)*(?:<\/(?:strong|em|b|i)\s*>\s*)*\s*<\/p>/i;

const LEADING_QUICK_SUMMARY_PREVIEW_PATTERN =

  /^<p[^>]*>\s*(?:<(?:strong|em|b|i)[^>]*>\s*)*Quick\s+Summary\b[\s\S]*?<\/p>\s*/i;



function stripInlineHtml(html: string): string {

  return html

    .replace(/<[^>]+>/g, " ")

    .replace(/&nbsp;/gi, " ")

    .replace(/\s+/g, " ")

    .trim();

}



export function isQuickSummaryHeadingMarkup(headingHtml: string): boolean {

  return /^Quick\s+Summary$/i.test(stripInlineHtml(headingHtml));

}



function isInsideQuickSummaryDiv(html: string, index: number): boolean {

  const before = html.slice(0, index);

  const opens = [

    ...before.matchAll(/<div[^>]*class=["'][^"']*\bquick-summary\b[^"']*["'][^>]*>/gi),

  ];



  if (opens.length === 0) {

    return false;

  }



  const lastOpen = opens[opens.length - 1];

  const openEnd = lastOpen.index! + lastOpen[0].length;

  const segment = html.slice(openEnd, index);

  let depth = 1;



  for (const tag of segment.match(/<\/?div\b[^>]*>/gi) ?? []) {

    if (tag.startsWith("</")) {

      depth -= 1;

    } else if (!/\/>\s*$/.test(tag)) {

      depth += 1;

    }

  }



  return depth > 0;

}



function formatQuickSummaryHtml(_heading: string, body: string): string {
  const styledHeading = buildQuickSummaryHeading();
  const bodyHtml = normalizeQuickSummaryBody(body);

  return `<div class="quick-summary" style="${QUICK_SUMMARY_BOX_STYLE}">${styledHeading}${bodyHtml}</div>`;
}

const QUICK_SUMMARY_BOX_STYLE =
  "margin:0 0 1.5rem;padding:1.25rem 1.5rem;background:#f7f8f9;border:1px solid #e2e5e9;border-radius:0.375rem";
const QUICK_SUMMARY_HEADING_STYLE =
  "margin:0 0 0.75rem;font-size:clamp(1.35rem,2.2vw,1.75rem);font-weight:700;color:#00205b";
const QUICK_SUMMARY_BODY_STYLE =
  "margin:0;color:#353638;font-style:normal;line-height:1.75";

const HIGHLIGHT_BOX_STYLE = QUICK_SUMMARY_BOX_STYLE;

function buildQuickSummaryHeading(): string {
  return `<h2 style="${QUICK_SUMMARY_HEADING_STYLE}">Quick Summary</h2>`;
}

function normalizeQuickSummaryBody(body: string): string {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return `<p style="${QUICK_SUMMARY_BODY_STYLE}"></p>`;
  }

  if (!trimmedBody.startsWith("<")) {
    return `<p style="${QUICK_SUMMARY_BODY_STYLE}">${trimmedBody}</p>`;
  }

  if (!/<p\b/i.test(trimmedBody)) {
    return applyQuickSummaryBodyStyles(`<p>${trimmedBody}</p>`);
  }

  return applyQuickSummaryBodyStyles(trimmedBody);
}

function applyQuickSummaryBodyStyles(body: string): string {
  return body
    .replace(/<p(\s[^>]*)?>/gi, (match, attrs = "") => {
      if (/style=/i.test(attrs)) {
        return match;
      }

      return `<p${attrs} style="${QUICK_SUMMARY_BODY_STYLE}">`;
    })
    .replace(/<(em|i)(\s[^>]*)?>/gi, (match, tag, attrs = "") => {
      if (/style=/i.test(attrs)) {
        return match;
      }

      return `<${tag}${attrs} style="font-style:normal">`;
    });
}

function normalizeExistingQuickSummaryBlocks(html: string): string {
  return html.replace(
    /<div([^>]*class=["'][^"']*\bquick-summary\b[^"']*["'][^>]*)>([\s\S]*?)<\/div>/gi,
    (fullMatch, attrs, inner) => {
      const headingMatch = [...inner.matchAll(new RegExp(HEADING_TAG_PATTERN.source, "gi"))].find(
        (match) => isQuickSummaryHeadingMarkup(match[2]),
      );
      const labelMatch = inner.match(QUICK_SUMMARY_LABEL_PARAGRAPH_PATTERN);
      let body = inner.trim();

      if (headingMatch?.index !== undefined) {
        body = inner.slice(headingMatch.index + headingMatch[0].length).trim();
      } else if (labelMatch?.index !== undefined) {
        body = inner.slice(labelMatch.index + labelMatch[0].length).trim();
      }

      const normalized = formatQuickSummaryHtml("", body);
      const normalizedAttrs = attrs.replace(
        /style=["'][^"']*["']/i,
        `style="${QUICK_SUMMARY_BOX_STYLE}"`,
      );

      if (/style=/i.test(normalizedAttrs)) {
        return normalized.replace(/<div[^>]*>/, `<div${normalizedAttrs}>`);
      }

      return normalized;
    },
  );
}

function ensureHighlightBoxStyles(html: string): string {
  return html.replace(
    /<div([^>]*class=["'][^"']*\bhighlight-box\b[^"']*["'][^>]*)>/gi,
    (match, attrs) => {
      if (/style=/i.test(attrs)) {
        return match;
      }

      return `<div${attrs} style="${HIGHLIGHT_BOX_STYLE}">`;
    },
  );
}



function transformHighlightBoxShortcodes(html: string): string {

  return html.replace(HIGHLIGHT_BOX_SHORTCODE_BLOCK_PATTERN, (shortcodeBlock) => {

    const body = shortcodeBlock

      .replace(/^\[highlight_box\]/i, "")

      .replace(/\[\/highlight_box\]$/i, "")

      .trim();



    return `<div class="highlight-box" style="${HIGHLIGHT_BOX_STYLE}">${body}</div>`;

  });

}



function addQuickSummaryClassToHighlightBox(html: string): string {

  const openTagPattern =

    /<div([^>]*class=["']([^"']*\bhighlight-box\b[^"']*)["'][^>]*)>/gi;

  const replacements: Array<{ start: number; end: number; text: string }> = [];

  let match: RegExpExecArray | null;



  while ((match = openTagPattern.exec(html)) !== null) {

    const classes = match[2];



    if (/\bquick-summary\b/.test(classes)) {

      continue;

    }



    const openEnd = match.index + match[0].length;

    const afterOpen = html.slice(openEnd);

    const closeIndex = afterOpen.indexOf("</div>");



    if (closeIndex === -1) {

      continue;

    }



    const inner = afterOpen.slice(0, closeIndex);

    const hasQuickSummaryHeading = [...inner.matchAll(HEADING_TAG_PATTERN)].some((headingMatch) =>

      isQuickSummaryHeadingMarkup(headingMatch[2]),

    );



    if (!hasQuickSummaryHeading) {

      continue;

    }



    const nextClasses = `${classes} quick-summary`;

    replacements.push({

      start: match.index,

      end: openEnd,

      text: `<div${match[1].replace(classes, nextClasses)}>`,

    });

  }



  let result = html;



  for (let index = replacements.length - 1; index >= 0; index -= 1) {

    const { start, end, text } = replacements[index];

    result = result.slice(0, start) + text + result.slice(end);

  }



  return result;

}



function wrapBareQuickSummaryBlocks(html: string): string {

  const headingRegex = new RegExp(HEADING_TAG_PATTERN.source, "gi");

  const replacements: Array<{ start: number; end: number; text: string }> = [];

  let match: RegExpExecArray | null;



  while ((match = headingRegex.exec(html)) !== null) {

    if (!isQuickSummaryHeadingMarkup(match[2])) {

      continue;

    }



    const start = match.index;



    if (isInsideQuickSummaryDiv(html, start)) {

      continue;

    }



    const headingEnd = start + match[0].length;

    const rest = html.slice(headingEnd);

    const nextHeadingMatch = rest.match(/<h[1-6]\b/i);

    const bodyEnd = nextHeadingMatch?.index ?? rest.length;

    const body = rest.slice(0, bodyEnd).trim();

    const end = headingEnd + bodyEnd;



    replacements.push({

      start,

      end,

      text: formatQuickSummaryHtml(match[0], body),

    });

  }



  let result = html;



  for (let index = replacements.length - 1; index >= 0; index -= 1) {

    const { start, end, text } = replacements[index];

    result = result.slice(0, start) + text + result.slice(end);

  }



  return result;

}



function wrapQuickSummaryLabelParagraphs(html: string): string {

  const labelRegex = new RegExp(QUICK_SUMMARY_LABEL_PARAGRAPH_PATTERN.source, "gi");

  const replacements: Array<{ start: number; end: number; text: string }> = [];

  let match: RegExpExecArray | null;



  while ((match = labelRegex.exec(html)) !== null) {

    const start = match.index;



    if (isInsideQuickSummaryDiv(html, start)) {

      continue;

    }



    const labelEnd = start + match[0].length;

    const rest = html.slice(labelEnd);

    const nextHeadingMatch = rest.match(/<h[1-6]\b/i);

    const nextLabelMatch = rest.match(QUICK_SUMMARY_LABEL_PARAGRAPH_PATTERN);

    const nextBreakIndex = [nextHeadingMatch?.index, nextLabelMatch?.index]

      .filter((value): value is number => value !== undefined)

      .sort((left, right) => left - right)[0];

    const bodyEnd = nextBreakIndex ?? rest.length;

    const body = rest.slice(0, bodyEnd).trim();

    const end = labelEnd + bodyEnd;



    replacements.push({

      start,

      end,

      text: formatQuickSummaryHtml("<h2>Quick Summary</h2>", body),

    });

  }



  let result = html;



  for (let index = replacements.length - 1; index >= 0; index -= 1) {

    const { start, end, text } = replacements[index];

    result = result.slice(0, start) + text + result.slice(end);

  }



  return result;

}



function stripLeadingQuickSummaryPreviewParagraph(html: string): string {

  if (!contentHasQuickSummary(html)) {

    return html;

  }



  return html.replace(LEADING_QUICK_SUMMARY_PREVIEW_PATTERN, "");

}



export function transformQuickSummaryBlocks(html: string): string {

  if (!html.trim()) {

    return html;

  }



  let result = transformHighlightBoxShortcodes(html);



  result = result.replace(

    QUICK_SUMMARY_SHORTCODE_BLOCK_PATTERN,

    (shortcodeBlock) => {

      const body = shortcodeBlock

        .replace(/^\[quick_summary\]/i, "")

        .replace(/\[\/quick_summary\]$/i, "")

        .trim();



      return formatQuickSummaryHtml("<h2>Quick Summary</h2>", body);

    },

  );



  result = result.replace(QUICK_SUMMARY_SHORTCODE_PATTERN, " ");

  result = addQuickSummaryClassToHighlightBox(result);

  result = wrapBareQuickSummaryBlocks(result);

  result = wrapQuickSummaryLabelParagraphs(result);

  result = stripLeadingQuickSummaryPreviewParagraph(result);
  result = normalizeExistingQuickSummaryBlocks(result);
  result = ensureHighlightBoxStyles(result);

  return result;

}



export function contentHasQuickSummary(content: string): boolean {

  if (

    QUICK_SUMMARY_SHORTCODE_PATTERN.test(content) ||

    QUICK_SUMMARY_CLASS_PATTERN.test(content) ||

    QUICK_SUMMARY_LABEL_PARAGRAPH_PATTERN.test(content)

  ) {

    return true;

  }



  const headingRegex = new RegExp(HEADING_TAG_PATTERN.source, "gi");

  let match: RegExpExecArray | null;



  while ((match = headingRegex.exec(content)) !== null) {

    if (isQuickSummaryHeadingMarkup(match[2])) {

      return true;

    }

  }



  return false;

}



export function excerptLooksLikeQuickSummary(excerpt: string): boolean {

  return /^Quick\s+Summary\b/i.test(excerpt.trim());

}



export function stripQuickSummaryForExcerpt(content: string): string {

  const headingBlockPattern =

    /<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>[\s\S]*?(?=<h[1-6][^>]*>|$)/gi;



  let result = content

    .replace(QUICK_SUMMARY_BLOCK_PATTERN, " ")

    .replace(QUICK_SUMMARY_SHORTCODE_BLOCK_PATTERN, " ")

    .replace(HIGHLIGHT_BOX_SHORTCODE_BLOCK_PATTERN, " ")

    .replace(QUICK_SUMMARY_LABEL_PARAGRAPH_PATTERN, " ")

    .replace(QUICK_SUMMARY_SHORTCODE_PATTERN, " ")

    .replace(LEADING_QUICK_SUMMARY_PREVIEW_PATTERN, " ");



  result = result.replace(headingBlockPattern, (block) => {

    const headingMatch = block.match(/^<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i);

    if (headingMatch && isQuickSummaryHeadingMarkup(headingMatch[2])) {

      return " ";

    }

    return block;

  });



  return result;

}



export function shouldShowPostExcerpt(content: string, excerpt: string): boolean {

  const trimmedExcerpt = excerpt.trim();



  if (!trimmedExcerpt) {

    return false;

  }



  if (contentHasQuickSummary(content) || excerptLooksLikeQuickSummary(trimmedExcerpt)) {

    return false;

  }



  return true;

}


