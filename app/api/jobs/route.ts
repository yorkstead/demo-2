import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson } from "@/lib/request-body";
import { JobStore } from "@/lib/storage";
import { ReworkJob, calculateJobTotal } from "@/lib/types";
import { RescueMetadataSchema } from "@/lib/freight-rescue/schema";
import { getClientConfig, isServicePublic } from "@/lib/client-config";
import {
  workspaceId,
  requireStaff,
  requireSameOrigin,
  isDemoMode,
} from "@/lib/access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const JobPayloadSchema = z.object({
  version: z.number().int().min(0).optional(),
  phoneIntake: z.object({ notes: z.string().max(1000) }).optional(),
  rescueMetadata: RescueMetadataSchema.optional(),
  id: z.string().max(50).optional(),
  action: z.enum(["reset"]).optional(),
  trailerNumber: z
    .string()
    .min(1, "Trailer number is required")
    .max(30)
    .optional(),
  carrierName: z
    .string()
    .min(1, "Carrier name is required")
    .max(100)
    .optional(),
  driverName: z.string().min(1, "Driver name is required").max(100).optional(),
  driverPhone: z.string().min(1, "Driver phone is required").max(30).optional(),
  bayNumber: z.string().min(1).max(20).optional(),
  serviceType: z
    .enum([
      "Shifted Pallets",
      "Axle Rebalance",
      "Pallet Swap",
      "Floor Transload",
      "Freight Rescue",
    ])
    .optional(),
  status: z.enum(["Reserved", "In Progress", "Completed", "Billed"]).optional(),
  eta: z.string().max(50).optional(),
  estimatedRange: z.string().max(50).optional(),
  palletsCount: z
    .number()
    .int()
    .min(0, "Pallets count must be >= 0")
    .max(100)
    .optional(),
  wrapCount: z
    .number()
    .int()
    .min(0, "Wrap count must be >= 0")
    .max(100)
    .optional(),
  cornersCount: z
    .number()
    .int()
    .min(0, "Corners count must be >= 0")
    .max(200)
    .optional(),
  laborHours: z
    .number()
    .min(0, "Labor hours must be >= 0")
    .max(24, "Labor hours cannot exceed 24")
    .optional(),
  scaleCheck: z.boolean().optional(),
  debrisFee: z.boolean().optional(),
  totalAmount: z.number().min(0).max(100000).optional(),
  beforePhotos: z.array(z.string().max(1500000)).max(10).optional(),
  afterPhotos: z.array(z.string().max(1500000)).max(10).optional(),
  signatureData: z.string().max(1000000).optional(),
  defectTags: z.array(z.string().max(100)).max(10).optional(),
  createdAt: z.string().max(50).optional(),
  completedAt: z.string().max(50).optional(),
  expiresAt: z.string().max(50).optional(),
});

function attachSessionCookie(
  response: NextResponse,
  sessionId: string,
): NextResponse {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.cookies.set("rework_session", sessionId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function GET(request: Request) {
  const denied = requireStaff(request);
  if (denied) return denied;
  const sessionId = workspaceId(request);
  const { searchParams } = new URL(request.url);
  try {
    // Reads never mutate data.
    if (searchParams.get("reset") === "true") {
      return NextResponse.json(
        { error: "Use a POST reset in demo mode." },
        { status: 405 },
      );
    }

    // Audit entries are scoped to the authenticated workspace.
    if (searchParams.get("audit") === "true") {
      const ledger = await JobStore.getAuditLedger(sessionId);
      const res = NextResponse.json({
        success: true,
        sessionId,
        totalEntries: ledger.length,
        ledger,
      });
      return attachSessionCookie(res, sessionId);
    }

    const jobs = await JobStore.getJobs(sessionId);
    const res = NextResponse.json({
      success: true,
      sessionId,
      jobs,
    });
    return attachSessionCookie(res, sessionId);
  } catch {
    return NextResponse.json(
      { success: false, error: "Job storage is unavailable. Please retry." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const denied = requireStaff(request) || requireSameOrigin(request);
  if (denied) return denied;
  const sessionId = workspaceId(request);

  // Check payload size
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return NextResponse.json(
      { success: false, error: "Payload exceeds maximum allowed size (5MB)" },
      { status: 413 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await readJson(request, MAX_PAYLOAD_BYTES);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  // Runtime validation with Zod
  const parseResult = JobPayloadSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
      : "Validation failed";
    return NextResponse.json(
      { success: false, error: message, details: parseResult.error.format() },
      { status: 400 },
    );
  }

  const body = parseResult.data;
  if (
    body.phoneIntake &&
    (!body.driverName?.trim() ||
      !body.carrierName?.trim() ||
      !body.trailerNumber?.trim() ||
      !body.driverPhone ||
      body.driverPhone.replace(/\D/g, "").length < 10)
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Phone requests require a driver, callback number, carrier, and trailer.",
      },
      { status: 400 },
    );
  }
  if (body.rescueMetadata) {
    const metadata = body.rescueMetadata;
    const client = getClientConfig(metadata.clientId);
    if (
      client.id !== metadata.clientId ||
      !sessionId.startsWith(`rescue-${client.id}-`) ||
      !isServicePublic(client, metadata.details.service)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid rescue client context" },
        { status: 400 },
      );
    }
  }

  // Handle protected session reset action
  if (body.action === "reset") {
    if (!isDemoMode())
      return NextResponse.json(
        { error: "Reset is disabled in operations mode." },
        { status: 403 },
      );
    try {
      const resetJobs = await JobStore.resetJobs(sessionId);
      const res = NextResponse.json({
        success: true,
        sessionId,
        message: "Session jobs reset",
        jobs: resetJobs,
      });
      return attachSessionCookie(res, sessionId);
    } catch {
      return NextResponse.json(
        { success: false, error: "Reset could not be saved." },
        { status: 503 },
      );
    }
  }

  try {
    return await JobStore.transaction(async () => {
      const existingJobs = await JobStore.getJobs(sessionId);
      const existingIndex = body.id
        ? existingJobs.findIndex((j) => j.id === body.id)
        : -1;
      const existingJob =
        existingIndex >= 0 ? existingJobs[existingIndex] : null;

      // A retried intake must never overwrite work already performed at the dock.
      if (body.status === "Reserved" && existingJob) {
        return attachSessionCookie(
          NextResponse.json({
            success: true,
            sessionId,
            job: existingJob,
            totalJobs: existingJobs.length,
          }),
          sessionId,
        );
      }

      const targetStatus = body.status || existingJob?.status || "Completed";
      if (
        !isDemoMode() &&
        existingJob &&
        body.version !== (existingJob.version ?? 0)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "This job changed on another device. Reload the job before saving.",
          },
          { status: 409 },
        );
      }
      if (
        !isDemoMode() &&
        !existingJob &&
        [
          body.driverName,
          body.driverPhone,
          body.carrierName,
          body.trailerNumber,
        ].some((value) => !value?.trim())
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Driver, callback number, carrier, and trailer are required.",
          },
          { status: 400 },
        );
      }
      if (
        !isDemoMode() &&
        (targetStatus === "Completed" || targetStatus === "Billed") &&
        !(body.signatureData || existingJob?.signatureData)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "A signature is required to complete this job.",
          },
          { status: 400 },
        );
      }

      // Handle bay allocation and expiration for new reservations
      let allocatedBay = body.bayNumber || existingJob?.bayNumber || "Bay 2";
      let expiresAt = body.expiresAt || existingJob?.expiresAt;

      if (
        (targetStatus === "Reserved" && !existingJob) ||
        (!isDemoMode() && !existingJob && targetStatus !== "Billed")
      ) {
        const allocation = await JobStore.allocateBay(
          sessionId,
          body.bayNumber,
        );
        if (!allocation) {
          return NextResponse.json(
            {
              success: false,
              error:
                "All rework bays are currently occupied. Please contact dispatch or retry shortly.",
            },
            { status: 409 },
          );
        }
        allocatedBay = allocation.bayNumber;
        expiresAt = allocation.expiresAt;
      }
      if (!isDemoMode() && existingJob && targetStatus !== "Billed") {
        const conflicting = existingJobs.some(
          (job) =>
            job.id !== existingJob.id &&
            job.bayNumber === allocatedBay &&
            (job.status === "In Progress" ||
              job.status === "Completed" ||
              (job.status === "Reserved" && !JobStore.isHoldExpired(job))),
        );
        if (conflicting)
          return NextResponse.json(
            {
              success: false,
              error:
                "This bay is occupied. Select an available bay before saving.",
            },
            { status: 409 },
          );
      }

      // Authoritatively calculate invoice totals for completed or billed jobs
      let finalTotalAmount = body.totalAmount;
      if (targetStatus === "Completed" || targetStatus === "Billed") {
        finalTotalAmount = calculateJobTotal({
          palletsCount:
            body.palletsCount ??
            existingJob?.palletsCount ??
            (isDemoMode() ? 4 : 0),
          wrapCount:
            body.wrapCount ?? existingJob?.wrapCount ?? (isDemoMode() ? 2 : 0),
          cornersCount:
            body.cornersCount ??
            existingJob?.cornersCount ??
            (isDemoMode() ? 8 : 0),
          laborHours:
            body.laborHours ??
            existingJob?.laborHours ??
            (isDemoMode() ? 1.25 : 0),
          scaleCheck:
            body.scaleCheck ?? existingJob?.scaleCheck ?? isDemoMode(),
          debrisFee: body.debrisFee ?? existingJob?.debrisFee ?? isDemoMode(),
        });
      } else if (finalTotalAmount === undefined) {
        finalTotalAmount = existingJob?.totalAmount ?? (isDemoMode() ? 350 : 0);
      }

      // Build authoritative job data preserving createdAt and metadata on update
      const jobData: ReworkJob = {
        version: (existingJob?.version ?? 0) + 1,
        ...(existingJob?.phoneIntake || body.phoneIntake
          ? { phoneIntake: existingJob?.phoneIntake ?? body.phoneIntake }
          : {}),
        // Preserve original intake attribution, requirements and evidence through dock/billing updates.
        ...(existingJob?.rescueMetadata || body.rescueMetadata
          ? {
              rescueMetadata:
                existingJob?.rescueMetadata ?? body.rescueMetadata,
            }
          : {}),
        id: existingJob
          ? existingJob.id
          : body.id || `RW-${crypto.randomUUID()}`,
        trailerNumber:
          body.trailerNumber || existingJob?.trailerNumber || "SWFT-55219",
        carrierName:
          body.carrierName ||
          existingJob?.carrierName ||
          "Swift Transportation",
        driverName:
          body.driverName || existingJob?.driverName || "Marcus Vance",
        driverPhone:
          body.driverPhone || existingJob?.driverPhone || "(720) 555-0194",
        bayNumber: allocatedBay,
        serviceType:
          body.serviceType || existingJob?.serviceType || "Shifted Pallets",
        status: targetStatus,
        // Preserve reservation metadata if omitted in completion update
        eta: body.eta !== undefined ? body.eta : existingJob?.eta,
        estimatedRange:
          body.estimatedRange !== undefined
            ? body.estimatedRange
            : existingJob?.estimatedRange,
        palletsCount:
          body.palletsCount ??
          existingJob?.palletsCount ??
          (isDemoMode() ? 4 : 0),
        wrapCount:
          body.wrapCount ?? existingJob?.wrapCount ?? (isDemoMode() ? 2 : 0),
        cornersCount:
          body.cornersCount ??
          existingJob?.cornersCount ??
          (isDemoMode() ? 8 : 0),
        laborHours:
          body.laborHours ??
          existingJob?.laborHours ??
          (isDemoMode() ? 1.25 : 0),
        scaleCheck: body.scaleCheck ?? existingJob?.scaleCheck ?? isDemoMode(),
        debrisFee: body.debrisFee ?? existingJob?.debrisFee ?? isDemoMode(),
        totalAmount: finalTotalAmount,
        beforePhotos:
          body.beforePhotos && body.beforePhotos.length > 0
            ? body.beforePhotos
            : existingJob?.beforePhotos || [],
        afterPhotos:
          body.afterPhotos && body.afterPhotos.length > 0
            ? body.afterPhotos
            : existingJob?.afterPhotos || [],
        signatureData:
          body.signatureData !== undefined
            ? body.signatureData
            : existingJob?.signatureData || "",
        defectTags: body.defectTags ||
          existingJob?.defectTags || ["Mountain Shift", "Pallet Wall Collapse"],
        // Crucial: preserve original creation timestamp during updates!
        createdAt: existingJob
          ? existingJob.createdAt
          : body.createdAt || new Date().toISOString(),
        completedAt:
          targetStatus === "Completed"
            ? existingJob?.completedAt ||
              body.completedAt ||
              new Date().toISOString()
            : body.completedAt || existingJob?.completedAt,
        expiresAt: targetStatus === "Reserved" ? expiresAt : undefined,
      };

      const savedJob = await JobStore.saveJob(sessionId, jobData);
      const allJobs = await JobStore.getJobs(sessionId);

      const res = NextResponse.json({
        success: true,
        sessionId,
        job: savedJob,
        totalJobs: allJobs.length,
      });
      return attachSessionCookie(res, sessionId);
    });
  } catch (error) {
    console.error("Job transaction failed; no successful save acknowledged.");
    return NextResponse.json(
      { success: false, error: "Failed to process job" },
      { status: 503 },
    );
  }
}
