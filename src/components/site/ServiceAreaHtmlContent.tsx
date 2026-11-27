import { lazyLoadContentImages } from "@/lib/site/contentImages";
import { prepareServiceAreaHtml } from "@/lib/site/serviceAreaContent";

type ServiceAreaHtmlContentProps = {
  html: string;
  linkSourceHtml?: string;
  skipPrepare?: boolean;
};

export function ServiceAreaHtmlContent({
  html,
  linkSourceHtml,
  skipPrepare = false,
}: ServiceAreaHtmlContentProps) {
  if (!html.trim()) {
    return null;
  }

  const prepared = lazyLoadContentImages(
    skipPrepare ? html : prepareServiceAreaHtml(html, linkSourceHtml ?? html),
  );

  return (
    <div
      className="service-area-html-content"
      dangerouslySetInnerHTML={{ __html: prepared }}
    />
  );
}
