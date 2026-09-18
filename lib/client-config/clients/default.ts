import { ReworkClientConfig } from "../types";
import { STANDARD_SERVICES } from "../services";

/**
 * Baseline Default Rework Flow Configuration
 *
 * Reflects the unbranded / standard Yorkstead product baseline.
 * Used when no client route or client hostname is active.
 *
 * For the Yorkstead platform baseline, all 13 standard operational capabilities
 * are supported by the software workflow engine (bay reservation, touch pad dock log,
 * photo verification, SHA-256 audit chaining, and accounting export).
 */
export const DEFAULT_CLIENT_CONFIG: ReworkClientConfig = {
  id: "default",
  businessName: "Rework Flow",
  legalName: "Yorkstead Systems LLC",
  website: "https://rework-flow.yorkstead.com",
  branding: {
    primaryColor: "#0b192c",
    accentColor: "#d4af37",
    tagline: "High-Velocity Cargo Rework & Cross-Dock Evidence Engine",
    heroHeadline: "High-Velocity Cargo Rework & Cross-Dock",
    heroSubheadline:
      "Real-time synchronization between highway trucker reservation, forklift dock touch pad, and office dispatch.",
  },
  provenance: {
    identity: {
      source: "repository",
      reference: "Yorkstead Systems core architecture",
      verifiedAt: "2026-09-08",
    },
  },
  capabilities: STANDARD_SERVICES.map((service) => ({
    serviceId: service.id,
    status: "verified" as const,
    public: true,
    verification: {
      source: "repository" as const,
      reference: "Yorkstead Rework Flow platform baseline engine",
      verifiedAt: "2026-09-08",
    },
  })),
  conversion: {
    reserveRoute: "/reserve",
  },
  seo: {
    defaultTitle: "ReworkFlow • Real-Time Cross-Dock & Rework Engine",
    defaultDescription: "High-Velocity Cargo Rework & Cross-Dock Evidence Engine by Yorkstead Systems.",
    noIndex: false,
  },
  operations: {
    standardHours: "Monday–Friday, 7:00am–5:00pm",
    operatingHours: "Monday–Friday, 7:00am–5:00pm",
    regularCutoffTime: "16:30",
    afterHoursPolicy: "by-appointment",
    weekendPolicy: "by-appointment",
    isTwentyFourSeven: false,
    bayCount: 6,
    bayIdentifiers: ["Bay 1", "Bay 2", "Bay 3", "Bay 4", "Bay 5", "Bay 6"],
  },
  featureFlags: {
    enablePublicSeoPrototypes: false,
    enableFreightRescue: false,
    enableGoogleReviews: false,
    enablePitchMode: true,
    enableCaseStudies: false,
    enableAnalytics: false,
    enablePhotoIntake: true,
    enablePublicPricing: false,
    enableCustomerPortal: false,
  },
};
