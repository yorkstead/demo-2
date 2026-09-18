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
    expect(flagship?.palletCount).toBe(8);
    expect(flagship?.service).toBe("Freight Rescue");
    expect(flagship?.quoteAmount).toBe(450.0);
    expect(flagship?.pendingAdditions).toBe(285.0);
    expect(flagship?.approvedAdditions).toBe(0.0);
    expect(flagship?.billableAmount).toBe(450.0);
    expect(flagship?.projectedAmount).toBe(735.0);

    // Verify trailer is at Door 3
    const trailer = WarehouseStore.getTrailers().find((t) => t.trailerNumber === "RMB-5012");
    expect(trailer).toBeDefined();
    expect(trailer?.assignedDoor).toBe("Door 3");
    expect(trailer?.loadStatus).toBe("at_door");

    // Verify 8 pallets exist
    const flagshipPallets = WarehouseStore.getPallets().filter((p) => p.jobId === "DX-260918-037");
    expect(flagshipPallets.length).toBe(8);
    expect(flagshipPallets.map((p) => p.id)).toEqual([
      "DX-260918-037-P01",
      "DX-260918-037-P02",
      "DX-260918-037-P03",
      "DX-260918-037-P04",
      "DX-260918-037-P05",
      "DX-260918-037-P06",
      "DX-260918-037-P07",
      "DX-260918-037-P08",
    ]);

    // Verify exception EX-1049
    const ex = WarehouseStore.getExceptions().find((e) => e.id === "EX-1049");
    expect(ex).toBeDefined();
    expect(ex?.jobId).toBe("DX-260918-037");
    expect(ex?.palletId).toBe("DX-260918-037-P08");
    expect(ex?.severity).toBe("critical");
    expect(ex?.changeOrderAmount).toBe(285.0);
    expect(ex?.status).toBe("awaiting_customer");
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

  it("authorizes exception quote addition and advances job state without making unperformed work billable prematurely", () => {
    const updatedEx = WarehouseStore.updateExceptionApproval("EX-1049", "approved", "Tom Bradley (Broker Authorized)");
    expect(updatedEx?.approvalStatus).toBe("approved");
    expect(updatedEx?.approvedBy).toBe("Tom Bradley (Broker Authorized)");

    const job = WarehouseStore.getJobById("DX-260918-037");
    expect(job?.status).toBe("in_progress");
    expect(job?.approvedAdditions).toBe(285.0);
    expect(job?.authorizedAmount).toBe(735.0); // 450 + 285 authorized
    expect(job?.performedAmount).toBe(450.0); // Corrective work not performed yet!
    expect(job?.billableAmount).toBe(450.0); // Only performed work is billable!
    expect(job?.billingReadinessStatus).toBe("authorized_work_pending");

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

  it("handles customer view, change order approval, corrective rebuild, and billing sign-off workflow", () => {
    // 1. Customer views the authorization page
    const viewedEx = WarehouseStore.recordCustomerView("EX-1049", "Tom Bradley (Broker Authorized)");
    expect(viewedEx?.customerViewedTime).toBeDefined();
    const viewEntry = viewedEx?.auditHistory.find((a) => a.action === "VIEWED");
    expect(viewEntry).toBeDefined();

    // 2. Customer approves change order for $285
    const approvedEx = WarehouseStore.approveChangeOrder("EX-1049", "Tom Bradley", "tbradley@rockymountainbev.com");
    expect(approvedEx?.status).toBe("approved");
    expect(approvedEx?.approvalStatus).toBe("approved");
    expect(approvedEx?.approvedBy).toBe("Tom Bradley");
    expect(approvedEx?.approverContact).toBe("tbradley@rockymountainbev.com");

    const jobAfterApproval = WarehouseStore.getJobById("DX-260918-037");
    expect(jobAfterApproval?.quoteAmount).toBe(450.0);
    expect(jobAfterApproval?.approvedAdditions).toBe(285.0);
    expect(jobAfterApproval?.pendingAdditions).toBe(0.0);
    expect(jobAfterApproval?.authorizedAmount).toBe(735.0);
    expect(jobAfterApproval?.performedAmount).toBe(450.0); // Not performed yet!
    expect(jobAfterApproval?.billableAmount).toBe(450.0); // Billable only after work performed
    expect(jobAfterApproval?.billingReadinessStatus).toBe("authorized_work_pending");
    expect(jobAfterApproval?.status).toBe("in_progress");

    // 3. Operator starts corrective work on Bay RW-01
    const inProgressEx = WarehouseStore.beginCorrectiveWork("EX-1049", "Dave M. (FL-02)");
    expect(inProgressEx?.status).toBe("in_progress");
    const begEntry = inProgressEx?.auditHistory.find((a) => a.action === "WORK_BEGUN");
    expect(begEntry).toBeDefined();

    // 4. Operator completes corrective work and moves P08 to ST-03
    const completedEx = WarehouseStore.completeCorrectiveWork("EX-1049", "Dave M. (FL-02)", "ST-03");
    expect(completedEx?.status).toBe("resolved");
    expect(completedEx?.resolutionState).toBe("completed");
    expect(completedEx?.resolvedAt).toBeDefined();

    // Check pallet P08 condition and location
    const p08 = WarehouseStore.getPalletById("DX-260918-037-P08");
    expect(p08?.condition).toBe("restacked");
    expect(p08?.currentLocation).toBe("ST-03");

    // Check location occupancy updated
    const st03 = WarehouseStore.getLocations().find((l) => l.id === "ST-03");
    expect(st03?.currentPalletIds.includes("DX-260918-037-P08")).toBe(true);
    const rw01 = WarehouseStore.getLocations().find((l) => l.id === "RW-01");
    expect(rw01?.currentPalletIds.includes("DX-260918-037-P08")).toBe(false);

    // Check job state advanced to staged, performedAmount = 735, billableAmount = 735, readiness = needs_review
    const jobAfterWork = WarehouseStore.getJobById("DX-260918-037");
    expect(jobAfterWork?.status).toBe("staged");
    expect(jobAfterWork?.performedAmount).toBe(735.0);
    expect(jobAfterWork?.billableAmount).toBe(735.0);
    expect(jobAfterWork?.billingReadinessStatus).toBe("needs_review");

    // 5. Billing manager signs off
    const jobAfterReview = WarehouseStore.reviewAndApproveBilling("DX-260918-037", "Sarah Lin");
    expect(jobAfterReview?.billingReadinessStatus).toBe("ready_to_invoice");

    // 6. Invoicing release
    const jobAfterInvoice = WarehouseStore.markJobInvoiced("DX-260918-037", "INV-109823");
    expect(jobAfterInvoice?.billingReadinessStatus).toBe("invoiced");
    expect(jobAfterInvoice?.billingStatus).toBe("invoiced");
  });

  it("handles freight hold when customer declines change order", () => {
    const heldEx = WarehouseStore.holdFreight("EX-1049", "Shipper requests repack at destination instead");
    expect(heldEx?.status).toBe("declined");
    expect(heldEx?.resolutionState).toBe("held");
    expect(heldEx?.approvalStatus).toBe("rejected");

    const job = WarehouseStore.getJobById("DX-260918-037");
    expect(job?.status).toBe("waiting");
    expect(job?.pendingAdditions).toBe(0.0);
    expect(job?.billableAmount).toBe(450.0);
    expect(job?.projectedAmount).toBe(450.0);
  });

  it("manages capital asset registry and maintains reconciliation with jobs and personnel", () => {
    const assets = WarehouseStore.getAssets();
    expect(assets.length).toBeGreaterThanOrEqual(6);

    // FL-01 is assigned to flagship job DX-260918-037 and Marco S.
    const fl01 = assets.find((a) => a.id === "FL-01");
    expect(fl01).toBeDefined();
    expect(fl01?.status).toBe("in_use");
    expect(fl01?.currentJobId).toBe("DX-260918-037");
    expect(fl01?.assignedOperator).toBe("Marco S.");
    expect(fl01?.inspectionStatus).toBe("due_soon");

    // Personnel reconciliation
    const personnel = WarehouseStore.getPersonnel();
    expect(personnel.length).toBeGreaterThanOrEqual(4);
    const marco = personnel.find((p) => p.name === "Marco S.");
    expect(marco).toBeDefined();
    expect(marco?.assignedAssetId).toBe("FL-01");
    expect(marco?.currentJobId).toBe("DX-260918-037");

    // Update asset status
    const updatedFl01 = WarehouseStore.updateAsset("FL-01", {
      meterHours: 3250,
      inspectionStatus: "compliant",
      lastInspectionDate: "2026-09-18",
    });
    expect(updatedFl01?.meterHours).toBe(3250);
    expect(updatedFl01?.inspectionStatus).toBe("compliant");
  });
});
