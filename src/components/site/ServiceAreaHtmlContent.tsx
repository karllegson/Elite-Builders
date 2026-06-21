import { transformQuickSummaryBlocks } from "@/lib/site/postContent";

type ServiceAreaHtmlContentProps = {
  html: string;
};

export function ServiceAreaHtmlContent({ html }: ServiceAreaHtmlContentProps) {
  const normalizedHtml = transformQuickSummaryBlocks(html);

  if (!normalizedHtml.trim()) {
    return null;
  }

  return (
    <div
      className="service-area-html-content"
      dangerouslySetInnerHTML={{ __html: normalizedHtml }}
    />
  );
}
