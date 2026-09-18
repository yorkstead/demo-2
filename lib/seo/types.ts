import { StandardServiceId, ReworkClientConfig } from "../client-config";

/**
 * Breadcrumb Navigation Item
 */
export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}

/**
 * Internal Link Reference with Context
 */
export interface InternalLinkMetadata {
  readonly title: string;
  readonly href: string;
  readonly anchorText: string;
  readonly description?: string;
  readonly serviceId?: StandardServiceId;
  readonly category?: string;
  readonly priority?: number;
}

/**
 * Geographic and Corridor Search Context
 */
export interface LocationCorridorContext {
  readonly marketArea: string;
  readonly primaryCorridors: readonly string[];
  readonly junctionDescription: string;
  readonly nearbyLandmarks: readonly string[];
  readonly receiverCategories: readonly string[];
}

/**
 * Page-Level SEO Input
 */
export interface PageSeoInput {
  readonly title: string;
  readonly description: string;
  readonly path: string; // e.g. "/denver-express/freight-rework"
  readonly serviceId?: StandardServiceId;
  readonly keywords?: readonly string[];
  readonly breadcrumbs?: readonly BreadcrumbItem[];
  readonly ogType?: "website" | "article";
  readonly ogImage?: string;
  readonly publishedTime?: string;
  readonly modifiedTime?: string;
  readonly noIndex?: boolean; // Override client default
}

/**
 * Guardrail Diagnostic Codes & Severities
 */
export type SeoGuardrailCode =
  | "DUPLICATE_TITLE"
  | "DUPLICATE_DESCRIPTION"
  | "DUPLICATE_CANONICAL"
  | "INVALID_CANONICAL_URL"
  | "DATA_LEAK_TENANT_MISMATCH"
  | "UNVERIFIED_SERVICE_EXPOSURE"
  | "PLACEHOLDER_DETECTED"
  | "MISSING_REQUIRED_FIELD"
  | "TITLE_TOO_LONG"
  | "DESCRIPTION_TOO_LONG";

export interface SeoGuardrailIssue {
  readonly code: SeoGuardrailCode;
  readonly message: string;
  readonly field: string;
  readonly severity: "error" | "warning";
}

export interface SeoGuardrailCheckResult {
  readonly valid: boolean;
  readonly issues: readonly SeoGuardrailIssue[];
}

/**
 * Schema.org Types (Subset for Logistics & Local Business)
 */
export interface SchemaPostalAddress {
  readonly "@type": "PostalAddress";
  readonly streetAddress: string;
  readonly addressLocality: string;
  readonly addressRegion: string;
  readonly postalCode: string;
  readonly addressCountry: string;
}

export interface SchemaGeoCoordinates {
  readonly "@type": "GeoCoordinates";
  readonly latitude: number;
  readonly longitude: number;
}

export interface SchemaOpeningHoursSpecification {
  readonly "@type": "OpeningHoursSpecification";
  readonly dayOfWeek: readonly string[];
  readonly opens: string;
  readonly closes: string;
}

export interface SchemaOrganization {
  readonly "@context": "https://schema.org";
  readonly "@type": "Organization";
  readonly name: string;
  readonly legalName?: string;
  readonly url: string;
  readonly telephone?: string;
  readonly email?: string;
  readonly logo?: string;
  readonly address?: SchemaPostalAddress;
}

export interface SchemaLocalBusiness {
  readonly "@context": "https://schema.org";
  readonly "@type": readonly string[] | string;
  readonly "@id"?: string;
  readonly name: string;
  readonly legalName?: string;
  readonly url: string;
  readonly telephone?: string;
  readonly email?: string;
  readonly address?: SchemaPostalAddress;
  readonly geo?: SchemaGeoCoordinates;
  readonly hasMap?: string;
  readonly areaServed?: readonly string[];
  readonly openingHoursSpecification?: readonly SchemaOpeningHoursSpecification[];
  readonly image?: string;
}

export interface SchemaService {
  readonly "@context": "https://schema.org";
  readonly "@type": string;
  readonly serviceType: string;
  readonly name: string;
  readonly description: string;
  readonly provider: {
    readonly "@type": string;
    readonly name: string;
    readonly url?: string;
    readonly telephone?: string;
  };
  readonly areaServed?: readonly string[];
  readonly url?: string;
}

export interface SchemaBreadcrumbListItem {
  readonly "@type": "ListItem";
  readonly position: number;
  readonly name: string;
  readonly item: string;
}

export interface SchemaBreadcrumbList {
  readonly "@context": "https://schema.org";
  readonly "@type": "BreadcrumbList";
  readonly itemListElement: readonly SchemaBreadcrumbListItem[];
}

export interface SchemaWebPage {
  readonly "@context": "https://schema.org";
  readonly "@type": "WebPage";
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly breadcrumb?: SchemaBreadcrumbList;
  readonly isPartOf?: {
    readonly "@type": "WebSite";
    readonly name: string;
    readonly url: string;
  };
}

export interface SchemaQuestion {
  readonly "@type": "Question";
  readonly name: string;
  readonly acceptedAnswer: {
    readonly "@type": "Answer";
    readonly text: string;
  };
}

export interface SchemaFAQPage {
  readonly "@context": "https://schema.org";
  readonly "@type": "FAQPage";
  readonly mainEntity: readonly SchemaQuestion[];
}

export interface SchemaArticle {
  readonly "@context": "https://schema.org";
  readonly "@type": "Article";
  readonly headline: string;
  readonly description: string;
  readonly datePublished: string;
  readonly dateModified?: string;
  readonly author?: {
    readonly "@type": "Person" | "Organization";
    readonly name: string;
  };
  readonly publisher?: {
    readonly "@type": "Organization";
    readonly name: string;
    readonly logo?: {
      readonly "@type": "ImageObject";
      readonly url: string;
    };
  };
  readonly mainEntityOfPage: string;
  readonly image?: string;
}
