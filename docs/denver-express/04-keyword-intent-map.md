# Denver Express Search Intent Architecture & Keyword Mapping

**Document Version:** 1.1.0 (CTA Normalization & Geographic Isolation)  
**Target Client:** Denver Express Warehousing & Cross-Docking (6030 Washington St, Denver, CO)  
**System Module:** SEO & Intent Routing Infrastructure  
**Governing SEO Philosophy:** Group queries by **Search Intent Clusters** onto strong authoritative routes. Never generate low-value 1:1 keyword pages. Eliminate cannibalization, protect production canonicals, and use durable user-action CTAs.

---

## 1. Intent Clustering Strategy

Search engines evaluate topical depth and operational capability rather than superficial keyword density. The 23 priority queries for Denver Express distribute naturally into **6 Core Authoritative Landing Pages**, with 2 auxiliary support pages.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INTENT-TO-ROUTE ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. /denver-express/cross-docking                                            │
│    • cross dock Denver               • Denver cross dock                    │
│    • cross docking Denver            • cross dock near I-70 Denver          │
│    • cross dock near I-25 Denver     • cross dock warehouse Denver CO       │
│    • missed delivery cross dock Denver                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. /denver-express/freight-rework                                           │
│    • freight rework Denver           • rework warehouse Denver              │
│    • truck load rework Denver        • same day freight rework Denver       │
│    • emergency freight rework Denver                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. /denver-express/shifted-load                                             │
│    • load shift repair Denver        • shifted pallet repair Denver         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. /denver-express/pallet-restacking                                        │
│    • freight restack Denver          • pallet restacking Denver             │
│    • damaged pallet rework Denver                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. /denver-express/repalletizing                                            │
│    • repalletizing Denver            • freight repalletizing Denver         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. /denver-express/rejected-load                                            │
│    • rejected load Denver            • rework rejected load Denver          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. Auxiliary: /denver-express/transloading (transloading Denver)            │
│ 8. Auxiliary: /denver-express/short-term-staging (short term freight storage)│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Priority Keyword Classification Matrix (23 Target Searches)

### Legend:
- **Commercial Intent:**
  * **Transactional:** Driver or broker ready to take immediate action.
  * **Commercial Investigation:** Comparing providers, evaluating location/capabilities.
- **Urgency:**
  * **Emergency (0–2 hr):** Driver stuck, trailer leaning, or rejected at dock door right now.
  * **Same-Day (2–8 hr):** Needing turnaround before afternoon cutoffs or next morning delivery.
  * **Scheduled (>24 hr):** Planned cross-dock or transload transfer.
- **Durable User-Action CTAs:** Standardized across acquisition funnels:
  * `Request Freight Rework`
  * `Call for Urgent Freight Help`
  * `Check Cross-Dock Availability`
  * `Request Repalletizing`
  * `Request Transloading`
  * `Request Short-Term Staging`
  * `Start Freight Rescue`

---

### Tier 1 Priority Searches (High Volume / Immediate Action)

| # | Exact Search Phrase | Commercial Intent | Urgency | Likely Service | Proposed Authoritative Route | Route Exists? | Shared Page Strategy | Cannibalization Risk | Normalized Durable CTA |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `freight rework Denver` | Commercial / Transactional | Emergency / Same-Day | `freight-rework` | `/denver-express/freight-rework` | Planned (Phase B) | Primary hub for all generic rework inquiries. | High if split into sub-pages | `Request Freight Rework` / `Call for Urgent Freight Help` |
| **2** | `rework warehouse Denver` | Commercial Investigation | Same-Day | `freight-rework` | `/denver-express/freight-rework` | Planned (Phase B) | Shares page with #1; targets warehouse facility intent. | Moderate (absorb into #1) | `Request Freight Rework` |
| **3** | `cross dock Denver` | Transactional | Same-Day / Scheduled | `cross-docking` | `/denver-express/cross-docking` | Planned (Phase B) | Core canonical pillar for Denver cross-docking. | High if fragmented | `Check Cross-Dock Availability` |
| **4** | `cross docking Denver` | Commercial Investigation | Scheduled | `cross-docking` | `/denver-express/cross-docking` | Planned (Phase B) | Shares canonical with #3 (stem variation). | High (identical intent to #3) | `Check Cross-Dock Availability` |
| **5** | `Denver cross dock` | Transactional | Same-Day | `cross-docking` | `/denver-express/cross-docking` | Planned (Phase B) | Shares canonical with #3 (word order variation). | High (identical intent to #3) | `Check Cross-Dock Availability` |
| **6** | `freight restack Denver` | Transactional | Emergency | `pallet-restacking` | `/denver-express/pallet-restacking` | Planned (Phase B) | Dedicated to physical pallet restacking and rebuilding. | Moderate (distinct physical task) | `Request Freight Rework` |
| **7** | `repalletizing Denver` | Transactional | Emergency / Same-Day | `repalletizing` | `/denver-express/repalletizing` | Planned (Phase B) | Dedicated to damaged/rejected pallet swaps onto sound pallets. | Low (specific pallet replacement) | `Request Repalletizing` |
| **8** | `rejected load Denver` | Transactional | Emergency (Immediate) | `rejected-load-recovery` | `/denver-express/rejected-load` | Planned (Phase B) | Distress funnel for DC receiver rejections. | Moderate | `Start Freight Rescue` |
| **9** | `load shift repair Denver` | Transactional | Emergency (Immediate) | `shifted-load-recovery` | `/denver-express/shifted-load` | Planned (Phase B) | Dedicated triage for door-jammed & transit leans. | Low (distinct mechanical crisis) | `Call for Urgent Freight Help` |
| **10**| `transloading Denver` | Commercial / Transactional | Scheduled / Same-Day | `transloading` | `/denver-express/transloading` | Planned (Phase B) | Dedicated to container-to-van and flatbed transloading. | Low (distinct equipment type) | `Request Transloading` |

---

### Tier 2 Priority Searches (Corridor & Problem-Specific Long-Tail)

| # | Exact Search Phrase | Commercial Intent | Urgency | Likely Service | Proposed Authoritative Route | Route Exists? | Shared Page Strategy | Cannibalization Risk | Normalized Durable CTA |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **11**| `rework rejected load Denver` | Transactional | Emergency | `rejected-load-recovery` | `/denver-express/rejected-load` | Planned (Phase B) | Secondary keyword targeted on the #8 rejected load page. | High if built as separate page | `Start Freight Rescue` |
| **12**| `pallet restacking Denver` | Transactional | Emergency / Same-Day | `pallet-restacking` | `/denver-express/pallet-restacking` | Planned (Phase B) | Directly maps to #6 restacking pillar. | High if split from #6 | `Request Freight Rework` |
| **13**| `shifted pallet repair Denver` | Transactional | Emergency | `shifted-load-recovery` | `/denver-express/shifted-load` | Planned (Phase B) | Handled within #9 shifted load recovery guide. | High if split from #9 | `Start Freight Rescue` |
| **14**| `freight repalletizing Denver` | Commercial Investigation | Same-Day | `repalletizing` | `/denver-express/repalletizing` | Planned (Phase B) | Maps directly to #7 repalletizing page. | High if split from #7 | `Request Repalletizing` |
| **15**| `cross dock near I-70 Denver` | Transactional / Local | Emergency / Same-Day | `cross-docking` | `/denver-express/cross-docking` | Planned (Phase B) | Handled via corridor section on the main cross-dock page. | High (do NOT create separate page) | `Check Cross-Dock Availability` |
| **16**| `cross dock near I-25 Denver` | Transactional / Local | Emergency / Same-Day | `cross-docking` | `/denver-express/cross-docking` | Planned (Phase B) | Handled via corridor section on the main cross-dock page. | High (do NOT create separate page) | `Check Cross-Dock Availability` |
| **17**| `same day freight rework Denver`| Transactional | Same-Day (High Value) | `freight-rework` | `/denver-express/freight-rework` | Planned (Phase B) | Section on #1 emphasizing Mon–Fri same-day turnaround. | High if separate page | `Request Freight Rework` |
| **18**| `emergency freight rework Denver`| Transactional | Emergency | `freight-rework` | `/denver-express/freight-rework` | Planned (Phase B) | Urgent hero banner on #1; emphasizes fast phone call. | High if separate page | `Call for Urgent Freight Help` |
| **19**| `missed delivery cross dock Denver`| Transactional | Emergency / Same-Day | `cross-docking` | `/denver-express/cross-docking` | Planned (Phase B) | Situation module on #3 cross-dock page + staging link. | Moderate | `Check Cross-Dock Availability` |
| **20**| `short term freight storage Denver`| Commercial Investigation | Scheduled | `short-term-staging` | `/denver-express/short-term-staging`| Planned (Phase B) | Dedicated to secure holding / warehousing. | Low (distinct warehousing need) | `Request Short-Term Staging` |
| **21**| `truck load rework Denver` | Commercial Investigation | Same-Day | `freight-rework` | `/denver-express/freight-rework` | Planned (Phase B) | Sub-section on #1 targeting full 53' semi-trailer loads. | High if separate page | `Request Freight Rework` |
| **22**| `damaged pallet rework Denver` | Transactional | Emergency | `pallet-restacking` | `/denver-express/pallet-restacking` | Planned (Phase B) | Sub-section on #6 addressing damaged baseboard repair. | High if separate page | `Request Repalletizing` |
| **23**| `cross dock warehouse Denver CO`| Commercial Investigation | Scheduled | `cross-docking` | `/denver-express/cross-docking` | Planned (Phase B) | Geographic variant of #3 cross-docking pillar. | High (identical intent to #3) | `Check Cross-Dock Availability` |

---

## 3. Cannibalization Defense & Shared-Page Strategy

### Why One Strong Page Beats Multiple Thin Pages
Creating 23 individual URLs for 23 keyword permutations creates **keyword cannibalization**, dilutes domain authority, and risks Google quality penalties.

Instead, the architecture consolidates these 23 queries into **6 Search Intent Pillars**:

1. **The Cross-Docking Pillar (`/denver-express/cross-docking`):**
   - Targets 7 queries: #3, #4, #5, #15, #16, #19, #23.
   - Consumes corridor context off I-25 Exit 215 and I-70 Washington St dynamically from configuration.
2. **The Freight Rework Pillar (`/denver-express/freight-rework`):**
   - Targets 5 queries: #1, #2, #17, #18, #21.
   - Highlights same-day availability (#17) and urgent call assistance (#18).
3. **The Shifted Load Pillar (`/denver-express/shifted-load`):**
   - Targets 2 queries: #9, #13.
   - Focuses specifically on trailer-door leaning cargo, wall leans, and highway shift uprighting.
4. **The Pallet Restacking Pillar (`/denver-express/pallet-restacking`):**
   - Targets 3 queries: #6, #12, #22.
   - Focuses on unstable tiers, height/cube re-spec, and carton restacking.
5. **The Repalletizing Pillar (`/denver-express/repalletizing`):**
   - Targets 2 queries: #7, #14.
   - Focuses on broken pallet replacement and transferring cargo onto sound standard pallets (does not require or assume specific commercial pallet pooling brands).
6. **The Rejected Load Recovery Pillar (`/denver-express/rejected-load`):**
   - Targets 2 queries: #8, #11.
   - Focuses on DC receiver rejection notes, refusal reasons, and correcting loads for re-delivery.

---

## 4. Facility Characteristics & Evidence Standards

Denver Express facility specifications strictly reflect verified evidence:
- **Facility Type:** `climate-controlled (no cold storage)`
- **Footprint:** `60,000+ sq ft`, `30ft ceiling height`
- **Receiving Doors:** `6 dock-high doors`
- **Operating Schedule:** Standard hours Mon–Fri 8:00 AM – 4:00 PM; receiving cutoff 3:30 PM; after-hours/weekend access strictly by appointment (a fee may apply).

---

## 5. Robots & Canonical Protection (Anti-Competition Guardrail)

1. **Yorkstead Staging Protection:**
   - All prototype routes under `/denver-express/*` hosted on `rework-flow.yorkstead.com` render:
     ```html
     <meta name="robots" content="noindex, nofollow" />
     ```
   - `app/robots.ts` explicitly includes:
     ```ts
     disallow: ["/denver-express/"]
     ```
   - `app/sitemap.ts` omits all `/denver-express/*` URLs.
2. **Production Deployment (Phase E):**
   - When deployed to `denverexpressco.com`, the canonical URL structure will be:
     * `https://denverexpressco.com/rework`
     * `https://denverexpressco.com/cross-docking`
     * `https://denverexpressco.com/transloading`
   - This ensures Yorkstead software **never competes with or cannibalizes** Denver Express's live domain.
