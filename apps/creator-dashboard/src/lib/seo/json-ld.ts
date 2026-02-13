/**
 * JSON-LD structured data generators for SEO.
 * Use these to generate schema.org structured data for courses and landing pages.
 */

type CourseJsonLdInput = {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly creatorName: string;
  readonly priceCents?: number;
  readonly currency?: string;
  readonly priceType: "free" | "paid" | "subscription_only";
};

type WebPageJsonLdInput = {
  readonly name: string;
  readonly description?: string;
  readonly url: string;
  readonly imageUrl?: string;
};

export function generateCourseJsonLd(input: CourseJsonLdInput): Record<string, unknown> {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: input.url,
    provider: {
      "@type": "Organization",
      name: input.creatorName,
    },
  };

  if (input.thumbnailUrl) {
    base.image = input.thumbnailUrl;
  }

  if (input.priceType === "free") {
    base.offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: input.currency?.toUpperCase() ?? "USD",
      availability: "https://schema.org/InStock",
    };
  } else if (input.priceType === "paid" && input.priceCents) {
    base.offers = {
      "@type": "Offer",
      price: (input.priceCents / 100).toFixed(2),
      priceCurrency: input.currency?.toUpperCase() ?? "USD",
      availability: "https://schema.org/InStock",
    };
  }

  return base;
}

export function generateWebPageJsonLd(input: WebPageJsonLdInput): Record<string, unknown> {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    url: input.url,
  };

  if (input.description) {
    base.description = input.description;
  }

  if (input.imageUrl) {
    base.image = input.imageUrl;
  }

  return base;
}

/**
 * Renders a JSON-LD script tag string for embedding in the head.
 * Safe to use in SSR -- sanitizes script boundaries and HTML comment openers
 * to prevent injection even if user-supplied data contains HTML.
 */
export function jsonLdScriptTag(data: Record<string, unknown>): string {
  const json = JSON.stringify(data)
    .replaceAll("</script", "<\\/script")
    .replaceAll("<script", "<\\/script")
    .replaceAll("<!--", "\\u003C!--");
  return `<script type="application/ld+json">${json}</script>`;
}
