import {
  StandardServiceDefinition,
  StandardServiceId,
  ReworkClientConfig,
  ClientServiceCapability,
} from "./types";

/**
 * Standard Reusable Service Taxonomy (Yorkstead Platform)
 *
 * Defines the canonical logistics, rework, and cross-docking capabilities
 * supported by the Yorkstead platform architecture.
 *
 * Operational capabilities are modeled independently of client-specific status,
 * customer problems, urgency levels, or marketing modifiers.
 */
export const STANDARD_SERVICES: readonly StandardServiceDefinition[] = [
  {
    id: "freight-rework",
    slug: "freight-rework",
    name: "Freight Rework",
    shortDescription: "Bay rework and correction for damaged, leaning, or non-compliant cargo.",
    longDescription:
      "Pallet breakdown, damaged cargo segregation, restacking onto standard GMA spec pallets, and heavy containment stretch wrapping to resolve receiving non-conformance.",
    category: "recovery",
    supportedUrgencies: ["emergency", "scheduled", "standard"],
    associatedProblems: ["receiver-rejection", "leaning-pallet", "damaged-tiers", "shifted-cargo"],
    keywords: ["freight rework", "pallet rework", "cargo correction", "freight triage"],
    structuredDataInfo: {
      serviceType: "Freight Rework",
      category: "LogisticsService",
    },
  },
  {
    id: "cross-docking",
    slug: "cross-docking",
    name: "Cross-Docking",
    shortDescription: "Direct inbound trailer-to-outbound dock or trailer transfer.",
    longDescription:
      "High-velocity dock staging and transfer eliminating warehouse dwell time. Freight is verified, staged, sorted, and loaded onto outbound transport without detention delay.",
    category: "transfer",
    supportedUrgencies: ["scheduled", "standard", "emergency"],
    associatedProblems: ["missed-appointment", "detention-risk", "carrier-consolidation", "split-shipment"],
    keywords: ["cross dock", "cross docking service", "dock transfer", "fast crossdock"],
    structuredDataInfo: {
      serviceType: "Cross Docking",
      category: "LogisticsService",
    },
  },
  {
    id: "transloading",
    slug: "transloading",
    name: "Transloading",
    shortDescription: "Full or partial cargo transfer between trailers, containers, or rail.",
    longDescription:
      "Freight transfer from disabled trailers, overweight equipment, or ocean import containers onto domestic road-ready 53ft dry vans or intermodal chassis.",
    category: "transfer",
    supportedUrgencies: ["scheduled", "standard", "emergency"],
    associatedProblems: ["container-breakdown", "floor-loaded-import", "equipment-failure"],
    keywords: ["transloading", "trailer transfer", "container transload", "floor to pallet"],
    structuredDataInfo: {
      serviceType: "Transloading",
      category: "LogisticsService",
    },
  },
  {
    id: "pallet-restacking",
    slug: "pallet-restacking",
    name: "Pallet Restacking",
    shortDescription: "Restacking collapsed, leaning, or off-center pallet tiers.",
    longDescription:
      "Manual and forklift breakdown and rebuilding of unstable cartons, bags, or pails into tight interlocking patterns meeting strict receiver height and cube specifications.",
    category: "handling",
    supportedUrgencies: ["emergency", "scheduled", "standard"],
    associatedProblems: ["collapsed-tier", "leaning-stack", "height-violation", "cube-overage"],
    keywords: ["pallet restacking", "restack freight", "leaning pallet fix", "tier rebuilding"],
    structuredDataInfo: {
      serviceType: "Pallet Restacking",
      category: "LogisticsService",
    },
  },
  {
    id: "repalletizing",
    slug: "repalletizing",
    name: "Repalletizing",
    shortDescription: "Transferring cargo from broken, cracked, or rejected pallets.",
    longDescription:
      "Complete cargo transfer onto clean Grade-A GMA standard 48x40 wooden or plastic pallets when baseboards or stringers fail safety or receiver criteria.",
    category: "handling",
    supportedUrgencies: ["emergency", "scheduled", "standard"],
    associatedProblems: ["broken-pallet", "cracked-stringer", "missing-deckboard", "gma-rejection"],
    keywords: ["repalletizing", "pallet swap", "broken pallet replacement", "gma pallet transfer"],
    structuredDataInfo: {
      serviceType: "Repalletizing",
      category: "LogisticsService",
    },
  },
  {
    id: "load-stabilization",
    slug: "load-stabilization",
    name: "Load Stabilization",
    shortDescription: "Securing, rewrapping, and stabilizing unstable cargo for the next leg.",
    longDescription:
      "Corrective securing and restabilizing of unstable, leaning, or compromised freight using industrial stretch wrap and stabilization methods to reduce in-transit shift risk prior to re-delivery.",
    category: "handling",
    supportedUrgencies: ["standard", "emergency"],
    associatedProblems: ["loose-cargo", "transit-vibration", "mountain-transit-lean", "unsecured-tiers"],
    keywords: ["load stabilization", "pallet stabilization", "cargo securement", "restabilize load"],
    structuredDataInfo: {
      serviceType: "Load Stabilization",
      category: "LogisticsService",
    },
  },
  {
    id: "rejected-load-recovery",
    slug: "rejected-load-recovery",
    name: "Rejected Load Recovery",
    shortDescription: "Corrective rework and triage for freight turned away by receivers.",
    longDescription:
      "Receiving, assessing, and executing corrective rework on loads rejected by distribution centers and commercial receivers to bring cargo into deliverable compliance.",
    category: "recovery",
    supportedUrgencies: ["emergency", "expedited"],
    associatedProblems: ["dc-rejection", "warehouse-refusal", "bol-mismatch", "damaged-cases", "rejected-freight"],
    keywords: ["rejected load recovery", "receiver rejection fix", "warehouse rejection", "freight rescue"],
    structuredDataInfo: {
      serviceType: "Rejected Load Recovery",
      category: "LogisticsService",
    },
  },
  {
    id: "shifted-load-recovery",
    slug: "shifted-load-recovery",
    name: "Shifted Load Recovery",
    shortDescription: "Unloading and righting severe cargo leans caused by transit.",
    longDescription:
      "Controlled extraction of cargo pressed against trailer roll-up or swing doors, followed by uprighting, restacking, and re-securing.",
    category: "recovery",
    supportedUrgencies: ["emergency"],
    associatedProblems: ["door-jammed-cargo", "trailer-wall-collapse", "hard-brake-shift", "transit-lean"],
    keywords: ["shifted load recovery", "door stuck freight", "mountain transit lean", "trailer wall collapse"],
    structuredDataInfo: {
      serviceType: "Shifted Load Recovery",
      category: "LogisticsService",
    },
  },
  {
    id: "shrink-wrapping",
    slug: "shrink-wrapping",
    name: "Shrink Wrapping",
    shortDescription: "Industrial stretch wrapping with corner board reinforcing.",
    longDescription:
      "Application of multi-layer commercial stretch film with corner board protection to lock pallet tiers and prevent transit vibration migration.",
    category: "handling",
    supportedUrgencies: ["standard", "emergency"],
    associatedProblems: ["loose-cartons", "unwrapped-pallets", "loose-tier-migration"],
    keywords: ["stretch wrapping", "shrink wrap pallets", "80 gauge wrap", "pallet banding"],
    structuredDataInfo: {
      serviceType: "Stretch Wrapping",
      category: "LogisticsService",
    },
  },
  {
    id: "freight-weighing",
    slug: "freight-weighing",
    name: "Freight Weighing",
    shortDescription: "Scale services and weight verification for reworked loads.",
    longDescription:
      "Scale weighing of reworked pallets and cargo to document weight compliance, verify shipping requirements, and detect gross discrepancies.",
    category: "compliance",
    supportedUrgencies: ["standard", "scheduled"],
    associatedProblems: ["weight-verification", "bill-of-lading-audit", "shipping-compliance"],
    keywords: ["freight weighing", "scale services", "pallet scale", "weight verification"],
    structuredDataInfo: {
      serviceType: "Freight Weighing",
      category: "LogisticsService",
    },
  },
  {
    id: "short-term-staging",
    slug: "short-term-staging",
    name: "Short-Term Staging",
    shortDescription: "Secure dock holding while awaiting rescheduled appointments.",
    longDescription:
      "Protected, monitored staging floor space for rejected or rescheduled freight, allowing line-haul power units and drivers to remain in service.",
    category: "storage",
    supportedUrgencies: ["scheduled", "standard", "emergency"],
    associatedProblems: ["rescheduled-appointment", "missed-receiving-window", "layover-avoidance"],
    keywords: ["freight staging", "short term cross dock hold", "temporary dock storage", "appointment holding"],
    structuredDataInfo: {
      serviceType: "Freight Staging",
      category: "LogisticsService",
    },
  },
  {
    id: "trailer-transfer",
    slug: "trailer-transfer",
    name: "Trailer Transfer",
    shortDescription: "Direct dock door transfer between breakdown and recovery equipment.",
    longDescription:
      "Direct cross-dock pallet transfer from disabled carrier equipment to replacement trailers to keep shipments moving without yard drop delays.",
    category: "transfer",
    supportedUrgencies: ["emergency", "scheduled"],
    associatedProblems: ["power-unit-breakdown", "trailer-reefer-malfunction", "chassis-damage"],
    keywords: ["trailer to trailer transfer", "power unit breakdown transfer", "direct dock move"],
    structuredDataInfo: {
      serviceType: "Trailer Transfer",
      category: "LogisticsService",
    },
  },
  {
    id: "pallet-transfer",
    slug: "pallet-transfer",
    name: "Pallet Transfer",
    shortDescription: "Physical transfer of freight between pallets or palletized configurations.",
    longDescription:
      "Direct physical transfer of freight from one pallet format or pallet unit to another, adjusting pallet configurations without altering product composition.",
    category: "handling",
    supportedUrgencies: ["standard", "scheduled"],
    associatedProblems: ["pallet-configuration-change", "pallet-swap", "restaging-transfer"],
    keywords: ["pallet transfer", "freight transfer between pallets", "pallet move"],
    structuredDataInfo: {
      serviceType: "Pallet Transfer",
      category: "LogisticsService",
    },
  },
];

/**
 * Retrieve a standard service definition by its canonical ID.
 */
export function getServiceById(id: StandardServiceId): StandardServiceDefinition | undefined {
  return STANDARD_SERVICES.find((s) => s.id === id);
}

/**
 * Retrieve a standard service definition by its URL slug.
 */
export function getServiceBySlug(slug: string): StandardServiceDefinition | undefined {
  return STANDARD_SERVICES.find((s) => s.slug === slug);
}

/**
 * Get the client's declared capability entry for a specific service ID.
 */
export function getClientCapability(
  config: ReworkClientConfig,
  serviceId: StandardServiceId
): ClientServiceCapability | undefined {
  return config.capabilities.find((c) => c.serviceId === serviceId);
}

/**
 * Retrieve only those services that are verified AND marked public for a client.
 * Does NOT infer public availability from platform taxonomy.
 */
export function getClientPublicServices(
  config: ReworkClientConfig
): readonly StandardServiceDefinition[] {
  const publicIds = new Set(
    config.capabilities
      .filter((c) => c.status === "verified" && c.public === true)
      .map((c) => c.serviceId)
  );

  return STANDARD_SERVICES.filter((s) => publicIds.has(s.id));
}

/**
 * Check if a specific service is publicly available for a client.
 */
export function isServicePublic(
  config: ReworkClientConfig,
  serviceId: StandardServiceId
): boolean {
  const cap = getClientCapability(config, serviceId);
  return Boolean(cap && cap.status === "verified" && cap.public === true);
}
