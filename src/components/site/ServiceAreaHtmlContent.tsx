type ServiceAreaHtmlContentProps = {
  html: string;
};

export function ServiceAreaHtmlContent({ html }: ServiceAreaHtmlContentProps) {
  if (!html.trim()) {
    return null;
  }

  return (
    <div
      className="service-area-html-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
