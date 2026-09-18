import { describe, it, expect, beforeEach } from "bun:test";
import { WarehouseStore } from "../lib/domain/store";

describe("Warehouse Operations Store & Flagship Scenario", () => {
  beforeEach(() => {
    WarehouseStore.resetToDefaults();
  });

  it("loads the flagship scenario DX-260918-037 with full data fidelity", () => {
    const flagship = WarehouseStore.getJobById("DX-260918-037");

    expect(flagship).toBeDefined();
    expect(flagship?.customer.name).toBe("Rocky Mountain Beverage Co");
    expect(flagship?.trailer).toBe("RMB-5012");
    expect(flagship?.dockDoor).toBe("Door 3");
    expect(flagship?.palletCount).toBe(6);
    expect(flagship?.service).toBe("Freight Rescue");
    expect(flagship?.quoteAmount).toBe(450.0);
    expect(flagship?.billableAmount).toBe(735.0);

    // Verify trailer is at Door 3
    const trailer = WarehouseStore.getTrailers().find((t) => t.trailerNumber === "RMB-5012");
    expect(trailer).toBeDefined();
    expect(trailer?.assignedDoor).toBe("Door 3");
    expect(trailer?.loadStatus).toBe("at_door");

    // Verify 6 pallets exist
    const flagshipPallets = WarehouseStore.getPallets().filter((p) => p.jobId === "DX-260918-037");
    expect(flagshipPallets.length).toBe(6);
    expect(flagshipPallets.map((p) => p.id)).toEqual([
      "DX-260918-037-P01",
      "DX-260918-037-P02",
      "DX-260918-037-P03",
      "DX-260918-037-P04",
      "DX-260918-037-P05",
      "DX-260918-037-P06",
    ]);

    // Verify exception EX-1049
    const ex = WarehouseStore.getExceptions().find((e) => e.id === "EX-1049");
    expect(ex).toBeDefined();
    expect(ex?.jobId).toBe("DX-260918-037");
    expect(ex?.severity).toBe("critical");
    expect(ex?.additionalCost).toBe(285.0);
  });

  it("reconciles assignDockDoor across job, trailer, and location occupancy", () => {
    // Assign waiting trailer KNIG-44102 (job DX-260918-031) to Door 6
    const updatedJob = WarehouseStore.assignDockDoor("DX-260918-031", "Door 6");
    expect(updatedJob?.dockDoor).toBe("Door 6");
    expect(updatedJob?.status).toBe("dock_assigned");

    const trailer = WarehouseStore.getTrailers().find((t) => t.trailerNumber === "KNIG-44102");
    expect(trailer?.assignedDoor).toBe("Door 6");
    expect(trailer?.yardLocation).toBe("Door 6");
    expect(trailer?.loadStatus).toBe("at_door");

    const door6 = WarehouseStore.getLocations().find((l) => l.name === "Dock Door 6");
    expect(door6?.status).toBe("full");
  });

  it("authorizes exception quote addition and advances job state", () => {
    const updatedEx = WarehouseStore.updateExceptionApproval("EX-1049", "approved", "Tom Bradley (Broker Authorized)");
    expect(updatedEx?.approvalStatus).toBe("approved");
    expect(updatedEx?.approvedBy).toBe("Tom Bradley (Broker Authorized)");

    const job = WarehouseStore.getJobById("DX-260918-037");
    expect(job?.status).toBe("in_progress");
    expect(job?.approvedAdditions).toBe(285.0);
    expect(job?.billableAmount).toBe(735.0); // 450 + 285

    // Check timeline entry completed
    const approvalTimeline = job?.timeline.find((t) => t.stage === "Awaiting Approval");
    expect(approvalTimeline?.completed).toBe(true);
  });

  it("reconciles updatePalletLocation across pallet, locations, and audit history", () => {
    // Move pallet P01 from RW-01 to ST-03
    const updatedPallet = WarehouseStore.updatePalletLocation("DX-260918-037-P01", "ST-03", "Marco S. (FL-01)", "Restack completed");
    expect(updatedPallet?.currentLocation).toBe("ST-03");

    // Check movement history logged
    const latestMove = updatedPallet?.movementHistory[0];
    expect(latestMove?.fromLocation).toBe("RW-01");
    expect(latestMove?.toLocation).toBe("ST-03");
    expect(latestMove?.operator).toBe("Marco S. (FL-01)");
    expect(latestMove?.reason).toBe("Restack completed");

    // Check location occupancy updated
    const rw01 = WarehouseStore.getLocations().find((l) => l.id === "RW-01");
    expect(rw01?.currentPalletIds.includes("DX-260918-037-P01")).toBe(false);

    const st03 = WarehouseStore.getLocations().find((l) => l.id === "ST-03");
    expect(st03?.currentPalletIds.includes("DX-260918-037-P01")).toBe(true);
  });

  it("updates job status through completion and updates billing status", () => {
    WarehouseStore.updateJobStatus("DX-260918-037", "ready_for_billing");
    let job = WarehouseStore.getJobById("DX-260918-037");
    expect(job?.status).toBe("ready_for_billing");
    expect(job?.billingStatus).toBe("pending_review");

    WarehouseStore.updateJobStatus("DX-260918-037", "completed");
    job = WarehouseStore.getJobById("DX-260918-037");
    expect(job?.status).toBe("completed");
    expect(job?.billingStatus).toBe("invoiced");
    expect(job?.completedAt).toBeDefined();
  });
});
