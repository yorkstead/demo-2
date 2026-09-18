# Rework Flow Baseline Product & Architecture Audit

**Document Version:** 1.1.0  
**Project:** Rework Flow (`rework-flow.yorkstead.com`)  
**Product Origin:** Yorkstead Systems  
**Status:** Baseline Established — Protected Core  

---

## 1. Executive Summary & Audit Mandate

Rework Flow is an operational software product engineered by Yorkstead Systems for real-time cargo rework, freight recovery, cross-docking intake, evidence capture, and office billing. 

This audit establishes the baseline architectural state of `rework-flow.yorkstead.com`. In accordance with Yorkstead engineering governance:
* **The existing application is the baseline product.**
* **No existing code is to be redesigned, replaced, refactored, repurposed, or materially altered during this task.**
* **Denver Express will be implemented strictly as an isolated client/demo layer.**
* All core data models, dual-screen synchronization protocols, tamper-evident audit trails, and PWA capabilities documented herein represent a protected regression baseline.

---

## 2. Technical Stack & Dependencies

| Layer | Technology | Version | Notes / Operational Behavior |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Turbopack) | `16.3.0` | Uses React Server Components + Client Boundaries |
| **UI Library** | React / React DOM | `19.2.8` | Uses React 19 `useTransition`, `startTransition` |
| **Styling** | Tailwind CSS / PostCSS | `@tailwindcss/postcss ^4`, `tailwindcss ^4` | Dark mode base `#060d17`, slate/amber theme |
| **Class Utilities** | `clsx`, `tailwind-merge` | `^2.1.1`, `^3.6.0` | Dynamic style merging |
| **Icons** | Lucide React | `^1.31.0` | Touch terminal icons |
| **Schema Validation** | Zod | `4.5.4` | Strict parsing on `POST /api/jobs` |
| **Video Engine** | Remotion | `4.0.521` | Client-side `@remotion/player` + CLI rendering |
| **Package Manager** | Bun / npm | Node 20+, Bun lockfile present (`bun.lock`) | Node/npm/bun compatibility |
| **Deployment Target** | Vercel Serverless | Production target `rework-flow.yorkstead.com` | Edge/Serverless hybrid with Vercel KV / Redis support |

---

## 3. Project Architecture & Directory Mapping

```
rework-flow/
├── .data/                                # Local filesystem persistent storage
│   ├── jobs-store.json                  # Session-isolated active and historic jobs
│   └── immutable-audit-ledger.jsonl     # Append-only SHA-256 chained audit entries
├── app/                                 # Next.js 16 App Router tree
│   ├── layout.tsx                       # Root HTML shell, PWA metadata, ServiceWorker loader
│   ├── globals.css                      # Tailwind v4 directives, custom scrollbars, animations
│   ├── manifest.ts                      # Dynamic Web App Manifest (PWA launcher config)
│   ├── page.tsx                         # Yorkstead Rework Flow Launchpad & Hub
│   ├── dock/
│   │   └── page.tsx                     # Forklift Tablet Touch Terminal (Intake, Camera, Tally, Sign)
│   ├── office/
│   │   └── page.tsx                     # Dispatcher/Billing Board (Live bay monitor, PDF Cert, QuickBooks)
│   ├── reserve/
│   │   └── page.tsx                     # Driver Mobile Bay Hold & Instant Quote engine
│   ├── maps/
│   │   └── page.tsx                     # Highway Driver Discovery Simulation (Google Maps Acquisition)
│   ├── commercial/
│   │   └── page.tsx                     # Programmatic Remotion Pitch Commercial & Teleprompter
│   └── api/
│       └── jobs/
│           └── route.ts                 # Authoritative state machine, bay allocation, audit logging
├── components/
│   └── PwaInstallPrompt.tsx             # Multi-mode PWA install banner with standalone detection
├── lib/
│   ├── types.ts                         # Core ReworkJob, AuditLogEntry, RATES, and pricing rules
│   ├── storage.ts                       # Dual-tier storage (Disk/Memory/KV), allocation & hash ledger
│   ├── mock-data.ts                     # Initial seed jobs and reference cargo images
│   └── sound.ts                         # Web Audio API 2-tone synthetic chime generator
├── public/                              # PWA icons, manifest fallback, static damage photos, sw.js
├── remotion/                            # Video composition source, scenes, and root index
├── docs/                                # Yorkstead Product & Client documentation
│   └── denver-express/                  # Denver Express audit and roadmap specs
└── package.json                         # Scripts, dependencies, and environment configuration
```

---

## 4. Systems, Storage & State Engine

### 4.1 Hybrid Storage Engine (`lib/storage.ts`)
1. **Multi-Environment Persistence**:
   - **Local Development / Node Server**: Stores data in `./.data/jobs-store.json`.
   - **Vercel Serverless / Multi-Instance Cloud**: Connects automatically to Upstash Redis or Vercel KV when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`) are configured.
   - **In-Memory Cache**: Maintains `globalThis.__reworkSessionsStore` and `globalThis.__reworkAuditLedger` for low-latency in-process response times.
2. **Session Isolation**:
   - Every request is segmented by `sessionId` (via query param `?session=`, header `x-session-id`, or cookie `rework_session`).
   - Defaults to `"demo-main"` for unified live pitches, allowing two physical devices to pair seamlessly.
3. **Tamper-Evident Operational Audit Log**:
   - Each state change (`JOB_RESERVED`, `JOB_UPDATED`, `JOB_COMPLETED`, `JOB_BILLED`, `SESSION_RESET`) generates an append-only JSONL record.
   - Every entry computes a SHA-256 hash incorporating the previous entry's hash (`prevHash + JSON(entry)`), creating a cryptographically chained operational audit log for dispute resolution and compliance.

### 4.2 API Layer (`app/api/jobs/route.ts`)
- **`GET /api/jobs`**:
  - Fetches active session jobs.
  - Supports `?reset=true` (resets session jobs to default seed state).
  - Supports `?audit=true` (retrieves the full cryptographically chained audit log).
- **`POST /api/jobs`**:
  - Enforces a 5MB payload limit to support base64 canvas signatures and photos.
  - Validates payload structure using Zod (`JobPayloadSchema`).
  - Authoritatively calculates billing totals using server-side rate tables (`RATES`).
  - Allocates bays dynamically (`Bay 1` through `Bay 6`) with an automated 45-minute reservation expiration hold.

---

## 5. Existing Functionality & Role Perspectives

### 5.1 Forklift Operator Perspective (`/dock`)
- **Stationary Tablet Mount**: Designed specifically for forklift dashboard tablets with no page scrolling, large touch targets, and high contrast for warehouse glare.
- **Screen Wake Lock API**: Actively prevents the tablet screen from locking or going to sleep during active operations.
- **Top Bar Minimization**: Toggleable "Hide Bar" mode provides maximum vertical space for tallying and intake.
- **Click-to-Camera Capture**: Direct native rear-camera access (`capture="environment"`) on photo viewports for wide-shot damage, runner defects, and completed restacks.
- **Touch Tally Counters**: Big increment/decrement buttons for Grade-A GMA pallets, 80ga stretch wrap, corner boards, certified re-weighs, and labor hours.
- **Digital Driver Sign-on-Glass**: Interactive HTML5 canvas with touch support, sample signature loader, and full-screen landscape signature mode.

### 5.2 Office Administrator / Dispatcher Perspective (`/office`)
- **Real-Time Bay Monitoring**: Dynamic status cards displaying bay occupancy, active carrier name, trailer ID, and labor elapsed.
- **Live Sound Alerts**: Web Audio API two-tone synthesized acoustic chime fires automatically when a new driver reservation or job completion is detected via background polling.
- **Digital Evidence Certificate**: High-fidelity modal displaying Mountain Denver GPS time stamps, itemized pricing breakdown, carrier release text, and driver signature.
- **QuickBooks Batch Invoicing**: Export modal supporting standard QBO CSV format and QuickBooks Desktop IIF format with Net 15 terms, account coding, and one-click clipboard copying.
- **Tamper-Evident Audit Trail Modal**: Viewable ledger showing entry IDs, event action types, and SHA-256 cryptographic verification hashes.

### 5.3 Customer / Carrier Perspective (`/reserve`)
- **Pre-Arrival Bay Hold**: Real-time reservation from highway corridor allowing drivers rejected at receivers or scale houses to secure a rework bay.
- **Dynamic Cost Estimator**: Instant rate estimate based on reported issue (Shifted Cargo, Axle Rebalance, Pallet Swap, Container Transload) and pallet count.
- **45-Minute Bay Guarantee**: Countdown hold voucher providing gate instructions and GPS directions to 6030 Washington St.

### 5.4 Public Visitor / Driver Discovery (`/maps`)
- **Highway Acquisition Simulation**: Realistic interactive simulation of a truck driver searching for "emergency pallet rework I-70" on Google Maps.
- **Exclusive Fast-Track Action**: Demonstrates lead conversion by linking directly to `/reserve` while preserving session context.

### 5.5 Yorkstead Presenter Perspective (`/`, `/commercial`)
- **Product Launchpad (`/`)**: Central launchpad linking directly to acquisition, driver mobile, forklift dock, and office dispatch screens. Includes an interactive 4-step live pitch guide drawer.
- **Programmatic Commercial (`/commercial`)**: 60-second synchronized video pitch rendered with Remotion, featuring a teleprompter, scene scrubber, and full-resolution export capability.

---

## 6. Categorization: Core vs. Client vs. Shared

```
┌────────────────────────────────────────────────────────────────────────┐
│                        YORKSTEAD PRODUCT LAYERS                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. CORE REWORK FLOW (Protected Baseline)                               │
│    • Real-time two-device synchronization architecture                 │
│    • State machine: Reserved -> In Progress -> Completed -> Billed    │
│    • Authoritative pricing calculator & supply rate engine             │
│    • Hardware touch interfaces (Canvas signature, Camera capture)      │
│    • Cryptographically chained operational audit log                   │
│    • PWA offline engine & service worker                               │
├────────────────────────────────────────────────────────────────────────┤
│ 2. SHARED YORKSTEAD INFRASTRUCTURE                                     │
│    • Hybrid persistence adapter (Disk, Vercel KV, In-Memory)           │
│    • Audio synthesis engine (lib/sound.ts)                             │
│    • Session routing & cookie/header session isolation                 │
├────────────────────────────────────────────────────────────────────────┤
│ 3. CLIENT-SPECIFIC / DEMO SPECIFIC (Currently Hardcoded)              │
│    • Terminal address ("6030 Washington St, Denver, CO")              │
│    • Client name ("Denver Express Warehousing")                        │
│    • Fixed Bay IDs ("Bay 1" through "Bay 6")                           │
│    • Rate values in RATES ($18.50/pallet, $125.00/hr, etc.)            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Protected Areas ("CORE — DO NOT MODIFY WITHOUT NECESSITY")

The following files and subsystems represent core Yorkstead intellectual property and operational infrastructure. Modifying these without strict regression isolation introduces catastrophic breaking risk:

1. **`lib/storage.ts`**:
   - *Reason*: Contains the hybrid memory/disk/Vercel KV session router and the SHA-256 cryptographic chain logic. Any accidental schema mutation breaks audit trail verification and cross-device sync.
2. **`app/api/jobs/route.ts`**:
   - *Reason*: Authoritative backend endpoint validating payloads, assigning bays, and enforcing security constraints (5MB limit, payload sanitation).
3. **`lib/types.ts`**:
   - *Reason*: System-wide interface contracts (`ReworkJob`, `AuditLogEntry`). Changes here propagate type breaks across all pages.
4. **`components/PwaInstallPrompt.tsx`**:
   - *Reason*: Highly tuned progressive web app installation detection across iOS Safari standalone, Android Trusted Web Activity, and desktop Chromium.
5. **`lib/sound.ts`**:
   - *Reason*: Native Web Audio synthesizer designed to bypass browser autoplay security policies during live demonstrations.

---

## 8. Extension Strategy for Denver Express

To satisfy the non-negotiable rule of keeping Rework Flow untouched while delivering a deep client implementation for Denver Express, the following **isolated extension architecture** is established:

```
rework-flow/
├── lib/
│   └── client-config/
│       ├── types.ts                     # Multi-tenant client configuration interface (verified fields only)
│       ├── registry.ts                  # Client resolver (host/route based)
│       └── clients/
│           ├── default-rework-flow.ts   # Untouched standard Rework Flow config
│           └── denver-express.ts        # Denver Express verified client configuration, with optional operational and pricing configuration populated only after verification.
├── app/
│   └── denver-express/                  # Strictly namespaced client demo/prototype routes
│       ├── page.tsx                     # /denver-express overview
│       ├── freight-rework/page.tsx      # /denver-express/freight-rework
│       ├── cross-docking/page.tsx       # /denver-express/cross-docking
│       ├── transloading/page.tsx        # /denver-express/transloading
│       ├── rejected-load/page.tsx       # /denver-express/rejected-load
│       └── freight-rescue/page.tsx      # /denver-express/freight-rescue
├── components/
│   └── client/                          # Generic, reusable components configured by client data
│       ├── ClientHero.tsx               # Reusable branded client hero
│       ├── ServiceCard.tsx              # Reusable freight service card
│       ├── FreightIssueCalculator.tsx   # Generic weight/pallet calculation component
│       ├── CorridorGuide.tsx            # Generic corridor recovery guide (I-70 / I-25)
│       ├── FreightRescueForm.tsx        # Generic pre-arrival intake form
│       └── ClientPitchPanel.tsx         # Generic live presenter pitch guide
└── docs/
    └── denver-express/                  # Architecture audits, roadmaps, and pitch specifications
```

### Key Principles of Isolation:
1. **Zero Modification to Default Paths**: Visiting `/dock`, `/office`, or `/reserve` without a client route or config override must behave identically to the verified baseline product.
2. **Configuration Architecture & Verified Values Only**: The configuration architecture supports rates, operating hours, bay counts, SLA/turnaround expectations, terminal metadata, service limits, and customer-specific pricing. However, the Denver Express configuration must NOT populate these values unless they are verified. Unknown values remain optional/null and are never displayed as placeholders in public/demo UI.
3. **Generic Reusable Components**: Avoid Denver Express-specific React components unless the behavior is truly unique to Denver Express. Use generic components (`FreightIssueCalculator`, `CorridorGuide`, `FreightRescueForm`, `ClientHero`, `ServiceCard`, `ClientPitchPanel`) driven by configuration.
4. **Strict Route Namespacing**: All Denver Express prototype pages on `rework-flow.yorkstead.com` remain strictly under `/denver-express/...` (e.g. `/denver-express`, `/denver-express/freight-rework`, etc.). No Denver Express routes are placed at the domain root.
5. **Accidental SEO Prevention**: Prototype pages on `rework-flow.yorkstead.com` default to `noindex, nofollow` to ensure they never compete with `denverexpressco.com` or establish Yorkstead as the canonical source.
6. **No Implied Corporate Relationships**: Demo content and examples must never use recognizable corporate brand names (e.g. Walmart, King Soopers, Amazon, Costco) in a way that implies a business relationship unless explicitly verified. Use generic facility categories: grocery distribution center, retail distribution center, e-commerce fulfillment center, industrial receiver, foodservice receiver, and Colorado Port of Entry facility.

---

## 9. Regression Baseline Checklist

Prior to approving or merging any future Denver Express feature work, the following existing Rework Flow capabilities must be tested and verified intact:

- [ ] **Dual-Device Synchronization**: Submitting a job from `/dock` triggers the real-time visual alert and Web Audio chime on `/office` within 2 seconds.
- [ ] **Bay Allocation & 45-Min Hold**: Submitting `/reserve` allocates an open bay, marks it occupied on `/dock`, and sets a 45-minute countdown.
- [ ] **Click-to-Camera Capture**: Tapping any photo viewport on `/dock` launches the camera interface and displays verified Mountain Denver GPS overlays.
- [ ] **Touch Tally Counters**: Incrementing and decrementing supplies updates the live total amount authoritatively calculated by server rules.
- [ ] **Driver Digital Signature**: Capturing a signature on glass (both inline and full-screen landscape) embeds seamlessly into the dispatched certificate.
- [ ] **Evidence Certificate Printing**: Opening `/office` and clicking "View Certificate" generates an itemized, print-ready document with signed legal release.
- [ ] **QuickBooks Batch Export**: Generating QuickBooks export yields valid RFC 4180 CSV and QuickBooks IIF formats without formula injection vulnerabilities.
- [ ] **Tamper-Evident Audit Log**: Querying `/api/jobs?audit=true` returns uninterrupted SHA-256 cryptographically chained hash entries.
- [ ] **PWA Standalone Integrity**: App installs smoothly without duplicate prompts when operating in standalone mode.
