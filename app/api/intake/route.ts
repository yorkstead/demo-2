import { z } from "zod";
import { JobStore } from "@/lib/storage";
import { isDemoMode, requireSameOrigin, workspaceId } from "@/lib/access";
import { readJson } from "@/lib/request-body";

export const dynamic = "force-dynamic";
const schema = z
  .object({
    requestId: z.uuid(),
    driverName: z.string().trim().min(1).max(100),
    driverPhone: z
      .string()
      .trim()
      .max(30)
      .refine((value) => value.replace(/\D/g, "").length >= 10),
    carrierName: z.string().trim().min(1).max(100),
    trailerNumber: z.string().trim().min(1).max(30),
    serviceType: z.enum([
      "Shifted Pallets",
      "Axle Rebalance",
      "Pallet Swap",
      "Floor Transload",
    ]),
    eta: z.string().max(50),
  })
  .strict();

/** Public create-only entry point: cannot list jobs, choose a workspace, set prices,
 * overwrite another job, retrieve contact details, complete work, or reset data.
 */
export async function POST(request: Request) {
  const denied = requireSameOrigin(request);
  if (denied) return denied;
  let raw;
  try {
    raw = await readJson(request, 8192);
  } catch {
    return Response.json(
      { success: false, error: "Invalid or oversized request." },
      { status: 400 },
    );
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    return Response.json(
      {
        success: false,
        error:
          "Enter the driver, callback number, carrier, trailer, service and ETA.",
      },
      { status: 400 },
    );
  const sessionId = workspaceId(request);
  const { requestId, ...details } = parsed.data;
  const id = `WEB-${requestId}`;
  try {
    return await JobStore.transaction(async () => {
      const jobs = await JobStore.getJobs(sessionId);
      const previous = jobs.find((job) => job.id === id);
      // Do not echo private data or current work back to someone replaying an ID.
      if (previous)
        return Response.json(
          {
            success: true,
            job: {
              id,
              bayNumber: previous.bayNumber,
              createdAt: previous.createdAt,
              expiresAt: previous.expiresAt,
              eta: previous.eta,
            },
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      if (
        jobs.filter(
          (job) =>
            job.id.startsWith("WEB-") &&
            Date.parse(job.createdAt) > Date.now() - 60_000,
        ).length >= 6
      )
        return Response.json(
          {
            success: false,
            error: "Please call the office to arrange arrival.",
          },
          { status: 429 },
        );
      const allocation = await JobStore.allocateBay(sessionId);
      if (!allocation)
        return Response.json(
          {
            success: false,
            error: "All bays are currently occupied. Please call the office.",
          },
          { status: 409 },
        );
      const job = await JobStore.saveJob(sessionId, {
        ...details,
        ...allocation,
        id,
        version: 1,
        status: "Reserved",
        createdAt: new Date().toISOString(),
        estimatedRange: "Pending assessment",
        totalAmount: 0,
        palletsCount: 0,
        wrapCount: 0,
        cornersCount: 0,
        laborHours: 0,
        scaleCheck: false,
        debrisFee: false,
        beforePhotos: [],
        afterPhotos: [],
        signatureData: "",
        defectTags: [isDemoMode() ? "Demo mobile intake" : "Mobile intake"],
      });
      return Response.json(
        {
          success: true,
          job: {
            id: job.id,
            bayNumber: job.bayNumber,
            expiresAt: job.expiresAt,
            createdAt: job.createdAt,
            eta: job.eta,
          },
        },
        { status: 201, headers: { "Cache-Control": "no-store" } },
      );
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: "Request could not be saved. Please retry or call the office.",
      },
      { status: 503 },
    );
  }
}
