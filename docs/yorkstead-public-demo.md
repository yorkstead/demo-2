# Yorkstead public demo companion

The public flagship experience is implemented in `core/operations` at `/rework`, with the case study in `core/website` at `/work/rework-flow`.

The fictional Juniper Freight Lab environment runs entirely in browser memory. It does not reuse this application's API, Redis keys, disk store, audit ledger, branding, photography, PWA, or client configuration. No runtime files in this client checkout were changed for the public demo.

Source reference: revision `6ac984f8027a1698ffebd885967384b0ce6e8083`. Operations carries a pure snapshot of `lib/types.ts` from `export const RATES` onward. Run `bun scripts/check-rework-demo-source.ts <absolute-path-to-this-checkout>` from Operations when pricing changes. The source six-bay / 45-minute hold concept is represented by a single-load scenario model, not a live capacity allocator.

Existing dock completion requires a signature. The public refusal scenario records refusal and holds completion until a simulated driver return/sign-off; no unsigned completion policy was added here. Public quantity review and damage acknowledgment are teaching extensions. Shared-session defaults and global audit behavior were observed in this application's API, so it must not be reverse-proxied into the anonymous public demo.

See Operations `docs/adr/0030-public-rework-demo.md` and `docs/PUBLIC_REWORK_DEMO.md` for architecture, deployment, and verification.
