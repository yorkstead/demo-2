# Freight Rescue integration — 2026-09-08

## Demonstration contract

`/denver-express/freight-rescue` collects contact name, phone, problem and requested service, with optional load context and up to three images. The user must acknowledge synthetic demo data. The new namespaced POST adapter validates the configured client, capability, same origin, strict schema, actual streamed size (2 MB) and raster signatures. Client-supplied client/source/status/price values are rejected. Photos are resized and converted to JPEG in the browser, stripping original file metadata; no new vendor or upload credentials are introduced.

The adapter delegates to `POST /api/jobs`; there is no separate lead database or competing workflow. A generated request UUID becomes the job ID, and a client-prefixed UUID session separates the demo from `demo-main`. The adapter does not forward the core session cookie. Retrying a saved request ID returns the existing receipt. This check is not a distributed transaction or a concurrency guarantee; production needs atomic idempotency and bay allocation.

The legacy engine has no triage state. For demonstration only, submission creates a `Reserved` job with generic service label `Freight Rescue`, zero initial supplies/total and explicit quote-required text. The receipt states that the existing 45-minute hold is simulated. This does not contact the client, book a real dock or confirm a price. Real requests use the configured phone number.

## Necessary protected-file changes

| File | Change | Reason |
| --- | --- | --- |
| `lib/types.ts` | Optional `rescueMetadata`; additional `Freight Rescue` label | Represent intake without falsely mapping cross-dock/staging to axle or pallet work |
| `app/api/jobs/route.ts` | Optional strict metadata validation, client/session/capability check, preserve original metadata | Existing API otherwise strips new fields and loses source, requirements and evidence on updates |
| `app/dock/page.tsx` | Derive service union; show rescue requirements; load intake photos; clear inherited evidence/signature; preserve problem tags; clear rescue context on next job | Preserve existing four service choices while avoiding sample evidence and fabricated defect tags on rescue check-in; empty images show a placeholder |

Storage, allocation, billing calculations, sound, office, reserve, PWA, maps and commercial files are unchanged. Old payloads receive no new metadata field. Original intake photos and details remain in metadata even when operators replace working before/after images. Pitch Mode provides a readable intake inspector; the original office UI still uses its standard certificate.

## Storage and security boundary

The existing JobStore uses memory, local disk and optional Redis/KV. Demo data and images inherit that storage and its existing failure behavior. Session identifiers are not authentication. The baseline audit endpoint exposes a global ledger; local/KV writes and concurrent allocation are not hardened production transactions. A default session may be fetched momentarily by legacy screens before their query session effect runs. The service worker retains baseline behavior. These limitations preclude real personal/customer documents in this demo.

Production requires staff authentication and authorization, a real pending-triage state, tenant-scoped reads/audits, private object evidence with retention/deletion, consent and request-abuse controls, durable transactional persistence, atomic retry handling, and verified rates/receiving rules. Keep demo fixtures and pricing out of production. Review the complete rollout gates in 11-production-integration.md.
