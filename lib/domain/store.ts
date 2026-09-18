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
} from "./mock-warehouse-data";

const STORAGE_KEYS = {
  JOBS: "dx_ops_jobs_v2",
  PALLETS: "dx_ops_pallets_v2",
  LOCATIONS: "dx_ops_locations_v2",
  TRAILERS: "dx_ops_trailers_v2",
  EXCEPTIONS: "dx_ops_exceptions_v2",
  CUSTOMERS: "dx_ops_customers_v2",
  RATE_CARD: "dx_ops_rate_card_v2",
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
      return this.memoryStore[key] !== undefined ? this.memoryStore[key] : fallback;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
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

  static updateExceptionApproval(exceptionId: string, status: ApprovalStatus, approvedBy: string): OperationalException | null {
    const exceptions = this.getExceptions();
    const idx = exceptions.findIndex((e) => e.id === exceptionId);
    if (idx === -1) return null;
    const ex = exceptions[idx];
    ex.approvalStatus = status;
    ex.approvedBy = approvedBy;
    ex.approvedAt = new Date().toISOString();
    exceptions[idx] = ex;
    this.setStored(STORAGE_KEYS.EXCEPTIONS, exceptions);

    // If approved, advance job status from awaiting_approval to in_progress and complete timeline stage
    if (status === "approved") {
      const job = this.getJobById(ex.jobId);
      if (job) {
        const timeline = [...(job.timeline || [])];
        timeline.forEach((t) => {
          if (t.stage.toLowerCase().includes("awaiting approval") || t.stage.toLowerCase().includes("hold")) {
            t.completed = true;
            t.current = false;
          }
        });
        this.updateJob(job.id, { timeline });
        if (job.status === "awaiting_approval") {
          this.updateJobStatus(job.id, "in_progress");
        }
      }
    }
    return ex;
  }

  static getCustomers(): CustomerAccount[] {
    return this.getStored(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  static getRateCard(): RateCardItem[] {
    return this.getStored(STORAGE_KEYS.RATE_CARD, INITIAL_RATE_CARD);
  }

  static resetToSeed(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.JOBS);
    localStorage.removeItem(STORAGE_KEYS.PALLETS);
    localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.TRAILERS);
    localStorage.removeItem(STORAGE_KEYS.EXCEPTIONS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.RATE_CARD);
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
    getJobById: useCallback(WarehouseStore.getJobById.bind(WarehouseStore), []),
    getPalletById: useCallback(WarehouseStore.getPalletById.bind(WarehouseStore), []),
    updateJobStatus: useCallback(WarehouseStore.updateJobStatus.bind(WarehouseStore), []),
    assignDockDoor: useCallback(WarehouseStore.assignDockDoor.bind(WarehouseStore), []),
    updatePalletLocation: useCallback(WarehouseStore.updatePalletLocation.bind(WarehouseStore), []),
    updateExceptionApproval: useCallback(WarehouseStore.updateExceptionApproval.bind(WarehouseStore), []),
    resetToSeed: useCallback(WarehouseStore.resetToSeed.bind(WarehouseStore), []),
  };
}
