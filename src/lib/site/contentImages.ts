const IMG_OPEN_TAG = /<img\b[^>]*>/gi;
const HAS_LOADING_ATTR = /\sloading\s*=/i;

/**
 * Adds loading="lazy" to images in CMS HTML so they don't compete with the hero image.
 * The CMS editor strips the attribute on save, so it has to be added at render time.
 */
export function lazyLoadContentImages(html: string): string {
  return html.replace(IMG_OPEN_TAG, (tag) =>
    HAS_LOADING_ATTR.test(tag) ? tag : tag.replace(/^<img\b/i, '<img loading="lazy"'),
  );
}
