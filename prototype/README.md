# ReworkFlow Interactive Demo

**Client Prototype:** Denver Express Warehousing & Cross-Docking (6030 Washington St, Denver, CO)  
**Built By:** Yorkstead Systems  

---

## What This Demo Demonstrates

This working operational prototype showcases the complete end-to-end workflow of **ReworkFlow**:

1. **Step 1: Rapid Intake**
   * High-contrast tablet UI for dock foremen.
   * Selection of service type (*Shifted Pallets, Axle Rebalance, Pallet Swap, Floor Transload*).
   * Trailer #, Carrier name, Assigned Dock Bay (1 to 6), and Driver phone.
2. **Step 2: "Before" Damage Photos**
   * Multi-shot photo inspection with automatic GPS and timestamp tagging.
   * Quick-tap defect tags (*Mountain shift, broken baseboards, rejected cargo*).
   * Built-in realistic sample photos ready to test without manual camera uploads.
3. **Step 3: Materials & Labor Quick-Tally**
   * Calculator-style `+` / `-` buttons designed for work gloves.
   * Auto-calculates GMA Pallets, Stretch Wrap, Corner Boards, Forklift Hours, Scale Tickets, and Debris fees.
   * Live updating total.
4. **Step 4: "After" Proof & Glass Signature**
   * Proof shot of clean, wrapped, road-ready pallets.
   * Interactive HTML5 signature pad for driver finger sign-off.
   * Driver acceptance disclaimer.
5. **Instant Output: The Rework Certificate Modal**
   * Branded Denver Express header with DOT/MC # and Washington St address.
   * Side-by-side Before/After comparison grid.
   * Complete itemized invoice breakdown.
   * Embedded driver signature and timestamp.
   * Native "Print / Save PDF" button.
6. **Office Billing Board**
   * Switch views in the top bar to inspect the manager dashboard.
   * Live bay occupancy metrics, daily revenue total, and dispute rate.
   * One-click "Export QuickBooks CSV" button.

---

## How to Run the Demo

### Method 1: Instant Local Browser (Zero Setup)
Simply open `demos/reworkflow/index.html` in Chrome, Edge, Safari, or on an iPad. It runs completely standalone with zero dependencies.

### Method 2: Via Bun Local Server
```bash
cd demos/reworkflow
bun run dev
```
Open **http://localhost:3005** in your browser.
