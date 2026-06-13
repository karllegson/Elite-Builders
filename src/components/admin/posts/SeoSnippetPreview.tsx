"use client";

type SeoSnippetPreviewProps = {
  permalinkUrl: string;
  title: string;
  description: string;
};

export function SeoSnippetPreview({
  permalinkUrl,
  title,
  description,
}: SeoSnippetPreviewProps) {
  return (
    <div className="admin-seo-preview">
      <div className="admin-seo-preview-label">Preview</div>
      <div className="admin-seo-snippet">
        <div className="admin-seo-snippet-url-row">
          <span className="admin-seo-snippet-url">{permalinkUrl}</span>
          <span className="admin-seo-snippet-menu" aria-hidden>
            ⋮
          </span>
        </div>
        <div className="admin-seo-snippet-title">{title}</div>
        <div className="admin-seo-snippet-description">{description}</div>
      </div>
    </div>
  );
}
