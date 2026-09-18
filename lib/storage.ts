import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, type PoolClient } from "pg";
import { ReworkJob, AuditLogEntry } from "./types";
import { INITIAL_JOBS } from "./mock-data";
import { isDemoMode } from "./access";

export const ALL_BAYS = [
  "Bay 1",
  "Bay 2",
  "Bay 3",
  "Bay 4",
  "Bay 5",
  "Bay 6",
] as const;
export const HOLD_DURATION_MS = 45 * 60 * 1000;
type JobEvent = {
  sessionId: string;
  action: string;
  job?: ReworkJob;
  jobs?: ReworkJob[];
};
type LocalState = {
  sessions: Record<string, ReworkJob[]>;
  ledger: AuditLogEntry[];
};
type Transaction = {
  client?: PoolClient;
  local?: LocalState;
  dirty: boolean;
  events: JobEvent[];
};
const transactions = new AsyncLocalStorage<Transaction>();
declare global {
  var __reworkSessionsStore: Map<string, ReworkJob[]> | undefined;
  var __reworkAuditLedger: AuditLogEntry[] | undefined;
  var __reworkJobListeners: Set<(event: JobEvent) => void> | undefined;
}
globalThis.__reworkJobListeners ??= new Set();
let localTail: Promise<void> = Promise.resolve();
function databaseSession(sessionId: string) {
  return isDemoMode() ? `demo:${sessionId}` : sessionId;
}

function localFile() {
  return path.join(process.cwd(), ".data", "transactional-store.json");
}
function readLocal(): LocalState {
  if (fs.existsSync(localFile()))
    return JSON.parse(fs.readFileSync(localFile(), "utf8"));
  // One-time import of legacy local demo data. Corruption is an error, not a reseed.
  const jobs = path.join(process.cwd(), ".data", "jobs-store.json");
  const audit = path.join(
    process.cwd(),
    ".data",
    "immutable-audit-ledger.jsonl",
  );
  return {
    sessions: fs.existsSync(jobs)
      ? JSON.parse(fs.readFileSync(jobs, "utf8"))
      : {},
    ledger: fs.existsSync(audit)
      ? fs
          .readFileSync(audit, "utf8")
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line))
      : [],
  };
}
function commitLocal(state: LocalState) {
  const filename = localFile();
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${crypto.randomUUID()}.tmp`;
  const fd = fs.openSync(temporary, "wx");
  try {
    fs.writeFileSync(fd, JSON.stringify(state));
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  try {
    fs.renameSync(temporary, filename);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

export class JobStore {
  /** One transaction/client covers allocation, job mutation, and audit append.
   * A transaction-scoped lock serializes the legacy global audit chain as well.
   * Operational storage never falls back to memory, disk, or Redis.
   */
  static async transaction<T>(work: () => Promise<T>): Promise<T> {
    if (transactions.getStore()) return work();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString && !isDemoMode())
      throw new Error("Operational storage requires DATABASE_URL");
    if (connectionString) {
      const pool = new Pool({
        connectionString,
        max: 1,
        connectionTimeoutMillis: 5000,
        query_timeout: 15000,
      });
      let client: PoolClient | undefined;
      try {
        client = await pool.connect();
        await client.query("BEGIN");
        await client.query("SET LOCAL lock_timeout = '10s'");
        await client.query("SET LOCAL statement_timeout = '15s'");
        await client.query("SELECT pg_advisory_xact_lock(6030130)");
        const tx: Transaction = { client, dirty: false, events: [] };
        const result = await transactions.run(tx, work);
        await client.query("COMMIT");
        tx.events.forEach((event) => this.broadcast(event));
        return result;
      } catch (error) {
        if (client) {
          try {
            await client.query("ROLLBACK");
          } catch {}
        }
        throw error;
      } finally {
        client?.release();
        await pool.end();
      }
    }
    // Single-process local demos only. Hosted deployments require durable storage.
    if (process.env.VERCEL)
      throw new Error("Hosted demos require DATABASE_URL");
    const previous = localTail;
    let release!: () => void;
    localTail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      const tx: Transaction = { local: readLocal(), dirty: false, events: [] };
      const result = await transactions.run(tx, work);
      if (tx.dirty) commitLocal(tx.local!);
      tx.events.forEach((event) => this.broadcast(event));
      return result;
    } finally {
      release();
    }
  }

  static async getJobs(sessionId: string): Promise<ReworkJob[]> {
    return this.transaction(async () => {
      const tx = transactions.getStore()!;
      if (tx.client) {
        const { rows } = await tx.client.query(
          "SELECT jobs FROM rework_sessions WHERE session_id = $1",
          [databaseSession(sessionId)],
        );
        if (rows.length) return rows[0].jobs;
      } else if (Object.hasOwn(tx.local!.sessions, sessionId))
        return structuredClone(tx.local!.sessions[sessionId]);
      return isDemoMode() ? structuredClone(INITIAL_JOBS) : [];
    });
  }
  static async setJobs(sessionId: string, jobs: ReworkJob[]): Promise<void> {
    return this.transaction(async () => {
      const tx = transactions.getStore()!;
      if (tx.client)
        await tx.client.query(
          "INSERT INTO rework_sessions(session_id, jobs, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT(session_id) DO UPDATE SET jobs = EXCLUDED.jobs, updated_at = NOW()",
          [databaseSession(sessionId), JSON.stringify(jobs)],
        );
      else {
        Object.defineProperty(tx.local!.sessions, sessionId, {
          value: structuredClone(jobs),
          enumerable: true,
          configurable: true,
          writable: true,
        });
        tx.dirty = true;
      }
    });
  }
  static async getAuditLedger(sessionId?: string): Promise<AuditLogEntry[]> {
    return this.transaction(async () => {
      const tx = transactions.getStore()!;
      if (tx.client) {
        const result = sessionId
          ? await tx.client.query(
              "SELECT entry FROM rework_audit_ledger WHERE entry->>'sessionId' = $1 ORDER BY id ASC",
              [databaseSession(sessionId)],
            )
          : await tx.client.query(
              "SELECT entry FROM rework_audit_ledger ORDER BY id ASC",
            );
        return result.rows.map((row) => row.entry);
      }
      return structuredClone(
        tx.local!.ledger.filter(
          (entry) => !sessionId || entry.sessionId === sessionId,
        ),
      );
    });
  }
  static async recordAuditEntry(
    sessionId: string,
    action: AuditLogEntry["action"],
    job: ReworkJob,
  ): Promise<AuditLogEntry> {
    return this.transaction(async () => {
      const ledger = await this.getAuditLedger();
      const prevHash = ledger.at(-1)?.hash || "0".repeat(64);
      const entryId = `AUD-${crypto.randomUUID()}`;
      const timestamp = new Date().toISOString();
      if (transactions.getStore()!.client)
        sessionId = databaseSession(sessionId);
      const content = {
        entryId,
        timestamp,
        sessionId,
        jobId: job.id,
        action,
        trailerNumber: job.trailerNumber,
        carrierName: job.carrierName,
        driverName: job.driverName,
        bayNumber: job.bayNumber,
        totalAmount: job.totalAmount,
        status: job.status,
        prevHash,
      };
      const entry: AuditLogEntry = {
        ...content,
        driverPhone: job.driverPhone,
        hasSignature: Boolean(
          job.signatureData && job.signatureData.length > 50,
        ),
        photoCount:
          job.beforePhotos.filter(Boolean).length +
          job.afterPhotos.filter(Boolean).length,
        hash: crypto
          .createHash("sha256")
          .update(JSON.stringify(content))
          .digest("hex"),
      };
      const tx = transactions.getStore()!;
      if (tx.client)
        await tx.client.query(
          "INSERT INTO rework_audit_ledger(entry, created_at) VALUES ($1::jsonb, NOW())",
          [JSON.stringify(entry)],
        );
      else {
        tx.local!.ledger.push(entry);
        tx.dirty = true;
      }
      return entry;
    });
  }
  static async saveJob(sessionId: string, job: ReworkJob): Promise<ReworkJob> {
    return this.transaction(async () => {
      const jobs = await this.getJobs(sessionId);
      const action =
        job.status === "Reserved"
          ? "JOB_RESERVED"
          : job.status === "Completed"
            ? "JOB_COMPLETED"
            : job.status === "Billed"
              ? "JOB_BILLED"
              : "JOB_UPDATED";
      const audit = await this.recordAuditEntry(sessionId, action, job);
      const saved = { ...job, auditHash: audit.hash };
      const updated = jobs.some((existing) => existing.id === job.id)
        ? jobs.map((existing) => (existing.id === job.id ? saved : existing))
        : [saved, ...jobs];
      await this.setJobs(sessionId, updated);
      transactions
        .getStore()!
        .events.push({ sessionId, action, job: saved, jobs: updated });
      return saved;
    });
  }
  static async resetJobs(sessionId: string): Promise<ReworkJob[]> {
    if (!isDemoMode()) throw new Error("Reset is disabled in operations mode");
    return this.transaction(async () => {
      const jobs = structuredClone(INITIAL_JOBS);
      await this.setJobs(sessionId, jobs);
      await this.recordAuditEntry(sessionId, "SESSION_RESET", {
        ...jobs[0],
        id: `RESET-${Date.now()}`,
        trailerNumber: "ALL",
        carrierName: "SYSTEM RESET",
        driverName: "OPERATOR",
        bayNumber: "ALL",
        totalAmount: 0,
        signatureData: "",
        beforePhotos: [],
        afterPhotos: [],
        status: "Billed",
      });
      transactions
        .getStore()!
        .events.push({ sessionId, action: "SESSION_RESET", jobs });
      return jobs;
    });
  }
  static subscribe(callback: (event: JobEvent) => void): () => void {
    globalThis.__reworkJobListeners!.add(callback);
    return () => {
      globalThis.__reworkJobListeners!.delete(callback);
    };
  }
  static broadcast(event: JobEvent): void {
    for (const listener of globalThis.__reworkJobListeners!) {
      try {
        listener(event);
      } catch {}
    }
  }
  static isHoldExpired(job: ReworkJob): boolean {
    return (
      job.status === "Reserved" &&
      (job.expiresAt
        ? Date.parse(job.expiresAt)
        : Date.parse(job.createdAt) + HOLD_DURATION_MS) <= Date.now()
    );
  }
  static async allocateBay(
    sessionId: string,
    requestedBay?: string,
  ): Promise<{ bayNumber: string; expiresAt: string } | null> {
    const jobs = await this.getJobs(sessionId);
    const occupied = new Set(
      jobs
        .filter(
          (job) =>
            job.status === "In Progress" ||
            job.status === "Completed" ||
            (job.status === "Reserved" && !this.isHoldExpired(job)),
        )
        .map((job) => job.bayNumber),
    );
    const bay =
      ALL_BAYS.find((bay) => bay === requestedBay && !occupied.has(bay)) ||
      ALL_BAYS.find((bay) => !occupied.has(bay));
    return bay
      ? {
          bayNumber: bay,
          expiresAt: new Date(Date.now() + HOLD_DURATION_MS).toISOString(),
        }
      : null;
  }
}
