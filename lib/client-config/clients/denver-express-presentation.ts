import type { ClientPresentation } from "../presentation";

// Editorial copy follows 03-client-configuration and 04-keyword-intent-map.
// Service claims are gated again at render and submission time.
export const DENVER_EXPRESS_PRESENTATION: ClientPresentation = {
  clientId: "denver-express",
  basePath: "/denver-express",
  headline: "Freight problem in Denver? Start with the right help.",
  introduction:
    "Rework, cross-docking and freight recovery at Denver Express. Share the load condition and receiver requirements, then confirm availability directly with the team.",
  pages: [
    {
      slug: "freight-rework",
      serviceId: "freight-rework",
      title: "Freight rework in Denver",
      summary:
        "Corrective handling for freight that needs attention before its next delivery.",
      problem:
        "Freight cannot be accepted in its current condition, or a receiver has asked for corrective work.",
      approach:
        "Denver Express publishes freight rework services including restacking, repalletizing and rewrapping. The required work depends on the condition of the freight and the receiving requirements.",
      prepare: [
        "Photos of the affected freight",
        "Pallet count and commodity",
        "Receiver instructions and next appointment",
      ],
      cta: "Request Freight Rework",
      related: ["pallet-restacking", "repalletizing", "rejected-load"],
    },
    {
      slug: "cross-docking",
      serviceId: "cross-docking",
      title: "Cross-docking in Denver",
      summary:
        "Coordinate inbound and outbound freight handling with Denver Express.",
      problem:
        "An inbound load needs an onward movement, or a missed appointment has interrupted the delivery plan.",
      approach:
        "Cross-docking is a published Denver Express service. Confirm inbound equipment, outbound arrangements and receiving availability before routing a driver to the facility. A missed delivery may also require short-term staging.",
      prepare: [
        "Inbound and outbound equipment details",
        "Freight dimensions and pallet count",
        "Arrival window and outbound contact",
      ],
      cta: "Check Cross-Dock Availability",
      related: ["transloading", "short-term-staging", "freight-rework"],
    },
    {
      slug: "transloading",
      serviceId: "transloading",
      title: "Transloading in Denver",
      summary:
        "Discuss container transloading and freight handling requirements before arrival.",
      problem:
        "A container load needs handling as part of its next transport movement.",
      approach:
        "Denver Express publishes container transloading capability. Share how the cargo is loaded, its dimensions and the intended outbound equipment so the team can confirm the scope. Equipment compatibility and scheduling require confirmation.",
      prepare: [
        "Container and outbound equipment types",
        "Floor-loaded or palletized condition",
        "Commodity, dimensions and handling requirements",
      ],
      cta: "Request Transloading",
      related: ["cross-docking", "short-term-staging"],
    },
    {
      slug: "rejected-load",
      serviceId: "rejected-load-recovery",
      title: "Rejected-load recovery in Denver",
      summary:
        "Turn receiver rejection details into a clear corrective-work request.",
      problem:
        "A receiver has refused freight because its current condition does not meet receiving requirements.",
      approach:
        "Denver Express describes corrective rework for rejected freight to prepare it for re-delivery. Send the actual rejection reason so the team can assess whether restacking, repalletizing or rewrapping addresses the issue. Receiver acceptance must be confirmed separately.",
      prepare: [
        "Rejection reason or redacted paperwork image",
        "Photos showing the affected pallets",
        "Receiver requirements and redelivery deadline",
      ],
      cta: "Start Freight Rescue",
      related: ["freight-rework", "shifted-load", "repalletizing"],
    },
    {
      slug: "shifted-load",
      serviceId: "shifted-load-recovery",
      title: "Shifted-load recovery in Denver",
      summary:
        "Request assessment for shifted or leaning pallets and corrective rework.",
      problem:
        "Pallets have shifted or leaned in transit and need corrective handling before delivery.",
      approach:
        "Denver Express publishes stabilization and rebuilding of shifted or leaning pallets. Describe the condition and share photos already available to you. The team must assess handling requirements and availability before work is scheduled.",
      prepare: [
        "Existing photos of the shift or lean",
        "Number of affected pallets",
        "Receiver requirements and trailer details",
      ],
      cta: "Call for Urgent Freight Help",
      related: ["pallet-restacking", "freight-rework", "rejected-load"],
    },
    {
      slug: "pallet-restacking",
      serviceId: "pallet-restacking",
      title: "Pallet restacking in Denver",
      summary:
        "Rebuild shifted or leaning pallet loads for their next delivery.",
      problem:
        "The arrangement of freight on a pallet needs rebuilding. If the pallet base needs replacement, repalletizing may also be required.",
      approach:
        "Restacking addresses the freight arrangement on the pallet. Denver Express describes rebuilding shifted or leaning pallets and securing freight for re-delivery. Share the receiving specification so the scope can be confirmed.",
      prepare: [
        "Affected pallet count",
        "Photos of pallet condition and freight arrangement",
        "Required configuration from the receiver",
      ],
      cta: "Request Freight Rework",
      related: ["repalletizing", "shifted-load", "freight-rework"],
    },
    {
      slug: "repalletizing",
      serviceId: "repalletizing",
      title: "Repalletizing in Denver",
      summary:
        "Request freight transfer onto suitable pallets when the existing base is unsuitable.",
      problem:
        "A damaged or unsuitable pallet base is preventing onward delivery.",
      approach:
        "Denver Express publishes repalletizing services. Provide the receiver’s pallet requirements and the condition of the current bases. Confirm pallet suitability and availability with the team before committing to a delivery plan.",
      prepare: [
        "Photos of affected pallet bases",
        "Receiver pallet specification",
        "Pallet count and load reference",
      ],
      cta: "Request Repalletizing",
      related: ["pallet-restacking", "rejected-load", "freight-rework"],
    },
    {
      slug: "short-term-staging",
      serviceId: "short-term-staging",
      title: "Short-term freight staging in Denver",
      summary:
        "Discuss temporary freight holding when a delivery plan changes.",
      problem:
        "A missed receiving appointment or a change in transport timing creates a temporary holding need.",
      approach:
        "Denver Express describes staging for missed delivery appointments. Its facility is climate-controlled with no cold storage. Confirm commodity suitability, space, handling scope and the pickup plan directly with the team.",
      prepare: [
        "Commodity and pallet count",
        "Expected holding period",
        "Pickup contact and next delivery appointment",
      ],
      cta: "Request Short-Term Staging",
      related: ["cross-docking", "transloading"],
    },
  ],
  opportunity: [
    "Connect existing published rework capabilities to a clear problem-led request path.",
    "Consolidate 23 priority searches into six primary intent pages and two supporting pages.",
    "Carry request context and photos into the existing dock and office demonstration.",
    "Build permission-backed case evidence and a neutral review-request process.",
  ],
  productionRequirements: [
    "Client approval of public content, service scope, hours and intake ownership.",
    "Authenticated staff access, tenant authorization, private evidence storage and retention controls.",
    "A real triage state before scheduling, verified rates and approved receiving policies.",
    "Production website access, URL inventory, canonical mapping and rollback plan.",
    "Google Business Profile owner access and a verified review link.",
    "Physical-device acceptance tests for camera, signature, printing, sound and PWA installation.",
  ],
};
