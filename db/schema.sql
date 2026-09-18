-- Existing schema, checked into source control. Run on a verified database before launch.
BEGIN;
CREATE TABLE IF NOT EXISTS rework_sessions (
  session_id TEXT PRIMARY KEY,
  jobs JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS rework_audit_ledger (
  id SERIAL PRIMARY KEY,
  entry JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMIT;
