"use client";

import { useState, useEffect, useCallback } from "react";
import {
  WarehouseJob,
  FreightUnit,
  WarehouseLocation,
  YardTrailer,
  OperationalException,
  CustomerAccount,
  RateCardItem,
  CapitalAsset,
  WarehousePersonnel,
  JobStatus,
  ApprovalStatus,
  PalletMovement,
} from "./types";
import {
  INITIAL_JOBS,
  INITIAL_PALLETS,
  INITIAL_LOCATIONS,
  INITIAL_TRAILERS,
  INITIAL_EXCEPTIONS,
  INITIAL_CUSTOMERS,
  INITIAL_RATE_CARD,
  INITIAL_CAPITAL_ASSETS,
  INITIAL_PERSONNEL,
} from "./mock-warehouse-data";

const STORAGE_KEYS = {
  JOBS: "dx_ops_jobs_v2",
  PALLETS: "dx_ops_pallets_v2",
  LOCATIONS: "dx_ops_locations_v2",
  TRAILERS: "dx_ops_trailers_v2",
  EXCEPTIONS: "dx_ops_exceptions_v2",
  CUSTOMERS: "dx_ops_customers_v2",
  RATE_CARD: "dx_ops_rate_card_v2",
  ASSETS: "dx_ops_assets_v2",
  PERSONNEL: "dx_ops_personnel_v2",
};

export class WarehouseStore {
  private static memoryStore: Record<string, any> = {};

  static resetToDefaults(): void {
    this.memoryStore = {};
    if (typeof window !== "undefined") {
      try {
        Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
        window.dispatchEvent(new CustomEvent("dx_store_update", { detail: { key: "reset" } }));
      } catch {}
    }
  }

  private static getStored<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") {
      if (this.memoryStore[key] !== undefined) {
        return JSON.parse(JSON.stringify(this.memoryStore[key]));
      }
      return JSON.parse(JSON.stringify(fallback));
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : JSON.parse(JSON.stringify(fallback));
    } catch {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  private static setStored<T>(key: string, val: T): void {
    if (typeof window === "undefined") {
      this.memoryStore[key] = val;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(val));
      window.dispatchEvent(new CustomEvent("dx_store_update", { detail: { key } }));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }

  static getJobs(): WarehouseJob[] {
    return this.getStored(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  }

  static getJobById(id: string): WarehouseJob | undefined {
    return this.getJobs().find((j) => j.id === id);
  }

  static updateJob(id: string, updates: Partial<WarehouseJob>): WarehouseJob | null {
    const jobs = this.getJobs();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    const updated = { ...jobs[idx], ...updates, updatedAt: new Date().toISOString() };
    jobs[idx] = updated;
    this.setStored(STORAGE_KEYS.JOBS, jobs);
    return updated;
  }

  static updateJobStatus(id: string, status: JobStatus): WarehouseJob | null {
    const jobs = this.getJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) return null;

    const updates: Partial<WarehouseJob> = { status };
    if (status === "completed") {
      updates.completedAt = new Date().toISOString();
      updates.billingStatus = "invoiced";
    } else if (status === "ready_for_billing") {
      updates.billingStatus = "pending_review";
    }

    // Advance timeline
    const timeline = [...(job.timeline || [])];
    const stageMap: Record<JobStatus, string> = {
      requested: "Requested",
      scheduled: "Scheduled",
      arrived: "Arrived",
      waiting: "Waiting",
      dock_assigned: "Docked",
      in_progress: "Rework",
      awaiting_approval: "Awaiting Approval",
      staged: "Staging",
      ready_for_billing: "Billing Review",
      completed: "Completed",
    };
    const currentStageName = stageMap[status];

    timeline.forEach((t) => {
      if (t.stage.toLowerCase() === currentStageName.toLowerCase()) {
        t.completed = true;
        t.current = true;
        t.timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else {
        t.current = false;
      }
    });
    updates.timeline = timeline;

    return this.updateJob(id, updates);
  }

  static assignDockDoor(jobId: string, door: string | null): WarehouseJob | null {
    const job = this.getJobById(jobId);
    if (!job) return null;

    // Update job
    const updatedJob = this.updateJob(jobId, {
      dockDoor: door,
      status: door ? "dock_assigned" : job.status,
    });

    // Update corresponding trailer in yard
    const trailers = this.getTrailers();
    const trailerIdx = trailers.findIndex((t) => t.jobId === jobId || t.trailerNumber === job.trailer);
    if (trailerIdx !== -1) {
      trailers[trailerIdx].assignedDoor = door;
      trailers[trailerIdx].yardLocation = door ? door : "Spot Y-03";
      trailers[trailerIdx].loadStatus = door ? "at_door" : "waiting";
      this.setStored(STORAGE_KEYS.TRAILERS, trailers);
    }

    // Update location capacities & occupied states
    const locations = this.getLocations();
    locations.forEach((loc) => {
      if (loc.zone === "INBOUND" || loc.zone === "CROSS-DOCK" || loc.zone === "REWORK" || loc.zone === "OUTBOUND") {
        if (door && loc.name.includes(door)) {
          loc.status = "full";
        } else if (job.dockDoor && loc.name.includes(job.dockDoor)) {
          loc.status = "available";
        }
      }
    });
    this.setStored(STORAGE_KEYS.LOCATIONS, locations);

    return updatedJob;
  }

  static getPallets(): FreightUnit[] {
    return this.getStored(STORAGE_KEYS.PALLETS, INITIAL_PALLETS);
  }

  static getPalletById(id: string): FreightUnit | undefined {
    return this.getPallets().find((p) => p.id === id);
  }

  static updatePalletLocation(palletId: string, toLocation: string, operator: string, reason: string): FreightUnit | null {
    const pallets = this.getPallets();
    const idx = pallets.findIndex((p) => p.id === palletId);
    if (idx === -1) return null;
    const pallet = pallets[idx];
    const prevLocation = pallet.currentLocation;

    const movement: PalletMovement = {
      id: "MOV-" + Date.now().toString(),
      palletId,
      timestamp: new Date().toISOString(),
      fromLocation: prevLocation,
      toLocation,
      operator,
      reason,
    };
    pallet.currentLocation = toLocation;
    pallet.movementHistory = [movement, ...pallet.movementHistory];
    pallets[idx] = pallet;
    this.setStored(STORAGE_KEYS.PALLETS, pallets);

    // Update Warehouse Locations occupancy
    const locations = this.getLocations();
    locations.forEach((loc) => {
      if (loc.id === prevLocation || loc.name.includes(prevLocation)) {
        loc.currentPalletIds = loc.currentPalletIds.filter((id) => id !== palletId);
        if (loc.currentPalletIds.length === 0) loc.status = "available";
        else loc.status = "partial";
      }
      if (loc.id === toLocation || loc.name.includes(toLocation)) {
        if (!loc.currentPalletIds.includes(palletId)) {
          loc.currentPalletIds.push(palletId);
        }
        if (loc.currentPalletIds.length >= loc.capacityPallets) loc.status = "full";
        else loc.status = "partial";
      }
    });
    this.setStored(STORAGE_KEYS.LOCATIONS, locations);

    // Reconcile associated job locations
    const job = this.getJobById(pallet.jobId);
    if (job) {
      const activeLocs = new Set(job.warehouseLocations);
      activeLocs.add(toLocation);
      this.updateJob(job.id, { warehouseLocations: Array.from(activeLocs) });
    }

    return pallet;
  }

  static getLocations(): WarehouseLocation[] {
    return this.getStored(STORAGE_KEYS.LOCATIONS, INITIAL_LOCATIONS);
  }

  static getTrailers(): YardTrailer[] {
    return this.getStored(STORAGE_KEYS.TRAILERS, INITIAL_TRAILERS);
  }

  static getExceptions(): OperationalException[] {
    return this.getStored(STORAGE_KEYS.EXCEPTIONS, INITIAL_EXCEPTIONS);
  }

  static updateExceptionApproval(
    exceptionId: string,
    status: ApprovalStatus,
    approvedBy: string,
    approverContact?: string
  ): OperationalException | null {
    const exceptions = this.getExceptions();
    const idx = exceptions.findIndex((e) => e.id === exceptionId);
    if (idx === -1) return null;
    const ex = exceptions[idx];
    const prevStatus = ex.status;
    const nowIso = new Date().toISOString();

    ex.approvalStatus = status;
    ex.approvedBy = approvedBy;
    ex.approvedAt = nowIso;
    if (approverContact) ex.approverContact = approverContact;
    ex.approvalDecisionTime = nowIso;

    if (status === "approved") {
      ex.status = "approved";
      ex.auditHistory = [
        ...(ex.auditHistory || []),
        {
          id: "AUD-" + Date.now().toString() + "-APP",
          timestamp: nowIso,
          actor: approvedBy,
          action: "APPROVED",
          notes: `Change order approved for $${(ex.changeOrderAmount ?? ex.additionalCost).toFixed(2)}. Authorized by ${approvedBy}${approverContact ? ` (${approverContact})` : ""}.`,
        },
      ];
    } else if (status === "rejected") {
      ex.status = "declined";
      ex.auditHistory = [
        ...(ex.auditHistory || []),
        {
          id: "AUD-" + Date.now().toString() + "-DEC",
          timestamp: nowIso,
          actor: approvedBy,
          action: "DECLINED",
          notes: `Change order declined. Freight placed on hold pending shipper instructions.`,
        },
      ];
    }

    exceptions[idx] = ex;
    this.setStored(STORAGE_KEYS.EXCEPTIONS, exceptions);

    // Reconcile job commercial state
    const job = this.getJobById(ex.jobId);
    if (job) {
      const changeAmount = ex.changeOrderAmount ?? ex.additionalCost ?? 0;
      const jobUpdates: Partial<WarehouseJob> = {};

      if (status === "approved") {
        jobUpdates.approvedAdditions = changeAmount;
        jobUpdates.pendingAdditions = 0;
        // Commercial model rule:
        // Quoted / Base: job.quoteAmount ($450)
        // Authorized: Base + approved additions ($735)
        // Performed: Still $450 (base work only) until corrective work is completed!
        // Billable: Performed portion that is authorized ($450)
        jobUpdates.authorizedAmount = job.quoteAmount + changeAmount;
        jobUpdates.performedAmount = job.quoteAmount;
        jobUpdates.billableAmount = job.quoteAmount;
        jobUpdates.projectedAmount = job.quoteAmount + changeAmount;
        jobUpdates.billingReadinessStatus = "authorized_work_pending";

        // Advance timeline
        const timeline = [...(job.timeline || [])];
        timeline.forEach((t) => {
          if (t.stage.toLowerCase().includes("awaiting approval") || t.stage.toLowerCase().includes("hold")) {
            t.completed = true;
            t.current = false;
          }
          if (t.stage.toLowerCase().includes("rework")) {
            t.current = true;
          }
        });
        jobUpdates.timeline = timeline;

        if (job.status === "awaiting_approval") {
          jobUpdates.status = "in_progress";
        }
      } else if (status === "rejected") {
        jobUpdates.pendingAdditions = 0;
        jobUpdates.projectedAmount = job.billableAmount;
        jobUpdates.status = "waiting";
      }

      this.updateJob(job.id, jobUpdates);
    }

    return ex;
  }

  static requestCustomerApproval(exceptionId: string, requestedBy: string = "Dispatch"): OperationalException | null {
    const exceptions = this.getExceptions();
    const idx = exceptions.findIndex((e) => e.id === exceptionId);
    if (idx === -1) return null;
    const ex = exceptions[idx];
    const nowIso = new Date().toISOString();

    ex.status = "awaiting_customer";
    ex.approvalRequestedTime = nowIso;
    ex.auditHistory = [
      ...(ex.auditHistory || []),
      {
        id: "AUD-" + Date.now().toString() + "-REQ",
        timestamp: nowIso,
        actor: requestedBy,
        action: "APPROVAL_REQUESTED",
        notes: `Customer approval requested for change order $${(ex.changeOrderAmount ?? ex.additionalCost).toFixed(2)}. Digital work order link dispatched.`,
      },
    ];

    exceptions[idx] = ex;
    this.setStored(STORAGE_KEYS.EXCEPTIONS, exceptions);

    const job = this.getJobById(ex.jobId);
    if (job && job.status !== "awaiting_approval") {
      this.updateJobStatus(job.id, "awaiting_approval");
    }

    return ex;
  }

  static recordCustomerView(exceptionId: string, viewer: string = "Tom Bradley (Rocky Mountain Beverage Co)"): OperationalException | null {
    const exceptions = this.getExceptions();
    const idx = exceptions.findIndex((e) => e.id === exceptionId);
    if (idx === -1) return null;
    const ex = exceptions[idx];

    // Idempotent: don't record duplicate view events if already viewed
    if (ex.customerViewedTime) return ex;

    const nowIso = new Date().toISOString();
    ex.customerViewedTime = nowIso;
    ex.auditHistory = [
      ...(ex.auditHistory || []),
      {
        id: "AUD-" + Date.now().toString() + "-VIEW",
        timestamp: nowIso,
        actor: viewer,
        action: "VIEWED",
        notes: "Customer opened digital work authorization and inspected photographic defect evidence.",
      },
    ];

    exceptions[idx] = ex;
    this.setStored(STORAGE_KEYS.EXCEPTIONS, exceptions);
    return ex;
  }

  static approveChangeOrder(
    exceptionId: string,
    approverName: string = "Tom Bradley",
    approverContact: string = "tbradley@rockymountainbev.com"
  ): OperationalException | null {
    return this.updateExceptionApproval(exceptionId, "approved", approverName, approverContact);
  }

  static holdFreight(exceptionId: string, notes: string = "Customer requested hold pending packaging decision."): OperationalException | null {
    const exceptions = this.getExceptions();
    const idx = exceptions.findIndex((e) => e.id === exceptionId);
    if (idx === -1) return null;
    const ex = exceptions[idx];
    const nowIso = new Date().toISOString();

    ex.status = "declined";
    ex.resolutionState = "held";
    ex.approvalStatus = "rejected";
    ex.auditHistory = [
      ...(ex.auditHistory || []),
      {
        id: "AUD-" + Date.now().toString() + "-HOLD",
        timestamp: nowIso,
        actor: "Customer Portal",
        action: "HOLD_REQUESTED",
        notes,
      },
    ];

    exceptions[idx] = ex;
    this.setStored(STORAGE_KEYS.EXCEPTIONS, exceptions);

    const job = this.getJobById(ex.jobId);
    if (job) {
      this.updateJob(job.id, {
        status: "waiting",
        pendingAdditions: 0,
        projectedAmount: job.billableAmount,
      });
    }
    return ex;
  }

  static beginCorrectiveWork(exceptionId: string, operator: string = "Dave M. (FL-02)"): OperationalException | null {
    const exceptions = this.getExceptions();
    const idx = exceptions.findIndex((e) => e.id === exceptionId);
    if (idx === -1) return null;
    const ex = exceptions[idx];
    const nowIso = new Date().toISOString();

    ex.status = "in_progress";
    ex.auditHistory = [
      ...(ex.auditHistory || []),
      {
        id: "AUD-" + Date.now().toString() + "-BEG",
        timestamp: nowIso,
        actor: operator,
        action: "WORK_BEGUN",
        notes: `Corrective rebuild started in Bay RW-01. Breakdown, re-palletizing, and restrapping underway for pallet ${ex.palletId || "P08"}.`,
      },
    ];

    exceptions[idx] = ex;
    this.setStored(STORAGE_KEYS.EXCEPTIONS, exceptions);

    const job = this.getJobById(ex.jobId);
    if (job && job.status !== "in_progress") {
      this.updateJobStatus(job.id, "in_progress");
    }
    return ex;
  }

  static completeCorrectiveWork(
    exceptionId: string,
    operator: string = "Dave M. (FL-02)",
    targetLocation: string = "ST-03"
  ): OperationalException | null {
    const exceptions = this.getExceptions();
    const idx = exceptions.findIndex((e) => e.id === exceptionId);
    if (idx === -1) return null;
    const ex = exceptions[idx];
    const nowIso = new Date().toISOString();

    ex.status = "resolved";
    ex.resolvedAt = nowIso;
    ex.resolutionState = "completed";
    ex.auditHistory = [
      ...(ex.auditHistory || []),
      {
        id: "AUD-" + Date.now().toString() + "-COMP",
        timestamp: nowIso,
        actor: operator,
        action: "WORK_COMPLETED",
        notes: `Pallet ${ex.palletId || "P08"} restacked, banded with 4 heavy-duty poly straps, and shrink-wrapped. QA plumb check passed (<1° lean). Relocated to ${targetLocation}.`,
      },
    ];

    exceptions[idx] = ex;
    this.setStored(STORAGE_KEYS.EXCEPTIONS, exceptions);

    // Update pallet condition and location
    const palletId = ex.palletId || "DX-260918-037-P08";
    const pallets = this.getPallets();
    const pIdx = pallets.findIndex((p) => p.id === palletId);
    if (pIdx !== -1) {
      pallets[pIdx].condition = "restacked";
      pallets[pIdx].notes = "Restacked and plumbed. 4 poly bands + 80 gauge stretch wrap applied. QA inspection passed.";
      this.setStored(STORAGE_KEYS.PALLETS, pallets);
    }
    this.updatePalletLocation(palletId, targetLocation, operator, "Restack complete, staged for reload");

    // Advance job status & commercial reconciliation
    const job = this.getJobById(ex.jobId);
    if (job) {
      const activeExceptions = this.getExceptions().filter(
        (e) => e.jobId === job.id && e.id !== exceptionId && e.status !== "resolved"
      );
      const changeAmount = ex.changeOrderAmount ?? ex.additionalCost ?? 0;
      const newPerformed = (job.performedAmount ?? job.quoteAmount) + changeAmount;
      const newAuthorized = job.authorizedAmount ?? (job.quoteAmount + changeAmount);
      const newBillable = Math.min(newPerformed, newAuthorized);

      const jobUpdates: Partial<WarehouseJob> = {
        performedAmount: newPerformed,
        billableAmount: newBillable,
        billingReadinessStatus: "needs_review",
      };

      if (activeExceptions.length === 0) {
        jobUpdates.status = "staged";
      }

      this.updateJob(job.id, jobUpdates);
    }

    return ex;
  }

  static reviewAndApproveBilling(jobId: string, reviewer: string = "Sarah Lin (Operations Manager)"): WarehouseJob | null {
    const job = this.getJobById(jobId);
    if (!job) return null;

    const updated = this.updateJob(jobId, {
      billingReadinessStatus: "ready_to_invoice",
      billingStatus: "pending_review",
    });

    return updated;
  }

  static markJobInvoiced(jobId: string, invoiceRef?: string): WarehouseJob | null {
    const job = this.getJobById(jobId);
    if (!job) return null;

    const updated = this.updateJob(jobId, {
      billingReadinessStatus: "invoiced",
      billingStatus: "invoiced",
    });

    return updated;
  }

  static getCustomers(): CustomerAccount[] {
    return this.getStored(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  static getRateCard(): RateCardItem[] {
    return this.getStored(STORAGE_KEYS.RATE_CARD, INITIAL_RATE_CARD);
  }

  static getAssets(): CapitalAsset[] {
    return this.getStored(STORAGE_KEYS.ASSETS, INITIAL_CAPITAL_ASSETS);
  }

  static updateAsset(id: string, updates: Partial<CapitalAsset>): CapitalAsset | null {
    const assets = this.getAssets();
    const idx = assets.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    assets[idx] = { ...assets[idx], ...updates };
    this.setStored(STORAGE_KEYS.ASSETS, assets);
    return assets[idx];
  }

  static getPersonnel(): WarehousePersonnel[] {
    return this.getStored(STORAGE_KEYS.PERSONNEL, INITIAL_PERSONNEL);
  }

  static updatePersonnel(id: string, updates: Partial<WarehousePersonnel>): WarehousePersonnel | null {
    const personnel = this.getPersonnel();
    const idx = personnel.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    personnel[idx] = { ...personnel[idx], ...updates };
    this.setStored(STORAGE_KEYS.PERSONNEL, personnel);
    return personnel[idx];
  }

  static resetToSeed(): void {
    if (typeof window === "undefined") {
      this.memoryStore = {};
      return;
    }
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new CustomEvent("dx_store_update", { detail: { key: "all" } }));
  }
}

/** React hook for subscribing to store updates */
export function useWarehouseStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    window.addEventListener("dx_store_update", listener);
    return () => window.removeEventListener("dx_store_update", listener);
  }, []);

  return {
    jobs: WarehouseStore.getJobs(),
    pallets: WarehouseStore.getPallets(),
    locations: WarehouseStore.getLocations(),
    trailers: WarehouseStore.getTrailers(),
    exceptions: WarehouseStore.getExceptions(),
    customers: WarehouseStore.getCustomers(),
    rateCard: WarehouseStore.getRateCard(),
    assets: WarehouseStore.getAssets(),
    personnel: WarehouseStore.getPersonnel(),
    getJobById: useCallback(WarehouseStore.getJobById.bind(WarehouseStore), []),
    getPalletById: useCallback(WarehouseStore.getPalletById.bind(WarehouseStore), []),
    updateJobStatus: useCallback(WarehouseStore.updateJobStatus.bind(WarehouseStore), []),
    assignDockDoor: useCallback(WarehouseStore.assignDockDoor.bind(WarehouseStore), []),
    updatePalletLocation: useCallback(WarehouseStore.updatePalletLocation.bind(WarehouseStore), []),
    updateExceptionApproval: useCallback(WarehouseStore.updateExceptionApproval.bind(WarehouseStore), []),
    requestCustomerApproval: useCallback(WarehouseStore.requestCustomerApproval.bind(WarehouseStore), []),
    recordCustomerView: useCallback(WarehouseStore.recordCustomerView.bind(WarehouseStore), []),
    approveChangeOrder: useCallback(WarehouseStore.approveChangeOrder.bind(WarehouseStore), []),
    holdFreight: useCallback(WarehouseStore.holdFreight.bind(WarehouseStore), []),
    beginCorrectiveWork: useCallback(WarehouseStore.beginCorrectiveWork.bind(WarehouseStore), []),
    completeCorrectiveWork: useCallback(WarehouseStore.completeCorrectiveWork.bind(WarehouseStore), []),
    reviewAndApproveBilling: useCallback(WarehouseStore.reviewAndApproveBilling.bind(WarehouseStore), []),
    markJobInvoiced: useCallback(WarehouseStore.markJobInvoiced.bind(WarehouseStore), []),
    updateAsset: useCallback(WarehouseStore.updateAsset.bind(WarehouseStore), []),
    updatePersonnel: useCallback(WarehouseStore.updatePersonnel.bind(WarehouseStore), []),
    resetToSeed: useCallback(WarehouseStore.resetToSeed.bind(WarehouseStore), []),
  };
}
