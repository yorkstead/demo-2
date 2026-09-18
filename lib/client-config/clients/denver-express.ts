import { ReworkClientConfig } from "../types";

/**
 * Denver Express Verified Client Configuration
 *
 * Target: Denver Express Warehousing & Cross-Docking
 * Address: 6030 Washington St, Suite 130, Denver, CO 80216
 * Canonical Website: https://denverexpressco.com
 *
 * EVIDENCE-ALIGNED CLIENT CONFIGURATION:
 * - Capabilities marked status: "verified" and public: true strictly reflect published
 *   capabilities from denverexpressco.com (Freight Rework, Cross-Docking, Warehousing).
 * - Distinctions:
 *   * Freight Weighing is verified (scale services / weight verification), but certified
 *     DOT axle-scale legalization is unverified.
 *   * Load Stabilization is verified as workflow/outcome (restabilizing loads, rewrapping to
 *     reduce shift risk), but specific unverified hardware (dunnage bags, load bars) is not claimed.
 *   * Rejected Load Recovery is verified as corrective rework on rejected freight, without claiming
 *     a physical dedicated rescue bay.
 *   * Operating hours: Mon–Fri 8:00 AM – 4:00 PM, receiving cutoff 3:30 PM, after-hours/weekend
 *     by appointment (fee may apply). Not 24/7.
 * - Unknown operational rates and pricing remain undefined.
 */
export const DENVER_EXPRESS_CONFIG: ReworkClientConfig = {
  id: "denver-express",
  businessName: "Denver Express",
  legalName: "Denver Express Warehousing & Cross-Docking",
  website: "https://denverexpressco.com",
  phone: "303-289-4343", // Verified from denverexpressco.com header
  email: "info@denverexpressco.com", // Verified from denverexpressco.com footer
  address: {
    street: "6030 Washington St",
    suite: "Suite 130",
    city: "Denver",
    state: "CO",
    zip: "80216",
    country: "USA",
    latitude: 39.8058,
    longitude: -104.9877,
  },
    locationContext: {
    marketArea: "Denver Metro & Front Range, CO",
    primaryCorridors: [
      "I-25 Exit 215 (58th Ave / Washington St)",
      "I-70 Washington St Junction (Exit 275A/B)",
      "I-270 / US-36 Freight Connector",
      "I-76 Northeast Industrial Corridor",
    ],
    junctionDescription: "Immediate dock access off I-25 Exit 215 & I-70 Washington St interchange",
    nearbyLandmarks: [
      "Commerce City Industrial Corridor",
      "Central Denver Distribution Cluster",
      "Front Range Logistics Hub",
    ],
    receiverCategories: [
      "Grocery distribution centers",
      "Retail fulfillment centers",
      "Cold storage & ambient distribution hubs",
      "Colorado Port of Entry scale compliance corridors",
    ],
  },
  serviceArea: [
    "Denver Metro",
    "Commerce City",
    "I-70 Mountain Corridor",
    "I-25 Front Range Corridor",
    "Adams County",
  ],
  provenance: {
    identity: {
      source: "client-website",
      reference: "https://denverexpressco.com",
      verifiedAt: "2026-09-08",
      notes: "Denver Express Warehousing & Cross-Docking; locally owned since 1998",
    },
    address: {
      source: "google-business-profile",
      reference: "6030 Washington St, Suite 130, Denver, CO 80216",
      verifiedAt: "2026-09-08",
    },
    website: {
      source: "client-website",
      reference: "https://denverexpressco.com",
      verifiedAt: "2026-09-08",
    },
    phone: {
      source: "client-website",
      reference: "303-289-4343 on denverexpressco.com header and footer",
      verifiedAt: "2026-09-08",
    },
    facility: {
      source: "client-website",
      reference: "denverexpressco.com: 60,000+ sq ft, 30ft storage, 6 dock doors, climate-controlled (no cold storage)",
      verifiedAt: "2026-09-08",
    },
    operations: {
      source: "client-website",
      reference: "denverexpressco.com FAQ: Mon-Fri 8:00am-4:00pm, 3:30pm cutoff, after-hours by appointment",
      verifiedAt: "2026-09-08",
    },
  },
  branding: {
    primaryColor: "#0b192c",
    accentColor: "#d4af37",
    tagline: "Denver Terminal Warehousing, Cross-Dock & Freight Rework",
    heroHeadline: "Denver Warehousing, Cross-Docking & Freight Rework",
    heroSubheadline:
      "60,000+ sq ft food-grade facility at I-25 Exit 215 & I-70 Washington St. Fast turns, secure storage, and pallet rework near major Denver corridors.",
  },

  /**
   * Client-Specific Capabilities
   *
   * 11 verified and published capabilities supported by denverexpressco.com.
   * 2 unverified capabilities remain private (public: false).
   */
  capabilities: [
    // --- VERIFIED CAPABILITIES (public: true) ---
    {
      serviceId: "cross-docking",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/#cross-docking",
        verifiedAt: "2026-09-08",
        notes: "Primary service in legal name, nav bar, and dedicated cross-docking page",
      },
    },
    {
      serviceId: "freight-rework",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/rework",
        verifiedAt: "2026-09-08",
        notes: "Advertised in primary hero and dedicated /rework service page",
      },
    },
    {
      serviceId: "transloading",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/#cross-docking",
        verifiedAt: "2026-09-08",
        notes: "Container transloading explicitly highlighted in facility photography and cross-docking description",
      },
    },
    {
      serviceId: "pallet-restacking",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/rework",
        verifiedAt: "2026-09-08",
        notes: "Listed under rework solutions: 'Shifted or leaning pallets: Need rework + secure for re-delivery'",
      },
    },
    {
      serviceId: "repalletizing",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/rework",
        verifiedAt: "2026-09-08",
        notes: "Listed on denverexpressco.com/rework: 'Repalletizing (CHEP + standard pallets)'",
      },
    },
    {
      serviceId: "load-stabilization",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/rework",
        verifiedAt: "2026-09-08",
        notes: "Verified workflow on denverexpressco.com/rework: 'needs to be stabilized for the next leg', 'Shrink wrap / restabilize: Rewrap freight to reduce shifting risk and prepare for re-delivery'",
      },
    },
    {
      serviceId: "rejected-load-recovery",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/rework",
        verifiedAt: "2026-09-08",
        notes: "Verified on denverexpressco.com/rework: 'Distressed load recovery: Get freight deliverable again', 'A rework request usually happens when freight can\'t be accepted as-is—rejected loads'",
      },
    },
    {
      serviceId: "shifted-load-recovery",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/rework",
        verifiedAt: "2026-09-08",
        notes: "Listed on denverexpressco.com/rework: 'Shifted / leaning pallets: Stabilize + rebuild to prevent collapse'",
      },
    },
    {
      serviceId: "shrink-wrapping",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/rework",
        verifiedAt: "2026-09-08",
        notes: "Listed on denverexpressco.com/rework: 'Shrink wrapping freight', 'Rewrap freight to reduce shifting risk'",
      },
    },
    {
      serviceId: "freight-weighing",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com/rework",
        verifiedAt: "2026-09-08",
        notes: "Listed on denverexpressco.com/rework: 'Weighing (scale services) for reworked loads when needed for documentation or shipping requirements'. Does not include certified DOT axle-weight legalization.",
      },
    },
    {
      serviceId: "short-term-staging",
      status: "verified",
      public: true,
      verification: {
        source: "client-website",
        reference: "https://denverexpressco.com",
        verifiedAt: "2026-09-08",
        notes: "Listed on denverexpressco.com: 'Missed delivery appointment: Need staging so drivers can keep moving'",
      },
    },

    // --- UNVERIFIED CAPABILITIES (public: false) ---
    {
      serviceId: "trailer-transfer",
      status: "unverified",
      public: false,
      notes: "Direct trailer-to-trailer emergency breakdown transfer protocol not explicitly published as a standalone service.",
    },
    {
      serviceId: "pallet-transfer",
      status: "unverified",
      public: false,
      notes: "Narrow physical pallet transfer not separately advertised beyond repalletizing.",
    },
  ],

  conversion: {
    primaryPhone: "303-289-4343",
    contactEmail: "info@denverexpressco.com",
    reserveRoute: "/denver-express/reserve",
    intakeRoute: "/denver-express/freight-rescue",
  },
  googleBusinessProfile: {
    claimed: true,
    mapsUrl: "https://maps.google.com/?q=6030+Washington+St+Denver+CO",
  },
  seo: {
    defaultTitle: "Denver Express Warehousing & Cross-Docking • Denver, CO",
    defaultDescription:
      "60,000+ sq ft food-grade warehousing, same-day cross-docking, and freight rework near I-25 and I-70 in Denver, CO.",
    canonicalDomain: "https://denverexpressco.com",
    noIndex: true, // Prototype pages remain noindex on Yorkstead domain
  },
  operations: {
    standardHours: "Monday–Friday, 8:00am–4:00pm",
    operatingHours: "Monday–Friday, 8:00am–4:00pm (Receiving Cutoff: 3:30pm; After-hours/weekend by appointment)",
    regularCutoffTime: "15:30",
    cutoffDescription: "3:30pm Monday–Friday standard receiving cutoff",
    afterHoursPolicy: "by-appointment",
    afterHoursDescription: "After-hours and weekend receiving is available by appointment (a fee may apply)",
    weekendPolicy: "by-appointment",
    isTwentyFourSeven: false,
    facilitySizeSqFt: 60000,
    facilityType: "climate-controlled (no cold storage)",
    storageHeightFt: 30,
    bayCount: 6,
    bayIdentifiers: undefined, // Left undefined until specific dock numbering verified
    slaTurnaround: undefined,  // Left undefined until verified
    serviceLimits: undefined,  // Left undefined until verified
    verifiedRates: undefined,  // Left undefined (denverexpressco.com requires 'Request a Quote')
  },
  featureFlags: {
    enablePublicSeoPrototypes: true,
    enableFreightRescue: true,
    enableGoogleReviews: false,
    enablePitchMode: true,
    enableCaseStudies: false,
    enableAnalytics: false,
    enablePhotoIntake: true,
    enablePublicPricing: false, // Omitted until pricing verified
    enableCustomerPortal: false,
  },
};
