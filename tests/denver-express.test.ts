import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  DENVER_EXPRESS_CONFIG as client,
  resolveClientFromPath,
} from "../lib/client-config";
import { DENVER_EXPRESS_PRESENTATION as presentation } from "../lib/client-config/clients/denver-express-presentation";
import { DENVER_EXPRESS_PROOF as proof } from "../lib/client-config/clients/denver-express-proof";
import { publicPages } from "../lib/client-config/presentation";
import { demoMetadata } from "../lib/seo/demo-metadata";
import { approvedCases, buildReviewRequest } from "../lib/client-proof/types";
import {
  RescueSubmissionSchema,
  rescueSession,
} from "../lib/freight-rescue/schema";
import { handleRescue } from "../lib/freight-rescue/handler";
import { GET, POST } from "../app/api/jobs/route";
import { GET as STREAM } from "../app/api/jobs/stream/route";
import { POST as INTAKE } from "../app/api/intake/route";
import { workspaceId, requireStaff } from "../lib/access";
import { JobStore, HOLD_DURATION_MS } from "../lib/storage";
import { calculateJobTotal } from "../lib/types";
import sitemap from "../app/sitemap";
import robots from "../app/robots";

// All persistence is isolated in a new temporary directory. Never contact configured KV.
const originalCwd = process.cwd();
const envKeys = [
  "DATABASE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "REWORK_MODE", "REWORK_STAFF_USERNAME", "REWORK_STAFF_PASSWORD", "REWORK_WORKSPACE_ID", "VERCEL",
];
const env = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
beforeAll(() => {
  process.chdir(mkdtempSync(join(tmpdir(), "rework-rescue-test-")));
  for (const key of envKeys) delete process.env[key];
  process.env.REWORK_MODE = "demo";
  globalThis.__reworkSessionsStore = new Map();
  globalThis.__reworkAuditLedger = [];
});
afterAll(() => {
  process.chdir(originalCwd);
  for (const key of envKeys) {
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
});
const origin = "http://localhost:3108";
const token = crypto.randomUUID();
const requestId = crypto.randomUUID();
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX6kAAAAASUVORK5CYII=";
const details = {
  contactName: "Synthetic Test",
  phone: "303-555-0100",
  problem: "Receiver rejected load",
  service: "rejected-load-recovery",
  receiverRequirements: "Synthetic receiving instruction",
  photos: [png],
};
const payload = {
  requestId,
  sessionToken: token,
  demoAcknowledged: true,
  details,
};
function rescue(body: unknown, headers: Record<string, string> = {}) {
  return handleRescue(
    new Request(`${origin}/denver-express/api/rescue`, {
      method: "POST",
      headers: { origin, "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
    client.id,
  );
}
function core(body: unknown, session: string) {
  return POST(
    new Request(`${origin}/api/jobs?session=${session}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

test("office phone intake joins the queue once and preserves handoff notes through completion", async () => {
  const session = "phone-intake-test";
  const payload = {
    id: "CALL-test", status: "Reserved", driverName: "Test Driver",
    driverPhone: "3035550100", carrierName: "Test Carrier", trailerNumber: "TEST-1",
    serviceType: "Freight Rescue", phoneIntake: { notes: "Shifted load; call on arrival." },
    palletsCount: 0, wrapCount: 0, cornersCount: 0, laborHours: 0,
    scaleCheck: false, debrisFee: false, totalAmount: 0,
  };
  expect((await core({ ...payload, driverName: " " }, session)).status).toBe(400);
  expect((await core({ ...payload, driverPhone: "123" }, session)).status).toBe(400);
  expect((await core(payload, session)).status).toBe(200);
  expect((await core(payload, session)).status).toBe(200);
  expect((await JobStore.getJobs(session)).filter(job => job.id === payload.id)).toHaveLength(1);
  const updated = await (await core({ id: payload.id, status: "Completed", defectTags: ["Dock assessment"] }, session)).json();
  expect(updated.job.phoneIntake).toEqual(payload.phoneIntake);
  expect(updated.job.totalAmount).toBe(0);
  const retried = await (await core(payload, session)).json();
  expect(retried.job.status).toBe("Completed");
  expect(retried.job.defectTags).toEqual(["Dock assessment"]);
  expect((await JobStore.getJobs("other-phone-session")).some(job => job.id === payload.id)).toBe(false);
});

test("eight intent routes are distinct, publicly verified and client isolated", () => {
  const pages = publicPages(client, presentation);
  expect(pages).toHaveLength(8);
  for (const key of ["slug", "title", "summary"] as const)
    expect(new Set(pages.map((page) => page[key])).size).toBe(8);
  expect(
    publicPages(
      {
        ...client,
        capabilities: client.capabilities.map((cap) => ({
          ...cap,
          status: "unverified" as const,
        })),
      },
      presentation,
    ),
  ).toHaveLength(0);
  expect(() =>
    publicPages({ ...client, id: "another-client" }, presentation),
  ).toThrow();
  expect(resolveClientFromPath("/denver-express-other").id).toBe("default");
  expect(resolveClientFromPath("/dock").id).toBe("default");
  expect(resolveClientFromPath("/denver-express/freight-rework").id).toBe(
    client.id,
  );
});
test("all demo metadata remains noindex even with indexing enabled on client", () => {
  for (const page of presentation.pages) {
    const metadata = demoMetadata(
      { ...client, seo: { noIndex: false } },
      page.title,
      page.summary,
    );
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBeNull();
  }
  expect(sitemap().some((item) => item.url.includes("/denver-express"))).toBe(
    false,
  );
  expect(JSON.stringify(robots())).toContain('"/denver-express"');
});
test("intake rejects missing required fields, unsupported services and forged attribution", async () => {
  expect(
    RescueSubmissionSchema.safeParse({ ...payload, demoAcknowledged: false })
      .success,
  ).toBe(false);
  expect((await rescue({ ...payload, clientId: "another" })).status).toBe(400);
  expect(
    (
      await rescue({
        ...payload,
        details: { ...details, service: "trailer-transfer" },
      })
    ).status,
  ).toBe(400);
  expect(
    (await rescue({ ...payload, details: { ...details, contactName: "" } }))
      .status,
  ).toBe(400);
  expect(
    (await rescue(payload, { origin: "https://evil.example" })).status,
  ).toBe(403);
  expect((await rescue(payload, { "content-type": "text/plain" })).status).toBe(
    415,
  );
});
test("photo validation rejects SVG, remote content, false raster signatures and overflow", async () => {
  for (const photo of [
    "data:image/svg+xml;base64,PHN2Zz4=",
    "https://example.com/photo.png",
    "data:image/png;base64,PHNjcmlwdD4=",
  ])
    expect(
      (await rescue({ ...payload, details: { ...details, photos: [photo] } }))
        .status,
    ).toBe(400);
  expect(
    (
      await rescue({
        ...payload,
        details: { ...details, photos: [png, png, png, png] },
      })
    ).status,
  ).toBe(400);
  expect((await rescue({ data: "x".repeat(2 * 1024 * 1024) })).status).toBe(
    413,
  );
});
test("rescue handoff, retries, session separation and metadata preservation", async () => {
  const sessionId = rescueSession(client.id, token);
  const otherBefore = await JobStore.getJobs("baseline-unrelated");
  const response = await rescue(payload);
  expect(response.status).toBe(201);
  expect(response.headers.get("set-cookie")).toBeNull();
  const receipt = await response.json();
  expect(receipt.sessionId).toBe(sessionId);
  const job = (await JobStore.getJobs(sessionId)).find(
    (item) => item.id === receipt.jobId,
  )!;
  expect(job.status).toBe("Reserved");
  expect(job.serviceType).toBe("Freight Rescue");
  expect(job.beforePhotos).toEqual([png]);
  expect(job.totalAmount).toBe(0);
  expect(
    Date.parse(job.expiresAt!) - Date.parse(job.createdAt),
  ).toBeGreaterThan(HOLD_DURATION_MS - 3000);
  expect((await rescue(payload)).status).toBe(200);
  expect(
    (await JobStore.getJobs(sessionId)).filter((item) => item.id === job.id),
  ).toHaveLength(1);
  const completed = await core(
    {
      id: job.id,
      status: "Completed",
      palletsCount: 2,
      wrapCount: 1,
      cornersCount: 0,
      laborHours: 1,
      scaleCheck: false,
      debrisFee: false,
      totalAmount: 9999,
      beforePhotos: [png],
      afterPhotos: [png],
      signatureData: "synthetic-signature",
    },
    sessionId,
  );
  const updated = (await completed.json()).job;
  expect(updated.totalAmount).toBe(
    calculateJobTotal({ palletsCount: 2, wrapCount: 1, laborHours: 1 }),
  );
  expect(updated.rescueMetadata).toEqual(job.rescueMetadata);
  expect(updated.createdAt).toBe(job.createdAt);
  const billed = await core({ id: job.id, status: "Billed" }, sessionId);
  expect((await billed.json()).job.rescueMetadata).toEqual(job.rescueMetadata);
  expect(await JobStore.getJobs("baseline-unrelated")).toEqual(otherBefore);
  const wrong = await core({ rescueMetadata: job.rescueMetadata }, "demo-main");
  expect(wrong.status).toBe(400);
});
test("baseline API validation, bay allocation, pricing and reset semantics remain", async () => {
  const sessionId = "baseline-regression";
  await JobStore.setJobs(sessionId, []);
  expect((await core({ palletsCount: -1 }, sessionId)).status).toBe(400);
  for (let i = 0; i < 6; i++) {
    const response = await core(
      { id: `BASE-${i}`, status: "Reserved", serviceType: "Shifted Pallets" },
      sessionId,
    );
    expect(response.status).toBe(200);
    expect((await response.json()).job.bayNumber).toBe(`Bay ${i + 1}`);
  }
  expect(
    (await core({ id: "BASE-FULL", status: "Reserved" }, sessionId)).status,
  ).toBe(409);
  const update = await core(
    {
      id: "BASE-0",
      status: "Completed",
      palletsCount: 1,
      wrapCount: 2,
      cornersCount: 3,
      laborHours: 1,
      scaleCheck: true,
      debrisFee: true,
      totalAmount: 1,
    },
    sessionId,
  );
  const job = (await update.json()).job;
  expect(job.totalAmount).toBe(calculateJobTotal(job));
  expect(job.rescueMetadata).toBeUndefined();
  const isolated = await JobStore.getJobs(rescueSession(client.id, token));
  expect((await core({ action: "reset" }, sessionId)).status).toBe(200);
  expect(await JobStore.getJobs(rescueSession(client.id, token))).toEqual(
    isolated,
  );
});
test("audit hashes remain chained across reservation, completion, billing and reset", async () => {
  const ledger = await JobStore.getAuditLedger();
  let previous = "0".repeat(64);
  for (const entry of ledger) {
    expect(entry.prevHash).toBe(previous);
    const content = JSON.stringify({
      entryId: entry.entryId,
      timestamp: entry.timestamp,
      sessionId: entry.sessionId,
      jobId: entry.jobId,
      action: entry.action,
      trailerNumber: entry.trailerNumber,
      carrierName: entry.carrierName,
      driverName: entry.driverName,
      bayNumber: entry.bayNumber,
      totalAmount: entry.totalAmount,
      status:
        entry.action === "JOB_RESERVED"
          ? "Reserved"
          : entry.action === "JOB_COMPLETED"
            ? "Completed"
            : "Billed",
      prevHash: entry.prevHash,
    });
    expect(entry.hash).toBe(createHash("sha256").update(content).digest("hex"));
    previous = entry.hash;
  }
});
test("proof remains empty; approved review drafts require permission and cannot be gated on rating", () => {
  expect(approvedCases(client, proof)).toEqual([]);
  const request = {
    clientId: client.id,
    completedJobId: "actual-completed-job",
    completedAt: "2026-09-08T12:00:00Z",
    contactPermission: true,
    optedOut: false,
  };
  expect(buildReviewRequest(client, proof, request)).toBeUndefined();
  const enabled = {
    ...client,
    featureFlags: { ...client.featureFlags, enableGoogleReviews: true },
  };
  const configured = {
    ...proof,
    reviewLink: {
      url: "https://g.page/r/synthetic-test/review",
      verification: {
        source: "manual-verification" as const,
        reference: "synthetic test fixture only",
        verifiedAt: "2026-09-08",
      },
    },
  };
  expect(buildReviewRequest(enabled, configured, request)).toContain(
    "honest review",
  );
  expect(
    buildReviewRequest(enabled, configured, { ...request, optedOut: true }),
  ).toBeUndefined();
  expect(
    buildReviewRequest(enabled, configured, {
      ...request,
      requestedAt: "2026-09-08",
    }),
  ).toBeUndefined();
  expect(
    buildReviewRequest(enabled, configured, { ...request, clientId: "other" }),
  ).toBeUndefined();
  expect(() =>
    approvedCases(client, { ...proof, clientId: "other" }),
  ).toThrow();
});


test("concurrent reservations allocate six distinct bays without losing jobs", async () => {
  const session = "parallel-reservations";
  await JobStore.setJobs(session, []);
  const responses = await Promise.all(Array.from({ length: 10 }, (_, i) => core({ id: `PAR-${i}`, status: "Reserved" }, session)));
  expect(responses.filter(response => response.status === 200)).toHaveLength(6);
  expect(responses.filter(response => response.status === 409)).toHaveLength(4);
  const jobs = await JobStore.getJobs(session);
  expect(jobs).toHaveLength(6);
  expect(new Set(jobs.map(job => job.bayNumber)).size).toBe(6);
});

test("transaction failure rolls back jobs and audit entries and sends no event", async () => {
  const session = "rollback-test";
  await JobStore.setJobs(session, []);
  const before = await JobStore.getAuditLedger();
  let events = 0;
  const stop = JobStore.subscribe(() => events++);
  try {
    await expect(JobStore.transaction(async () => {
      const result = await core({ id: "ROLLBACK", status: "Reserved" }, session);
      expect(result.status).toBe(200);
      throw new Error("Injected failure before commit");
    })).rejects.toThrow("Injected failure");
    expect(await JobStore.getJobs(session)).toEqual([]);
    expect(await JobStore.getAuditLedger()).toEqual(before);
    expect(events).toBe(0);
  } finally { stop(); }
});

test("operational access fails closed, fixes workspace, denies CSRF and reset", async () => {
  process.env.REWORK_MODE = "operations";
  try {
    expect((await GET(new Request(`${origin}/api/jobs`))).status).toBe(503);
    process.env.REWORK_STAFF_USERNAME = "review";
    process.env.REWORK_STAFF_PASSWORD = "test-only-" + "a".repeat(40);
    const authorization = "Basic " + Buffer.from(`${process.env.REWORK_STAFF_USERNAME}:${process.env.REWORK_STAFF_PASSWORD}`).toString("base64");
    expect((await GET(new Request(`${origin}/api/jobs?session=other`))).status).toBe(401);
    expect((await STREAM(new Request(`${origin}/api/jobs/stream?session=other`))).status).toBe(401);
    expect(workspaceId(new Request(`${origin}/api/jobs?session=other`, { headers: { "x-session-id": "forged" } }))).toBe("operations");
    expect(requireStaff(new Request(origin, { headers: { authorization } }))).toBeNull();
    const mutation = (extra: Record<string, string>) => new Request(`${origin}/api/jobs`, { method: "POST", headers: { authorization, "content-type": "application/json", ...extra }, body: JSON.stringify({ action: "reset" }) });
    expect((await POST(mutation({ origin: "https://attacker.invalid" }))).status).toBe(403);
    expect((await POST(mutation({ origin }))).status).toBe(403);
    expect((await GET(new Request(`${origin}/api/jobs?reset=true`, { headers: { authorization } }))).status).toBe(405);
    // Correct credentials cannot turn unavailable durable storage into demo success.
    expect((await GET(new Request(`${origin}/api/jobs`, { headers: { authorization } }))).status).toBe(503);
  } finally {
    process.env.REWORK_MODE = "demo";
    delete process.env.REWORK_STAFF_USERNAME;
    delete process.env.REWORK_STAFF_PASSWORD;
  }
});

test("public intake is create-only, idempotent, and does not return private job data", async () => {
  const session = "public-intake-test";
  await JobStore.setJobs(session, []);
  const payload = { requestId: crypto.randomUUID(), driverName: "Public Driver", driverPhone: "3035550100", carrierName: "Test", trailerNumber: "T1", serviceType: "Shifted Pallets", eta: "30 Mins" };
  const submit = (body: unknown) => INTAKE(new Request(`${origin}/api/intake?session=${session}`, { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body) }));
  expect((await submit({ ...payload, action: "reset" })).status).toBe(400);
  expect((await submit({ ...payload, totalAmount: 1 })).status).toBe(400);
  const result = await (await submit(payload)).json();
  expect(result.job.driverPhone).toBeUndefined();
  expect(result.job.signatureData).toBeUndefined();
  await submit({ ...payload, trailerNumber: "ATTEMPTED CHANGE" });
  const jobs = await JobStore.getJobs(session);
  expect(jobs).toHaveLength(1);
  expect(jobs[0].trailerNumber).toBe("T1");
});
