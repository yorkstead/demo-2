# Operational security and storage release

## Deployment identity

This folder is the Next.js application in `yorkstead/rework-flow`. The sibling `../demo` folder contains an older standalone HTML prototype. The separate Yorkstead `operations` repository and `ops.yorkstead.com` are not this app.

GitHub reports commit `c5c17948fd99812364c3116c6e8c1cbc97797e0f` successfully deployed to `rework-flow-n7nocozjp-yorkstead.vercel.app`. The current `rework.yorkstead.com` host responds from Vercel. The connected Vercel integration only exposes the unrelated `operations` project, so the Rework project's environment, alias assignment, and database binding still require verification before activation.

## Required configuration

Production defaults to operational mode and fails closed when access or storage is missing.

| Setting | Required value |
| --- | --- |
| `REWORK_MODE` | `operations` for customer work. `demo` explicitly enables anonymous synthetic demonstrations. |
| `REWORK_STAFF_USERNAME` | Chosen staff username. |
| `REWORK_STAFF_PASSWORD` | Random password of at least 32 characters; generate 32 random bytes and encode as hex. Store in the hosting secret settings and a password manager, never source control. |
| `REWORK_WORKSPACE_ID` | Stable, server-controlled workspace name, e.g. `denver-express-operations`. Do not point at an old synthetic session. |
| `DATABASE_URL` | Verified Postgres database for this deployment; use the provider's TLS connection settings. |

Staff use the browser's sign-in prompt for `/office` and `/dock`. This is a shared staff credential, not individual employee accounts or per-role permissions. Change the password to revoke access. Use HTTPS on hosted deployments.

The driver `/reserve` page remains public and submits to `/api/intake`. That endpoint can only create a reservation. It cannot read the queue, set billing amounts, update jobs, select an operational workspace, or reset data. The synthetic `/denver-express/api/rescue` endpoint is disabled in operations mode.

The database schema is checked in at `db/schema.sql`. It uses the existing table layout. Apply it to an isolated database first; verify the exact production database before applying it there. The application no longer creates schema during ordinary requests.

## Storage behavior

- Postgres transactions cover current-state reads, bay allocation, job updates, and audit entries. A transaction-scoped advisory lock serializes writers across server instances and maintains the existing global audit hash chain.
- Existing operational jobs require their current `version` on update (legacy jobs start at version 0). Conflicts return 409 rather than silently overwriting another device's work.
- Database errors return 503. There is no fallback to Redis, memory, local files, or sample jobs. Notifications are sent only after commit.
- Live streams read durable storage so updates from other instances appear.
- Audit API reads are scoped to the authenticated workspace. Demo database sessions are prefixed with `demo:` so an anonymous demo cannot select an operational workspace.
- The local filesystem adapter is only for a single-process demo. It commits jobs and audit entries in one atomic file replacement. Hosted demos require Postgres.
- Old unprefixed demo sessions are not automatically migrated into the new demo namespace. Keep existing data backed up and choose a clean operational workspace deliberately.
- Stop/drain old-version writes during deployment: the old application does not participate in the new transaction lock. Rollback to the old code also restores the old security/storage weaknesses.

## Verification

Run `bun run test`, `bun run typecheck`, `bun run lint`, and `bun run build`.

After building, run `bun run test:postgres`. It creates a disposable, loopback-only Postgres cluster with random credentials, applies the schema, and verifies:

1. Ten independent application processes yield six unique bay reservations and four capacity conflicts.
2. No jobs disappear and the audit hash chain remains linked.
3. Stale concurrent updates are rejected.
4. An injected database write failure rolls back the job and audit entry and emits no success event.
5. Staff cannot switch workspaces to inspect another audit ledger.
6. Actual production HTTP pages, API, and SSE reject anonymous requests; valid credentials work.
7. A database outage returns an error rather than synthetic/local success.

The fixture never uses the existing `.env.local` database connection. It selects an available loopback port for Postgres and uses 3109 for the production HTTP test server. Temporary test data is retained under the OS temp directory for diagnosis; the fixture stops its servers and explicitly exits after successful assertions and cleanup to avoid retained Bun handles on Windows.

## Activation gate

Configure and verify the **rework-flow** hosting project before merging/deploying this release. Do not deploy these defaults to the existing host without staff credentials: it will intentionally deny access. Verify the domain alias, database binding, credentials, live phone-to-dock flow, backup/restore, and real tablet/camera behavior separately. Passing these code checks is not proof of those live checks or full customer acceptance.
