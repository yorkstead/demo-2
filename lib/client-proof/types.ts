import type {
  ReworkClientConfig,
  StandardServiceId,
  VerificationSource,
} from "../client-config";
import { isServicePublic } from "../client-config/services";

export interface ReviewRequest {
  clientId: string;
  completedJobId: string;
  completedAt: string;
  contactPermission: boolean;
  optedOut: boolean;
  requestedAt?: string;
  // No rating/satisfaction field: eligibility never depends on sentiment.
}
export interface ClientCaseStudy {
  clientId: string;
  slug: string;
  title: string;
  serviceId: StandardServiceId;
  status: "draft" | "approved";
  customerPermission: boolean;
  approvedAt?: string;
  evidence?: VerificationSource;
  problem: string;
  workPerformed: string;
  outcome: string;
  metrics?: readonly {
    label: string;
    value: string;
    evidence: VerificationSource;
  }[];
}
export interface ClientProofConfig {
  clientId: string;
  reviewLink?: { url: string; verification: VerificationSource };
  cases: readonly ClientCaseStudy[];
}
export function verifiedReviewUrl(proof: ClientProofConfig) {
  const entry = proof.reviewLink;
  if (!entry?.verification.verifiedAt || !entry.verification.reference)
    return undefined;
  try {
    const url = new URL(entry.url);
    return url.protocol === "https:" &&
      ["search.google.com", "g.page", "www.google.com"].includes(
        url.hostname,
      ) &&
      !url.username &&
      !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export function buildReviewRequest(
  client: ReworkClientConfig,
  proof: ClientProofConfig,
  request: ReviewRequest,
) {
  const url = verifiedReviewUrl(proof);
  if (
    !client.featureFlags.enableGoogleReviews ||
    client.id !== proof.clientId ||
    request.clientId !== client.id ||
    !url ||
    !request.completedJobId.trim() ||
    !Number.isFinite(Date.parse(request.completedAt)) ||
    !request.contactPermission ||
    request.optedOut ||
    request.requestedAt
  )
    return undefined;
  return `Thank you for working with ${client.businessName}. If you would like to share your experience, you can leave an honest review here: ${url}. All feedback is welcome. This is optional.`;
}
export function approvedCases(
  client: ReworkClientConfig,
  proof: ClientProofConfig,
) {
  if (proof.clientId !== client.id) throw new Error("Client proof mismatch");
  if (!client.featureFlags.enableCaseStudies) return [];
  return proof.cases.filter(
    (item) =>
      item.clientId === client.id &&
      item.status === "approved" &&
      item.customerPermission &&
      item.approvedAt &&
      item.evidence?.reference &&
      item.evidence.verifiedAt &&
      isServicePublic(client, item.serviceId) &&
      [item.title, item.problem, item.workPerformed, item.outcome].every(
        (value) => value.trim(),
      ) &&
      (item.metrics || []).every(
        (metric) => metric.evidence.reference && metric.evidence.verifiedAt,
      ),
  );
}
