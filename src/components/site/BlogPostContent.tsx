type BlogPostContentProps = {
  html: string;
};

export function BlogPostContent({ html }: BlogPostContentProps) {
  return (
    <article
      className="blog-post-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
