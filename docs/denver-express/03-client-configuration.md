# Multi-Tenant Client Configuration & Capability Provenance Architecture

**Document Version:** 2.1.0 (Evidence-Aligned Pass)  
**System Module:** `lib/client-config/`  
**Target Client:** Denver Express Warehousing & Cross-Docking (and future logistics partners)  
**Governing Rule:** Complete Separation of Platform Taxonomy from Client Capabilities — Zero Contamination of Core Rework Flow  

---

## 1. Architectural Philosophy & Separation of Concerns

The Yorkstead Rework Flow client configuration system operates on four strict architectural distinctions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. PLATFORM TAXONOMY (STANDARD_SERVICES)                                     │
│    Canonical operational capabilities defined by the Yorkstead platform     │
│    (independent of any specific client). Pure operational capabilities.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CLIENT CAPABILITY DECLARATIONS (ClientServiceCapability[])               │
│    Each client explicitly declares its relationship to each service:        │
│    • status: "verified"   (real supporting evidence exists)                 │
│    • status: "unverified" (platform supports it; client evidence pending)   │
│    • status: "unsupported"(client is known not to provide it)               │
│    • public: boolean      (MUST default to false for unverified)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. PROVENANCE & VERIFICATION TRACKING (VerificationSource)                  │
│    Every verified client value or capability explicitly documents its       │
│    provenance (client-website, google-business-profile, repository, etc.).  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PROTECTED BASELINE SYSTEM                                                │
│    Core routes (/dock, /office, /reserve, /api/jobs) remain untouched.      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
lib/client-config/
├── types.ts                     # Types: ReworkClientConfig, ClientServiceCapability, OperationsConfig, etc.
├── services.ts                  # STANDARD_SERVICES taxonomy + capability query helpers
├── registry.ts                  # Multi-tenant registry & path/host resolvers
├── index.ts                     # Unified public barrel export
└── clients/
    ├── default.ts               # Unbranded Yorkstead baseline product configuration
    └── denver-express.ts        # Denver Express verified client configuration
```

---

## 3. Reusable Service Taxonomy vs. Client Capabilities

### 3.1 Normalized Operational Taxonomy (`StandardServiceDefinition`)
Operational capabilities are modeled purely on what warehouse labor and equipment physically execute, keeping:
- **Service** (operational capability: cross-docking, transloading, repalletizing)
- **Customer problem** (shifted cargo, missed appointment, broken GMA pallet)
- **Urgency** (standard, scheduled, emergency)
- **Facility characteristic** (climate-controlled, high-ceiling, dock-high doors)

as distinct concepts.

The 13 canonical operational services:
1. `freight-rework`
2. `cross-docking`
3. `transloading`
4. `pallet-restacking`
5. `repalletizing`
6. `load-stabilization`
7. `rejected-load-recovery`
8. `shifted-load-recovery`
9. `shrink-wrapping`
10. `freight-weighing`
11. `short-term-staging`
12. `trailer-transfer`
13. `pallet-transfer`

### 3.2 Key Conceptual Distinctions

#### A. Freight Weighing vs. Certified Axle-Weight Legalization
- **Freight Weighing (`freight-weighing`):** Platform and pallet scale services to verify reworked cargo weights, detect overages, and document weight compliance for shipping paperwork. This is **verified** for Denver Express.
- **DOT Axle-Weight Legalization / Redistribution:** Certified axle-by-axle scale measurement and tractor/trailer axle relocation to clear Port of Entry citations. This is **unverified / unsupported** for Denver Express.

#### B. Appointment-Based After-Hours Access vs. 24/7 Operations
- **Operating Hours Model:** Denver Express operates on a structured schedule:
  * Standard Hours: Monday–Friday, 8:00 AM – 4:00 PM
  * Standard Receiving Cutoff: Monday–Friday, 3:30 PM
  * After-Hours & Weekend Availability: Available **by appointment only** (an additional fee may apply).
- **24/7 Status:** Denver Express is **NOT 24/7** and does not provide guaranteed continuous walk-in dock receiving.

#### C. Pallet Transfer vs. SKU Sorting / Piece Picking
- **Pallet Transfer (`pallet-transfer`):** Defined narrowly as the physical transfer of freight between pallets or palletized configurations. It does **not** assume SKU count reconciliation, case sorting, or piece-level order picking.

---

## 4. Provenance Tracking System (`VerificationSource`)

Every verified fact in a client profile documents its origin internally without exposing internal notes to public UI:

```ts
export type VerificationSourceType =
  | "client"
  | "client-website"
  | "google-business-profile"
  | "repository"
  | "manual-verification";

export interface VerificationSource {
  readonly source: VerificationSourceType;
  readonly reference?: string;
  readonly verifiedAt?: string;
  readonly notes?: string;
}
```

---

## 5. Denver Express Final Capability Alignment Matrix

Audited directly against official published records at `https://denverexpressco.com` (including `/`, `/rework`, and FAQ sections):

### 5.1 Capability Matrix

| Service ID | Status | Public? | Provenance / Evidentiary Basis |
| :--- | :--- | :--- | :--- |
| `cross-docking` | **verified** | **true** | Core service in legal name, main nav, and `denverexpressco.com/#cross-docking`. |
| `freight-rework` | **verified** | **true** | Advertised in primary hero and dedicated `/rework` page on `denverexpressco.com`. |
| `transloading` | **verified** | **true** | Container transloading explicitly highlighted in site facility photography. |
| `pallet-restacking` | **verified** | **true** | Listed under rework: `Shifted or leaning pallets: Need rework + secure for re-delivery`. |
| `repalletizing` | **verified** | **true** | Listed on `/rework`: `Repalletizing (CHEP + standard pallets)`. |
| `load-stabilization` | **verified** | **true** | Published on `/rework`: `needs to be stabilized for the next leg`, `Shrink wrap / restabilize: Rewrap freight to reduce shifting risk`. |
| `rejected-load-recovery`| **verified** | **true** | Published on `/rework`: `Distressed load recovery: Get freight deliverable again`, `freight can't be accepted as-is—rejected loads`. |
| `shifted-load-recovery`| **verified** | **true** | Listed on `/rework`: `Shifted / leaning pallets: Stabilize + rebuild to prevent collapse`. |
| `shrink-wrapping` | **verified** | **true** | Explicitly listed on `/rework`: `Shrink wrapping freight`, `Rewrap freight to reduce shifting risk`. |
| `freight-weighing` | **verified** | **true** | Explicitly listed on `/rework`: `Weighing (scale services) for reworked loads when needed for documentation or shipping requirements`. |
| `short-term-staging` | **verified** | **true** | Listed on site: `Missed delivery appointment: Need staging so drivers can keep moving`. |
| `trailer-transfer` | **unverified**| **false**| Direct trailer-to-trailer breakdown equipment transfer protocol not explicitly published. |
| `pallet-transfer` | **unverified**| **false**| Narrow physical pallet transfer not separately advertised beyond repalletizing. |

### 5.2 Explicitly Unsupported / Unverified Claims
1. **No 24/7 Continuous Operation:** Standard hours 8:00 AM – 4:00 PM; receiving cutoff 3:30 PM Mon–Fri; after-hours/weekends strictly by appointment.
2. **No DOT Axle-Scale Legalization:** Pallet scale weight checks only; no certified axle-scale rebalance service.
3. **No Cold-Dock / Temperature-Controlled Reefer Handling:** Verified as climate-controlled dry storage only (no cold storage / no refrigerated dock).
4. **No Drop-Trailer Yard Staging:** Indoor dock receiving only.
5. **No Public Rates/Tariffs:** All rates remain `undefined` (requires direct quote request).

---

## 6. Helper Utilities

```ts
import { getClientPublicServices, isServicePublic } from "@/lib/client-config";

// Returns the 11 verified, public services for Denver Express
const publicServices = getClientPublicServices(denverExpressConfig);

// Boolean checks
isServicePublic(denverExpressConfig, "rejected-load-recovery"); // true
isServicePublic(denverExpressConfig, "load-stabilization");       // true
isServicePublic(denverExpressConfig, "freight-weighing");         // true
isServicePublic(denverExpressConfig, "trailer-transfer");         // false
```

---

## 7. Zero Regression Guarantee

No files in `app/dock`, `app/office`, `app/reserve`, `app/api/jobs`, `lib/storage.ts`, `lib/types.ts`, or `lib/sound.ts` were modified.
