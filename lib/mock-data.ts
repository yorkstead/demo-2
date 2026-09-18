import { ReworkJob } from "./types";

export const SAMPLE_BEFORE_1 = "/images/truck-cargo-shift-wide.jpg";
export const SAMPLE_BEFORE_2 = "/images/busted-pallet-runners-close.jpg";
export const SAMPLE_AFTER = "/images/reworked-pallet-after.jpg";

export const SAMPLE_SIGNATURE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120"><path d="M 30 70 Q 70 20 110 50 T 170 60 Q 210 30 250 80 T 320 45 Q 360 40 380 75" fill="none" stroke="%230f172a" stroke-width="4" stroke-linecap="round"/><text x="40" y="105" font-family="sans-serif" font-size="13" fill="%2364748b">Marcus Vance - OTR Driver</text></svg>`;


export const INITIAL_JOBS: ReworkJob[] = [
  {
    id: "RW-0841",
    trailerNumber: "KNIG-44102",
    carrierName: "Knight Transportation",
    driverName: "David Ross",
    driverPhone: "(303) 555-9812",
    bayNumber: "Bay 4",
    serviceType: "Shifted Pallets",
    status: "Billed",
    palletsCount: 0,
    wrapCount: 0,
    cornersCount: 0,
    laborHours: 1.5,
    scaleCheck: true,
    debrisFee: false,
    totalAmount: 222.5,
    beforePhotos: [SAMPLE_BEFORE_1, SAMPLE_BEFORE_2],
    afterPhotos: [SAMPLE_AFTER],
    signatureData: SAMPLE_SIGNATURE,
    defectTags: ["Demo cargo shift", "Pallet restacking"],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
  },
  {
    id: "RW-0840",
    trailerNumber: "TQLX-90184",
    carrierName: "TQL Brokered / Apex Line",
    driverName: "John Miller",
    driverPhone: "(720) 555-4311",
    bayNumber: "Bay 6",
    serviceType: "Floor Transload",
    status: "Billed",
    palletsCount: 26,
    wrapCount: 4,
    cornersCount: 0,
    laborHours: 3.0,
    scaleCheck: false,
    debrisFee: true,
    totalAmount: 1001.0,
    beforePhotos: [SAMPLE_BEFORE_1, SAMPLE_BEFORE_2],
    afterPhotos: [SAMPLE_AFTER],
    signatureData: SAMPLE_SIGNATURE,
    defectTags: ["Container Breakdown", "Floor to Pallet Transload"],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
  },
];
