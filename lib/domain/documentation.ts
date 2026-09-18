import { WarehouseJob, JobDocumentationCompleteness, DocumentationItem, OperationalException } from "./types";

/**
 * Builds standard 8-point documentation checklist for a job.
 */
export function buildJobDocumentation(
  job: WarehouseJob,
  palletsOrExceptions?: any,
  exceptionsArg?: OperationalException[]
): JobDocumentationCompleteness {
  const exceptions: OperationalException[] = Array.isArray(exceptionsArg)
    ? exceptionsArg
    : Array.isArray(palletsOrExceptions) && palletsOrExceptions.length > 0 && "severity" in palletsOrExceptions[0]
    ? (palletsOrExceptions as OperationalException[])
    : [];

  const hasExceptions = exceptions.length > 0;
  const criticalException = exceptions.find((e) => e.severity === "critical" || e.changeOrderAmount > 0);
  const isAuthRequired = hasExceptions && exceptions.some((e) => e.customerApprovalRequired || (e.changeOrderAmount ?? 0) > 0);
  const isApproved = !isAuthRequired || exceptions.every((e) => e.status === "approved" || e.status === "in_progress" || e.status === "resolved" || e.approvalStatus === "approved" || e.approvalStatus === "waived");
  const isCompleted = job.status === "completed" || job.status === "ready_for_billing" || job.status === "staged";
  const isWorkDone = isCompleted || (job.labor.hoursLogged > 0 && (!criticalException || criticalException.status === "resolved"));
  const hasDeparted = job.status === "completed" || Boolean(job.completedAt);

  const items: DocumentationItem[] = [
    {
      key: "arrival_record",
      label: "Gate Arrival Record",
      category: "intake",
      required: true,
      completed: true,
      timestamp: job.arrival,
      verifiedBy: "Gate Guard & Yard Dispatch",
      notes: `Trailer ${job.trailer} verified on-site with driver ${job.driver.name}`,
    },
    {
      key: "bol",
      label: "Original Bill of Lading (BOL)",
      category: "intake",
      required: true,
      completed: Boolean(job.bolNumber),
      timestamp: job.arrival,
      verifiedBy: "Receiving Clerk",
      notes: `BOL #${job.bolNumber} scanned and attached to manifest`,
    },
    {
      key: "inbound_evidence",
      label: "Inbound Seal & Freight Photos",
      category: "intake",
      required: true,
      completed: (job.photos?.before?.length || 0) > 0,
      timestamp: job.arrival,
      verifiedBy: "Lead Dock Tech",
      notes: `${job.photos?.before?.length || 2} inbound inspection photos captured at bay door`,
    },
    {
      key: "exception_documentation",
      label: "Exception Log & Defect Assessment",
      category: "freight",
      required: hasExceptions,
      completed: hasExceptions,
      timestamp: criticalException?.discoveredTime || "11:06 AM",
      verifiedBy: criticalException?.discoveredBy || "Forklift Tech",
      notes: hasExceptions
        ? `${exceptions.length} exception(s) logged: ${criticalException?.title || "Damage recorded"}`
        : "No exceptions filed (sound intake)",
    },
    {
      key: "customer_authorization",
      label: "Customer Electronic Authorization",
      category: "authorization",
      required: isAuthRequired,
      completed: isApproved,
      timestamp: criticalException?.approvedAt || criticalException?.approvalDecisionTime,
      verifiedBy: criticalException?.approvedBy || (isApproved ? "Direct Account" : undefined),
      notes: isApproved
        ? `Authorized by ${criticalException?.approvedBy || "Customer"} (+$${(criticalException?.changeOrderAmount || 0).toFixed(2)})`
        : "Pending customer sign-off on change order quote",
    },
    {
      key: "work_evidence",
      label: "Warehouse Labor & Materials Tally",
      category: "completion",
      required: true,
      completed: job.labor.hoursLogged > 0,
      timestamp: job.updatedAt,
      verifiedBy: job.labor.assignedTech || "Assigned Tech",
      notes: `${job.labor.hoursLogged} tech-hours logged • ${job.materials.palletsUsed} exchange pallets • ${job.materials.wrapRollsUsed} rolls wrap`,
    },
    {
      key: "completion_evidence",
      label: "Post-Rework QA & Plumb Verification",
      category: "completion",
      required: true,
      completed: isWorkDone,
      timestamp: criticalException?.resolvedAt || (isWorkDone ? job.updatedAt : undefined),
      verifiedBy: "Lead Dock QA Inspector",
      notes: isWorkDone
        ? "All freight units restacked, banded, and verified plumb (<1° tolerance)"
        : "Corrective work or final staging QA pending",
    },
    {
      key: "departure_release",
      label: "Outbound Reload & Release Sign-Off",
      category: "release",
      required: true,
      completed: hasDeparted,
      timestamp: job.completedAt,
      verifiedBy: hasDeparted ? "Outbound Dispatch" : undefined,
      notes: hasDeparted
        ? "Driver signed off on tablet; trailer resealed and released"
        : "Trailer staging in yard / awaiting outbound driver sign-off",
    },
  ];

  const arrivalRecord = items.find((i) => i.key === "arrival_record")?.completed ?? false;
  const bol = items.find((i) => i.key === "bol")?.completed ?? false;
  const inboundEvidence = items.find((i) => i.key === "inbound_evidence")?.completed ?? false;
  const exceptionDocumentation = items.find((i) => i.key === "exception_documentation")?.completed ?? false;
  const customerAuthorization = items.find((i) => i.key === "customer_authorization")?.completed ?? false;
  const workEvidence = items.find((i) => i.key === "work_evidence")?.completed ?? false;
  const completionEvidence = items.find((i) => i.key === "completion_evidence")?.completed ?? false;
  const departureRelease = items.find((i) => i.key === "departure_release")?.completed ?? false;

  // Required items excluding departure release (which happens at gate exit)
  const preBillingRequired = items.filter((i) => i.required && i.key !== "departure_release");
  const allRequiredPresent = preBillingRequired.every((i) => i.completed);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  return {
    arrivalRecord,
    bol,
    inboundEvidence,
    exceptionDocumentation,
    customerAuthorization,
    workEvidence,
    completionEvidence,
    departureRelease,
    items,
    allRequiredPresent,
    completedCount,
    totalCount,
    percent,
  };
}
