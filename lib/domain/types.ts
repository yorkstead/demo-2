/**
 * Denver Express Warehouse Operations System — Shared Domain Model
 * Facility: ~60,000 sq. ft. Food-Grade Facility (6030 Washington St, Denver, CO)
 * Dock: 6 Active Bay Doors (Doors 1-6)
 */

export type JobStatus =
  | "inbound"
  | "waiting"
  | "dock_assigned"
  | "active_rework"
  | "staged"
  | "storage"
  | "awaiting_approval"
  | "ready_for_billing"
  | "completed";

export type JobPriority = "standard" | "expedited" | "critical_emergency";

export type ServiceType =
  | "Shifted Pallets"
  | "Axle Rebalance"
  | "Pallet Swap"
  | "Floor Transload"
  | "Cross-Dock"
  | "Short-Term Storage"
  | "Freight Rescue";

export type PalletCondition =
  | "good"
  | "crushed_cartons"
  | "leaning"
  | "broken_runner"
  | "wet_damaged"
  | "restacked"
  | "rebanded";

export type PalletStatus =
  | "received"
  | "in_rework"
  | "staged"
  | "stored"
  | "reloaded"
  | "quarantine";

export type LocationZone =
  | "rack_storage"
  | "floor_staging"
  | "rework_bay"
  | "dock_door"
  | "outbound_staging";

export type TrailerLoadStatus =
  | "loaded"
  | "unloading"
  | "empty"
  | "reloading"
  | "drop_trailer";

export type ExceptionType =
  | "leaning_pallet"
  | "crushed_cartons"
  | "wet_freight"
  | "missing_label"
  | "broken_seal"
  | "count_discrepancy"
  | "rejected_load"
  | "approval_required";

export type ExceptionSeverity = "low" | "medium" | "high" | "critical";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "waived";

export interface PalletMovement {
  id: string;
  palletId: string;
  timestamp: string;
  fromLocation: string;
  toLocation: string;
  operator: string;
  reason: string;
}

export interface FreightUnit {
  id: string; // e.g. "DX-260918-037-P12"
  jobId: string;
  palletNumber: number;
  currentLocation: string; // e.g. "RW-01", "A-02", "D-02"
  weightLbs: number;
  dimensions: {
    lengthIn: number;
    widthIn: number;
    heightIn: number;
  };
  condition: PalletCondition;
  status: PalletStatus;
  skuDescription?: string;
  cartonCount?: number;
  photos: string[];
  movementHistory: PalletMovement[];
}

export interface WarehouseLocation {
  id: string; // e.g. "A-01", "RW-01", "ST-04", "D-02"
  name: string;
  zone: LocationZone;
  capacityPallets: number;
  currentPalletIds: string[];
  temperature: "ambient" | "climate_controlled";
  status: "available" | "partial" | "full" | "maintenance";
  notes?: string;
}

export interface YardTrailer {
  trailerNumber: string; // e.g. "KNIG-44102"
  carrier: string;
  carrierScac?: string;
  driverName: string;
  driverPhone: string;
  arrival: string; // ISO date
  appointment?: string;
  yardLocation: string; // "Spot Y-04", "Dock 2", etc.
  assignedDoor: string | null; // "Door 1" .. "Door 6"
  loadStatus: TrailerLoadStatus;
  sealNumber: string;
  sealIntact: boolean;
  departureStatus: "on_site" | "dispatched" | "departed";
  detentionStart: string; // ISO date
  billOfLading: string;
}

export interface OperationalException {
  id: string; // e.g. "EX-1049"
  jobId: string;
  palletId?: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  title: string;
  description: string;
  reportedAt: string;
  reportedBy: string;
  customerApprovalRequired: boolean;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  additionalCost?: number;
  photos: string[];
  resolutionNotes?: string;
}

export interface WarehouseJob {
  id: string; // e.g. "DX-260918-037"
  service: ServiceType;
  customer: {
    id: string;
    name: string;
    accountNumber: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };
  carrier: {
    name: string;
    scac?: string;
    contactPhone?: string;
  };
  driver: {
    name: string;
    phone: string;
    cdlLast4?: string;
  };
  trailer: string;
  bolNumber: string;
  poNumber?: string;
  status: JobStatus;
  priority: JobPriority;
  arrival: string;
  appointment?: string;
  dockDoor: string | null; // "Door 1" .. "Door 6"
  warehouseLocations: string[]; // e.g. ["RW-01", "ST-02"]
  palletCount: number;
  pallets: string[]; // FreightUnit IDs
  labor: {
    hoursLogged: number;
    assignedTech: string;
    hourlyRate: number;
  };
  equipment: string[]; // e.g. ["FL-01 (Yale)", "SR-02"]
  quoteAmount: number;
  billableAmount: number;
  billingStatus: "unbilled" | "pending_review" | "invoiced" | "paid";
  notes: string;
  photos: {
    before: string[];
    after: string[];
  };
  documents: {
    bolUrl?: string;
    rateConUrl?: string;
    signedCertUrl?: string;
    hasSignature: boolean;
  };
  exceptions: string[]; // Exception IDs
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CustomerAccount {
  id: string;
  name: string;
  accountNumber: string;
  billingTier: "standard" | "preferred" | "enterprise";
  paymentTerms: "Net 15" | "Net 30" | "Credit Card / Pre-pay";
  activeJobsCount: number;
  totalYtdSpend: number;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  approvalPolicy: "auto_under_500" | "always_require" | "trustee_waived";
}

export interface RateCardItem {
  id: string;
  category: "Rework Labor" | "Materials" | "Cross-Dock / Transfer" | "Storage" | "Accessorial";
  code: string;
  description: string;
  unit: "per_hour" | "per_pallet" | "per_roll" | "flat_fee" | "per_pallet_per_day";
  standardRate: number;
  rushMultiplier: number;
  notes?: string;
}
