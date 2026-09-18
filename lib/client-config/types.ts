/**
 * Reusable Client Configuration Architecture
 *
 * Distinguishes:
 * 1. Platform capabilities supported by the Yorkstead Rework Flow engine
 * 2. Capabilities actually verified for an individual client
 * 3. Capabilities that remain unverified or unsupported
 * 4. Provenance tracking for verified facts
 */

/**
 * Verification and Provenance Tracking
 */
export type VerificationSourceType =
  | "client"
  | "client-website"
  | "google-business-profile"
  | "repository"
  | "manual-verification";

export interface VerificationSource {
  readonly source: VerificationSourceType;
  readonly reference?: string;
  readonly verifiedAt?: string; // ISO 8601 date, e.g. "2026-09-08"
  readonly notes?: string;
}

export interface ClientProvenance {
  readonly identity?: VerificationSource;
  readonly address?: VerificationSource;
  readonly website?: VerificationSource;
  readonly phone?: VerificationSource;
  readonly facility?: VerificationSource;
  readonly operations?: VerificationSource;
}

/**
 * Reusable Operational Service Taxonomy (Yorkstead Platform)
 *
 * Represents core operational capabilities without combining multiple distinct
 * services, customer problems, urgencies, or marketing modifiers into one ID.
 */
export type StandardServiceId =
  | "freight-rework"
  | "cross-docking"
  | "transloading"
  | "pallet-restacking"
  | "repalletizing"
  | "load-stabilization"
  | "rejected-load-recovery"
  | "shifted-load-recovery"
  | "shrink-wrapping"
  | "freight-weighing"
  | "short-term-staging"
  | "trailer-transfer"
  | "pallet-transfer";

// Backward-compatible alias
export type ServiceTaxonomyId = StandardServiceId;

export type ServiceCategory =
  | "handling"
  | "transfer"
  | "recovery"
  | "storage"
  | "compliance";

export type ServiceUrgency =
  | "standard"
  | "scheduled"
  | "expedited"
  | "emergency";

export interface StandardServiceDefinition {
  readonly id: StandardServiceId;
  readonly slug: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly longDescription: string;
  readonly category: ServiceCategory;
  readonly supportedUrgencies: readonly ServiceUrgency[];
  readonly associatedProblems: readonly string[];
  readonly facilityRequirements?: readonly string[];
  readonly keywords: readonly string[];
  readonly structuredDataInfo?: {
    readonly serviceType: string;
    readonly category: string;
  };
}

// Backward-compatible alias for existing consumers
export type ServiceConfig = StandardServiceDefinition;

/**
 * Client Capability Declaration
 *
 * Declares an individual client's relationship to a platform standard service.
 * A service marked 'unverified' or 'unsupported' must have public: false.
 */
export type CapabilityStatus =
  | "verified"
  | "unverified"
  | "unsupported";

export interface ClientServiceCapability {
  readonly serviceId: StandardServiceId;
  readonly status: CapabilityStatus;
  readonly public: boolean;
  readonly notes?: string;
  readonly verification?: VerificationSource;
  readonly urgenciesSupported?: readonly ServiceUrgency[];
  readonly customDescription?: string;
}

/**
 * Facility & Address Information
 */

/**
 * Geographic and Highway Corridor Context
 */
export interface LocationCorridorContext {
  readonly marketArea: string;
  readonly primaryCorridors: readonly string[];
  readonly junctionDescription: string;
  readonly nearbyLandmarks?: readonly string[];
  readonly receiverCategories?: readonly string[];
}

export interface Address {
  readonly street: string;
  readonly suite?: string;
  readonly city: string;
  readonly state: string;
  readonly zip: string;
  readonly country?: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

/**
 * Branding Configuration
 */
export interface BrandingConfig {
  readonly logoUrl?: string;
  readonly primaryColor?: string;
  readonly accentColor?: string;
  readonly tagline?: string;
  readonly heroHeadline?: string;
  readonly heroSubheadline?: string;
}

/**
 * SEO & Search Configuration
 */
export interface SEOConfig {
  readonly defaultTitle?: string;
  readonly defaultDescription?: string;
  readonly canonicalDomain?: string;
  readonly noIndex?: boolean;
}

/**
 * Conversion & CTA Configuration
 */
export interface ConversionConfig {
  readonly primaryPhone?: string;
  readonly emergencyPhone?: string;
  readonly reserveRoute?: string;
  readonly intakeRoute?: string;
  readonly contactEmail?: string;
}

/**
 * Google Business Profile Integration
 */
export interface GoogleBusinessProfileConfig {
  readonly placeId?: string;
  readonly cid?: string;
  readonly claimed?: boolean;
  readonly rating?: number;
  readonly reviewCount?: number;
  readonly mapsUrl?: string;
}

/**
 * Operating Hours & Availability Policies
 */
export type AfterHoursPolicy =
  | "none"
  | "by-appointment"
  | "on-call-emergency"
  | "twenty-four-seven";

export type WeekendPolicy =
  | "closed"
  | "by-appointment"
  | "regular-hours";

/**
 * Operational Specifications & Capacities
 */
export interface OperationsConfig {
  readonly standardHours?: string;
  readonly operatingHours?: string; // Generic display alias
  readonly regularCutoffTime?: string; // e.g. "15:30"
  readonly cutoffDescription?: string;
  readonly afterHoursPolicy?: AfterHoursPolicy;
  readonly afterHoursDescription?: string;
  readonly weekendPolicy?: WeekendPolicy;
  readonly isTwentyFourSeven?: boolean;
  readonly facilitySizeSqFt?: number;
  readonly facilityType?: string; // e.g. "climate-controlled (no cold storage)"
  readonly storageHeightFt?: number;
  readonly bayCount?: number;
  readonly bayIdentifiers?: readonly string[];
  readonly slaTurnaround?: string;
  readonly serviceLimits?: string;
  readonly verifiedRates?: {
    readonly palletBaseRate?: number;
    readonly hourlyLaborRate?: number;
    readonly shrinkWrapRoll?: number;
    readonly cornerBoardUnit?: number;
    readonly scaleReWeigh?: number;
    readonly debrisDisposal?: number;
  };
}

/**
 * Client Feature Gates
 */
export interface ClientFeatureFlags {
  readonly enablePublicSeoPrototypes?: boolean;
  readonly enableFreightRescue?: boolean;
  readonly enableGoogleReviews?: boolean;
  readonly enablePitchMode?: boolean;
  readonly enableCaseStudies?: boolean;
  readonly enableAnalytics?: boolean;
  readonly enablePhotoIntake?: boolean;
  readonly enablePublicPricing?: boolean;
  readonly enableCustomerPortal?: boolean;
}

/**
 * Root Client Configuration Contract
 */
export interface ReworkClientConfig {
  readonly id: string;
  readonly businessName: string;
  readonly legalName?: string;
  readonly website?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: Address;
  readonly serviceArea?: readonly string[];
  readonly branding?: BrandingConfig;
  readonly capabilities: readonly ClientServiceCapability[];
  readonly locationContext?: LocationCorridorContext;
  readonly provenance?: ClientProvenance;
  readonly seo?: SEOConfig;
  readonly conversion?: ConversionConfig;
  readonly googleBusinessProfile?: GoogleBusinessProfileConfig;
  readonly operations?: OperationsConfig;
  readonly featureFlags: ClientFeatureFlags;
}
