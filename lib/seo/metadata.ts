import type { Metadata } from "next";
import { ReworkClientConfig } from "../client-config";
import { PageSeoInput } from "./types";
import { getCanonicalUrl } from "./structured-data";
import { validateSeoInput } from "./guardrails";

/**
 * Truncate description at word boundary to avoid awkward mid-word cutoffs.
 */
function cleanDescription(desc: string, maxLen = 160): string {
  if (desc.length <= maxLen) return desc;
  const sub = desc.substring(0, maxLen);
  const lastSpace = sub.lastIndexOf(" ");
  return lastSpace > 0 ? `${sub.substring(0, lastSpace)}...` : `${sub}...`;
}

/**
 * Generate fully configured, guardrail-validated Next.js Metadata object.
 *
 * Guarantees:
 * - Proper canonical URLs
 * - Clean titles without duplicate brand suffixes
 * - Enforces noIndex when configured (default for Denver Express prototypes on Yorkstead)
 * - Complete OpenGraph & Twitter Card definitions
 * - Prevents tenant data leakage
 */
export function buildPageMetadata(
  client: ReworkClientConfig,
  input: PageSeoInput
): Metadata {
  // Validate input against SEO guardrails
  const validation = validateSeoInput(client, input);
  if (!validation.valid && process.env.NODE_ENV === "development") {
    console.warn(
      `[SEO Guardrail Warning] Issues detected in route '${input.path}' for client '${client.id}':`,
      validation.issues
    );
  }

  const canonicalUrl = getCanonicalUrl(client, input.path);
  const description = cleanDescription(input.description || client.seo?.defaultDescription || "");

  // Compose title: avoid appending brand if title already contains business name
  const hasBrand = input.title.toLowerCase().includes(client.businessName.toLowerCase());
  const finalTitle = hasBrand
    ? input.title
    : `${input.title} • ${client.businessName}`;

  // Respect noIndex rules:
  // 1. Explicit input.noIndex override
  // 2. Client global seo.noIndex (e.g. Denver Express prototypes on Yorkstead default to true)
  const isNoIndex = input.noIndex !== undefined
    ? input.noIndex
    : client.seo?.noIndex ?? false;

  // Selected image
  const ogImageUrl = input.ogImage || client.branding?.logoUrl;

  const metadata: Metadata = {
    title: finalTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !isNoIndex,
      follow: !isNoIndex,
      nocache: isNoIndex,
      googleBot: {
        index: !isNoIndex,
        follow: !isNoIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: finalTitle,
      description,
      url: canonicalUrl,
      siteName: client.businessName,
      locale: "en_US",
      type: input.ogType || "website",
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };

  return metadata;
}
