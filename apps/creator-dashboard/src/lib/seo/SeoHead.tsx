/**
 * SeoHead component for rendering SEO meta tags in the document head.
 * Works with TanStack Start's Meta API or can be used standalone.
 */

type SeoHeadProps = {
  readonly title?: string;
  readonly description?: string;
  readonly ogImageUrl?: string;
  readonly canonicalUrl?: string;
  readonly noindex?: boolean;
  readonly jsonLd?: Record<string, unknown>;
};

/**
 * Generates meta tag entries for use with TanStack Router's head/meta system.
 * Returns an array of objects suitable for use as route meta.
 */
export function getSeoMeta(props: SeoHeadProps): Array<Record<string, string>> {
  const tags: Array<Record<string, string>> = [];

  if (props.title) {
    tags.push({ title: props.title });
    tags.push({ property: "og:title", content: props.title });
  }

  if (props.description) {
    tags.push({ name: "description", content: props.description });
    tags.push({ property: "og:description", content: props.description });
  }

  if (props.ogImageUrl) {
    tags.push({ property: "og:image", content: props.ogImageUrl });
  }

  if (props.canonicalUrl) {
    tags.push({ rel: "canonical", href: props.canonicalUrl });
  }

  if (props.noindex) {
    tags.push({ name: "robots", content: "noindex, nofollow" });
  }

  return tags;
}

/**
 * Renders inline JSON-LD script. Use inside a <head> section or
 * dangerouslySetInnerHTML within a container.
 */
export function JsonLdScript({ data }: { readonly data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
