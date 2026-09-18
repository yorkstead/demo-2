import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { spawn, type ChildProcess } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";
import { Client } from "pg";
import { JobStore } from "../lib/storage";
import { POST, GET } from "../app/api/jobs/route";
import { POST as INTAKE } from "../app/api/intake/route";

// Always creates a disposable local cluster; never uses a configured DATABASE_URL.
const directory = mkdtempSync(join(tmpdir(), "rework-postgres-test-"));
const password = randomBytes(32).toString("hex");
const port = await new Promise<number>((resolve, reject) => {
  const probe = createServer();
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    if (!address || typeof address === "string") return reject(new Error("No test port"));
    probe.close((error) => error ? reject(error) : resolve(address.port));
  });
});
const postgres = new EmbeddedPostgres({
  databaseDir: join(directory, "db"),
  user: "postgres",
  password,
  port,
  persistent: true,
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (message) => console.error(message),
});
let admin: Client | undefined;
let started = false;
let web: ChildProcess | undefined;
try {
  await postgres.initialise();
  await postgres.start();
  started = true;
  process.env.DATABASE_URL = `postgresql://postgres:${password}@127.0.0.1:${port}/postgres`;
  process.env.REWORK_MODE = "operations";
  process.env.REWORK_WORKSPACE_ID = "integration";
  process.env.REWORK_STAFF_USERNAME = "test";
  process.env.REWORK_STAFF_PASSWORD = process.env.REWORK_BROWSER_REVIEW
    ? "synthetic-browser-test-" + "a".repeat(40)
    : randomBytes(32).toString("hex");
  admin = new Client({ connectionString: process.env.DATABASE_URL });
  await admin.connect();
  await admin.query(
    readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"),
  );
  assert.deepEqual(await JobStore.getJobs("integration"), []);
  const results = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      const child = Bun.spawn(
        [process.execPath, "tests/postgres-worker.ts", `CONCURRENT-${i}`],
        { env: process.env, stdout: "pipe", stderr: "pipe" },
      );
      const output = await new Response(child.stdout).text();
      assert.equal(
        await child.exited,
        0,
        await new Response(child.stderr).text(),
      );
      return Number(output.trim());
    }),
  );
  assert.equal(results.filter((status) => status === 200).length, 6);
  assert.equal(results.filter((status) => status === 409).length, 4);
  const jobs = await JobStore.getJobs("integration");
  assert.equal(jobs.length, 6);
  assert.equal(new Set(jobs.map((job) => job.bayNumber)).size, 6);
  let previous = "0".repeat(64);
  for (const entry of await JobStore.getAuditLedger()) {
    assert.equal(entry.prevHash, previous);
    previous = entry.hash;
  }
  console.log(
    "PASS: ten independent processes; six unique bays, no lost jobs, one audit chain.",
  );

  const origin = "http://localhost:3108";
  const authorization =
    "Basic " +
    Buffer.from(
      `${process.env.REWORK_STAFF_USERNAME}:${process.env.REWORK_STAFF_PASSWORD}`,
    ).toString("base64");
  const submit = (body: unknown) =>
    POST(
      new Request(`${origin}/api/jobs?session=forged`, {
        method: "POST",
        headers: { authorization, origin, "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  const updates = await Promise.all(
    [1, 2].map((value) =>
      submit({
        id: jobs[0].id,
        version: jobs[0].version,
        status: "In Progress",
        laborHours: value,
      }),
    ),
  );
  assert.deepEqual(
    updates.map((response) => response.status).sort(),
    [200, 409],
  );
  const other = {
    ...jobs[0],
    id: "PRIVATE-OTHER",
    driverPhone: "DO NOT EXPOSE",
  };
  await JobStore.saveJob("another-workspace", other);
  const audited = await (
    await GET(
      new Request(`${origin}/api/jobs?audit=true&session=another-workspace`, {
        headers: { authorization },
      }),
    )
  ).json();
  assert.ok(
    audited.ledger.every(
      (entry: { sessionId: string }) => entry.sessionId === "integration",
    ),
  );
  console.log(
    "PASS: stale updates rejected; staff audit requests cannot switch workspaces.",
  );
  process.env.REWORK_MODE = "demo";
  const anonymousDemo = await (await GET(new Request(`${origin}/api/jobs?session=integration`))).json();
  assert.ok(anonymousDemo.jobs.every((job: { id: string }) => !job.id.startsWith("CONCURRENT-")));
  const anonymousAudit = await (await GET(new Request(`${origin}/api/jobs?session=integration&audit=true`))).json();
  assert.deepEqual(anonymousAudit.ledger, []);
  process.env.REWORK_MODE = "operations";
  console.log("PASS: anonymous demo namespace cannot select operational jobs or audit entries.");

  const beforeJobs = await JobStore.getJobs("integration");
  const beforeAudit = await JobStore.getAuditLedger();
  let events = 0;
  const unsubscribe = JobStore.subscribe(() => events++);
  await admin.query(
    "CREATE FUNCTION reject_test_write() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'injected failure'; END $$",
  );
  await admin.query(
    "CREATE TRIGGER reject_test_write BEFORE UPDATE ON rework_sessions FOR EACH ROW EXECUTE FUNCTION reject_test_write()",
  );
  const failed = await submit({
    id: jobs[1].id,
    version: jobs[1].version,
    status: "In Progress",
  });
  assert.equal(failed.status, 503);
  assert.deepEqual(await JobStore.getJobs("integration"), beforeJobs);
  assert.deepEqual(await JobStore.getAuditLedger(), beforeAudit);
  assert.equal(events, 0);
  unsubscribe();
  await admin.query("DROP TRIGGER reject_test_write ON rework_sessions");
  console.log(
    "PASS: injected write failure returns 503 and rolls back both job and audit; no success broadcast.",
  );

  // A public caller may create only; arbitrary sessions and extra mutation fields are rejected.
  const bad = await INTAKE(
    new Request(`${origin}/api/intake?session=another-workspace`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    }),
  );
  assert.equal(bad.status, 400);
  // Verify the actual production HTTP/proxy path, not only imported route functions.
  web = spawn(
    "node",
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--port",
      "3109",
      "--hostname",
      "127.0.0.1",
    ],
    {
      env: { ...process.env, NODE_ENV: "production" },
      windowsHide: true,
      stdio: "ignore",
    },
  );
  const base = "http://127.0.0.1:3109";
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      if ((await fetch(base)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, "Production test server must start");
  for (const route of ["/office", "/dock", "/api/jobs", "/api/jobs/stream"]) {
    assert.equal((await fetch(base + route)).status, 401, route);
  }
  for (const route of ["/office", "/dock", "/api/jobs"]) {
    assert.equal(
      (await fetch(base + route, { headers: { authorization } })).status,
      200,
      route,
    );
  }
  assert.equal((await fetch(base + "/reserve")).status, 200);
  // Synthetic demo input cannot be used to write to the operational database.
  assert.equal(
    (await fetch(base + "/denver-express/api/rescue", { method: "POST" }))
      .status,
    404,
  );
  console.log(
    "PASS: production HTTP pages/API/stream deny anonymous access; valid staff credentials work; driver page stays public.",
  );
  if (process.env.REWORK_BROWSER_REVIEW) {
    console.log(
      "Browser review ready at http://127.0.0.1:3109; press Enter to stop.",
    );
    await new Promise<void>((resolve) => {
      process.stdin.once("data", () => resolve());
      process.stdin.resume();
    });
    process.stdin.pause();
  }
  web.kill();
  web = undefined;
  await admin.end();
  admin = undefined;
  await postgres.stop();
  started = false;
  assert.equal(
    (
      await GET(
        new Request(`${origin}/api/jobs`, { headers: { authorization } }),
      )
    ).status,
    503,
  );
  console.log(
    "PASS: database outage returns 503; no local or synthetic fallback.",
  );
} finally {
  web?.kill();
  if (admin) await admin.end();
  if (started) await postgres.stop();
}

// Bun on Windows can retain runtime handles after the fixture has stopped all
// servers. Only exit successfully after every assertion and awaited cleanup;
// thrown assertions or cleanup errors never reach this line.
process.exit(0);
