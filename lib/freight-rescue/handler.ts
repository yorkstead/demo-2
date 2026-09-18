import { POST as saveCoreJob } from "@/app/api/jobs/route";
import { getClientConfig, isServicePublic } from "@/lib/client-config";
import { JobStore } from "@/lib/storage";
import { RescueSubmissionSchema, rescueSession } from "./schema";
import { isDemoMode } from "@/lib/access";

const MAX_BYTES = 2 * 1024 * 1024;
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};
/** Delegates every persisted job to the existing operational API. No second queue/store. */
export async function handleRescue(request: Request, clientId: string) {
  if (!isDemoMode()) return Response.json({ error: "This synthetic demo intake is disabled on the operational deployment." }, { status: 404, headers });
  const client = getClientConfig(clientId);
  if (client.id !== clientId || !client.featureFlags.enableFreightRescue)
    return Response.json(
      { error: "Intake unavailable" },
      { status: 404, headers },
    );
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json(
      { error: "Same-origin submission required" },
      { status: 403, headers },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json({ error: "JSON required" }, { status: 415, headers });
  let raw: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Empty body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return Response.json(
          { error: "Request exceeds 2 MB" },
          { status: 413, headers },
        );
      }
      chunks.push(value);
    }
    raw = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400, headers });
  }
  const parsed = RescueSubmissionSchema.safeParse(raw);
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid request" },
      { status: 400, headers },
    );
  const { details, requestId, sessionToken } = parsed.data;
  if (!isServicePublic(client, details.service))
    return Response.json(
      { error: "Service is not publicly verified" },
      { status: 400, headers },
    );
  if (details.photos.length && !client.featureFlags.enablePhotoIntake)
    return Response.json(
      { error: "Photo intake unavailable" },
      { status: 400, headers },
    );
  // Check actual raster signatures, not just user-supplied MIME labels.
  for (const photo of details.photos) {
    const [prefix, encoded] = photo.split(",");
    const bytes = Buffer.from(encoded, "base64");
    const valid = prefix.includes("jpeg")
      ? bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
      : prefix.includes("png")
        ? bytes
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : bytes.subarray(0, 4).toString() === "RIFF" &&
          bytes.subarray(8, 12).toString() === "WEBP";
    if (!valid)
      return Response.json(
        { error: "Invalid photo format" },
        { status: 400, headers },
      );
  }
  const sessionId = rescueSession(client.id, sessionToken);
  const id = `FR-${requestId}`;
  try {
    const previous = (await JobStore.getJobs(sessionId)).find(
      (job) => job.id === id,
    );
    if (previous)
      return Response.json(
        { success: true, jobId: id, sessionId, duplicate: true },
        { headers },
      );
    const response = await saveCoreJob(
      new Request(
        `${new URL(request.url).origin}/api/jobs?session=${encodeURIComponent(sessionId)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id,
            driverName: details.contactName,
            driverPhone: details.phone,
            carrierName:
              details.company || "Demo contact — company not supplied",
            trailerNumber: details.trailer || "Not supplied",
            serviceType: "Freight Rescue",
            status: "Reserved",
            totalAmount: 0,
            palletsCount: details.palletCount ?? 0,
            wrapCount: 0,
            cornersCount: 0,
            laborHours: 0,
            scaleCheck: false,
            debrisFee: false,
            estimatedRange: "Demo only; quote required",
            beforePhotos: details.photos,
            afterPhotos: [],
            signatureData: "",
            defectTags: ["DEMO INTAKE", details.problem],
            rescueMetadata: {
              version: 1,
              clientId: client.id,
              source: "public-freight-rescue-demo",
              demo: true,
              requestId,
              submittedAt: new Date().toISOString(),
              details,
            },
          }),
        },
      ),
    );
    const result = await response.json();
    if (!response.ok)
      return Response.json(
        { error: result.error || "Demo handoff failed" },
        { status: response.status, headers },
      );
    // Do not forward the core global session cookie into unrelated screens.
    return Response.json(
      { success: true, jobId: result.job.id, sessionId },
      { status: 201, headers },
    );
  } catch {
    return Response.json(
      { error: "Demo handoff could not be saved. Please retry." },
      { status: 503, headers },
    );
  }
}
