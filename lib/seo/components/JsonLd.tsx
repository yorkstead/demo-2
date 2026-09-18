import React from "react";
import { sanitizeJsonLd } from "../structured-data";

export interface JsonLdProps {
  /**
   * One or more Schema.org objects.
   * If an array is provided, it is combined using Schema.org '@graph'.
   */
  readonly data: Record<string, unknown> | readonly Record<string, unknown>[];
}

/**
 * Reusable Next.js Server Component to render validated, XSS-sanitized JSON-LD.
 */
export function JsonLd({ data }: JsonLdProps): React.JSX.Element {
  const payload = Array.isArray(data)
    ? {
        "@context": "https://schema.org",
        "@graph": data.filter(Boolean),
      }
    : data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: sanitizeJsonLd(payload),
      }}
    />
  );
}
