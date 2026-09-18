/**
 * Denver Express Warehouse Operations System — Shared Domain Model
 * Facility: ~60,000 sq. ft. Food-Grade Facility (6030 Washington St, Suite 130, Denver, CO)
 * Note: Facility layout, doors, and racks are illustrative demo configurations.
 */

export type JobStatus =
  | "requested"
  | "scheduled"
  | "arrived"
  | "waiting"
  | "dock_assigned"
  | "in_progress"
  | "awaiting_approval"
  | "staged"
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
  | "INBOUND"
  | "STAGING"
  | "CROSS-DOCK"
  | "REWORK"
  | "STORAGE"
  | "HOLD"
  | "OUTBOUND";

export type TrailerLoadStatus =
  | "expected"
  | "arrived"
  | "waiting"
  | "at_door"
  | "staged_ready"
  | "departed";

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

export type ExceptionLifecycleStatus =
  | "new"
  | "investigating"
  | "awaiting_customer"
  | "approved"
  | "in_progress"
  | "resolved"
  | "declined";

export interface ExceptionAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
  notes?: string;
}

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
  id: string; // e.g. "DX-260918-037-P01"
  jobId: string;
  palletNumber: number;
  currentLocation: string; // e.g. "RW-01", "A-02", "D-03"
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
  notes?: string;
}

export interface WarehouseLocation {
  id: string; // e.g. "D-01", "RW-01", "ST-04", "A-01"
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
  jobId: string;
  driverName: string;
  driverPhone: string;
  arrival: string; // ISO date
  appointment?: string;
  yardLocation: string; // "Spot Y-04", "Door 3", etc.
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
  palletId?: string; // e.g. "DX-260918-037-P08"
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionLifecycleStatus;
  title: string;
  description: string;
  discoveredTime: string;
  discoveredBy: string;
  location: string;
  photos: string[];
  recommendedAction: string;
  originalScopeCoverage: string;
  changeOrderAmount: number;
  approvalState: ApprovalStatus;
  approvalRequestedTime?: string;
  customerViewedTime?: string;
  approvedAt?: string;
  approvalDecisionTime?: string;
  approvedBy?: string;
  approverContact?: string;
  approverDecision?: "approved" | "held" | "rejected";
  resolutionState: "pending" | "in_progress" | "resolved" | "completed" | "held";
  resolvedTime?: string;
  resolvedAt?: string;
  auditHistory: ExceptionAuditEntry[];

  // Compatibility fields
  customerApprovalRequired: boolean;
  approvalStatus: ApprovalStatus;
  additionalCost?: number;
  reportedAt: string;
  reportedBy: string;
  resolutionNotes?: string;
}

export interface JobTimelineEvent {
  id: string;
  stage: string;
  timestamp: string;
  label: string;
  detail: string;
  completed: boolean;
  current?: boolean;
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
  warehouseLocations: string[]; // e.g. ["D-03", "RW-01"]
  palletCount: number;
  pallets: string[]; // FreightUnit IDs
  labor: {
    hoursLogged: number;
    assignedTech: string;
    hourlyRate: number;
  };
  equipment: string[]; // e.g. ["FL-01 (Yale)", "SR-01"]
  materials: {
    palletsUsed: number;
    palletType: string;
    wrapRollsUsed: number;
    cornerBoardsUsed: number;
  };
  quoteAmount: number; // Base authorized work
  pendingAdditions?: number; // Pending change orders awaiting customer approval
  approvedAdditions?: number; // Customer authorized additions
  billableAmount: number; // Authorized billable total (quoteAmount + approvedAdditions)
  projectedAmount?: number; // Projected total if pending approved (quoteAmount + pendingAdditions + approvedAdditions)
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
  timeline: JobTimelineEvent[];
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
