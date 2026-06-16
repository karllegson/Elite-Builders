export type EmbedContentType = "page" | "post";

export function getFormShortcode(formId: number): string {
  return `[gravityform id="${formId}" title="false"]`;
}
