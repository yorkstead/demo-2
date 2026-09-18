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
  JOBS: "dx_ops_jobs_v1",
  PALLETS: "dx_ops_pallets_v1",
  LOCATIONS: "dx_ops_locations_v1",
  TRAILERS: "dx_ops_trailers_v1",
  EXCEPTIONS: "dx_ops_exceptions_v1",
  CUSTOMERS: "dx_ops_customers_v1",
  RATE_CARD: "dx_ops_rate_card_v1",
};

export class WarehouseStore {
  private static getStored<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private static setStored<T>(key: string, val: T): void {
    if (typeof window === "undefined") return;
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
    const updates: Partial<WarehouseJob> = { status };
    if (status === "completed") {
      updates.completedAt = new Date().toISOString();
    }
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

    // Update corresponding trailer if present
    const trailers = this.getTrailers();
    const trailerIdx = trailers.findIndex((t) => t.trailerNumber === job.trailer);
    if (trailerIdx !== -1) {
      trailers[trailerIdx].assignedDoor = door;
      trailers[trailerIdx].yardLocation = door ? door : "Yard Staging";
      if (door) trailers[trailerIdx].loadStatus = "unloading";
      this.setStored(STORAGE_KEYS.TRAILERS, trailers);
    }

    // Update location status
    const locations = this.getLocations();
    locations.forEach((loc) => {
      if (loc.zone === "dock_door") {
        if (loc.name.includes(door || "___NEVER___")) {
          loc.status = "full";
        } else if (door && loc.name.includes(job.dockDoor || "___NEVER___")) {
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

  static updatePalletLocation(palletId: string, toLocation: string, operator: string, reason: string): FreightUnit | null {
    const pallets = this.getPallets();
    const idx = pallets.findIndex((p) => p.id === palletId);
    if (idx === -1) return null;
    const pallet = pallets[idx];
    const movement = {
      id: "MOV-" + Date.now().toString(),
      palletId,
      timestamp: new Date().toISOString(),
      fromLocation: pallet.currentLocation,
      toLocation,
      operator,
      reason,
    };
    pallet.currentLocation = toLocation;
    pallet.movementHistory = [movement, ...pallet.movementHistory];
    pallets[idx] = pallet;
    this.setStored(STORAGE_KEYS.PALLETS, pallets);
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

    // If approved, advance job status if it was awaiting approval
    if (status === "approved") {
      const job = this.getJobById(ex.jobId);
      if (job && job.status === "awaiting_approval") {
        this.updateJobStatus(job.id, "active_rework");
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
    updateJobStatus: useCallback(WarehouseStore.updateJobStatus.bind(WarehouseStore), []),
    assignDockDoor: useCallback(WarehouseStore.assignDockDoor.bind(WarehouseStore), []),
    updatePalletLocation: useCallback(WarehouseStore.updatePalletLocation.bind(WarehouseStore), []),
    updateExceptionApproval: useCallback(WarehouseStore.updateExceptionApproval.bind(WarehouseStore), []),
    resetToSeed: useCallback(WarehouseStore.resetToSeed.bind(WarehouseStore), []),
  };
}
