import {
  ReworkClientConfig,
  StandardServiceId,
  getServiceById,
  isServicePublic,
} from "../client-config";
import {
  BreadcrumbItem,
  SchemaArticle,
  SchemaBreadcrumbList,
  SchemaFAQPage,
  SchemaLocalBusiness,
  SchemaOrganization,
  SchemaService,
  SchemaWebPage,
} from "./types";

/**
 * Sanitizes structured data objects according to Next.js recommendations.
 * Replaces '<' and '>' characters with unicode escape sequences to prevent XSS.
 */
export function sanitizeJsonLd(data: unknown): string {
  const json = JSON.stringify(data);
  return json.replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

/**
 * Construct canonical absolute URL for structured data entities.
 */
export function getCanonicalUrl(client: ReworkClientConfig, relativePath: string): string {
  const base = client.seo?.canonicalDomain || client.website || "https://rework-flow.yorkstead.com";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Generate Schema.org Organization for a client.
 */
export function buildOrganizationSchema(client: ReworkClientConfig): SchemaOrganization {
  const canonicalBase = client.seo?.canonicalDomain || client.website || "https://rework-flow.yorkstead.com";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: client.businessName,
    legalName: client.legalName,
    url: canonicalBase,
    telephone: client.phone,
    email: client.email,
    logo: client.branding?.logoUrl,
    address: client.address
      ? {
          "@type": "PostalAddress",
          streetAddress: client.address.suite
            ? `${client.address.street}, ${client.address.suite}`
            : client.address.street,
          addressLocality: client.address.city,
          addressRegion: client.address.state,
          postalCode: client.address.zip,
          addressCountry: client.address.country || "US",
        }
      : undefined,
  };
}

/**
 * Generate Schema.org LocalBusiness with verified logistics metadata.
 * Only includes hours and coordinates when factually supported.
 */
export function buildLocalBusinessSchema(client: ReworkClientConfig): SchemaLocalBusiness {
  const canonicalBase = client.seo?.canonicalDomain || client.website || "https://rework-flow.yorkstead.com";

  const openingHours = client.operations?.standardHours
    ? [
        {
          "@type": "OpeningHoursSpecification" as const,
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: client.operations.regularCutoffTime || "16:00",
        },
      ]
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${canonicalBase}/#localbusiness`,
    name: client.businessName,
    legalName: client.legalName,
    url: canonicalBase,
    telephone: client.phone,
    email: client.email,
    address: client.address
      ? {
          "@type": "PostalAddress",
          streetAddress: client.address.suite
            ? `${client.address.street}, ${client.address.suite}`
            : client.address.street,
          addressLocality: client.address.city,
          addressRegion: client.address.state,
          postalCode: client.address.zip,
          addressCountry: client.address.country || "US",
        }
      : undefined,
    geo:
      client.address?.latitude && client.address?.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: client.address.latitude,
            longitude: client.address.longitude,
          }
        : undefined,
    hasMap: client.googleBusinessProfile?.mapsUrl,
    areaServed: client.serviceArea,
    openingHoursSpecification: openingHours,
    image: client.branding?.logoUrl,
  };
}

/**
 * Generate Schema.org Service for a verified client capability.
 * Guardrail: Returns undefined if the service is not verified & public for this client.
 */
export function buildServiceSchema(
  client: ReworkClientConfig,
  serviceId: StandardServiceId,
  pagePath?: string
): SchemaService | undefined {
  if (!isServicePublic(client, serviceId)) {
    return undefined; // Guardrail: Do not generate structured data for unverified capabilities
  }

  const def = getServiceById(serviceId);
  if (!def) return undefined;

  const url = pagePath ? getCanonicalUrl(client, pagePath) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": def.structuredDataInfo?.category || "Service",
    serviceType: def.name,
    name: `${def.name} • ${client.businessName}`,
    description: def.shortDescription,
    provider: {
      "@type": "LocalBusiness",
      name: client.businessName,
      url: client.website,
      telephone: client.phone,
    },
    areaServed: client.serviceArea,
    url,
  };
}

/**
 * Generate Schema.org BreadcrumbList.
 */
export function buildBreadcrumbSchema(
  client: ReworkClientConfig,
  items: readonly BreadcrumbItem[]
): SchemaBreadcrumbList {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(client, item.path),
    })),
  };
}

/**
 * Generate Schema.org WebPage with parent website and breadcrumb references.
 */
export function buildWebPageSchema(
  client: ReworkClientConfig,
  page: {
    title: string;
    description: string;
    path: string;
    breadcrumbs?: readonly BreadcrumbItem[];
  }
): SchemaWebPage {
  const url = getCanonicalUrl(client, page.path);
  const canonicalBase = client.seo?.canonicalDomain || client.website || "https://rework-flow.yorkstead.com";

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url,
    breadcrumb: page.breadcrumbs
      ? buildBreadcrumbSchema(client, page.breadcrumbs)
      : undefined,
    isPartOf: {
      "@type": "WebSite",
      name: client.businessName,
      url: canonicalBase,
    },
  };
}

/**
 * Generate Schema.org FAQPage for genuinely published customer FAQs.
 *
 * CRITICAL ARCHITECTURAL GUARDRAILS & STANDARDS:
 * 1. VISIBLE CONTENT ONLY: FAQ schema MUST solely represent questions and answers
 *    that are visibly rendered on the page in HTML. Never emit FAQ schema for hidden content.
 * 2. OPTIONAL BY DESIGN: FAQ schema is optional. Pages must never add FAQ schema solely
 *    to attempt search appearance manipulation.
 * 3. NO RICH RESULT ASSUMPTIONS: Google restricted FAQ rich results in August 2023 to
 *    authoritative government and health organizations. General commercial sites rarely
 *    receive accordion rich snippets; structured data is for semantic comprehension only.
 * 4. EMPTY SAFETY: Returns undefined if faqs is empty, null, or has no non-empty items.
 *    No schema is emitted when the page does not contain visible FAQ content.
 */
export function buildFAQSchema(
  faqs?: readonly { question: string; answer: string }[]
): SchemaFAQPage | undefined {
  if (!faqs || faqs.length === 0) {
    return undefined; // Guardrail: never emit FAQPage when no visible FAQ items exist
  }

  const validFaqs = faqs.filter(
    (f) => f && typeof f.question === "string" && f.question.trim() !== "" &&
                typeof f.answer === "string" && f.answer.trim() !== ""
  );

  if (validFaqs.length === 0) {
    return undefined;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validFaqs.map((f) => ({
      "@type": "Question",
      name: f.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer.trim(),
      },
    })),
  };
}

/**
 * Generate Schema.org Article for factual editorial guides or operational procedures.
 */
export function buildArticleSchema(
  client: ReworkClientConfig,
  article: {
    headline: string;
    description: string;
    publishedAt: string;
    modifiedAt?: string;
    authorName?: string;
    path: string;
    imageUrl?: string;
  }
): SchemaArticle {
  const url = getCanonicalUrl(client, article.path);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: article.authorName || client.businessName,
    },
    publisher: {
      "@type": "Organization",
      name: client.businessName,
      logo: client.branding?.logoUrl
        ? {
            "@type": "ImageObject",
            url: client.branding.logoUrl,
          }
        : undefined,
    },
    mainEntityOfPage: url,
    image: article.imageUrl,
  };
}
