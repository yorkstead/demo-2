# Production integration and handoff

Prepared 2026-09-08. No production website, DNS, hosting, database, GBP or notification settings were changed. This repository remains a Yorkstead demonstration until the following release gates are satisfied.

## Integration choices

Preferred first discussion: enhance Denver Express's existing service pages and link them to an approved production intake on an agreed domain. This preserves existing content and lets the operating workflow be introduced separately. Alternative: port the config-driven components into the actual site stack after its repository, routes, hosting and deployment process are inspected. Do not assume its stack or replace its home page.

| Demo intent | Production disposition to approve |
| --- | --- |
| Freight rework | Retain and improve existing `/rework`. |
| Cross-docking | Inspect the live page/section and backlinks; retain existing authority. `/cross-docking` is only a candidate until inventory confirms it. |
| Transloading | Confirm whether a distinct page is justified versus existing cross-dock content. |
| Rejected load, shifted load, restacking, repalletizing | Review Search Console and existing content before choosing distinct routes or sections on `/rework`. The demo routes are content prototypes, not an instruction to publish eight new URLs. |
| Short-term staging | Integrate with the appropriate existing warehousing/staging content or approve a distinct useful page. |
| Freight Rescue | Choose a production endpoint and intake URL only after privacy, triage and ownership are implemented. |
| Pitch, proof preview | Remain internal/noindex. Publish only independently approved real case evidence. |

## SEO release gates

Inventory live routes, redirects, titles, descriptions, canonicals, sitemap and current indexed pages. Preserve inbound-link targets. Approve a one-intent-to-one-authority map with real 200-status production URLs. Add redirects only when replacing an existing URL intentionally. Keep Yorkstead previews noindex/nofollow and out of its sitemap after production launch.

Generate production metadata against the verified production origin and actual path mapping. Demo metadata deliberately suppresses canonicals rather than inventing URLs on the client's domain. Validate unique title/description/canonical per production page, internal links, mobile usability, rendered robots, sitemap membership and redirect behavior.

Structured data must match visible facts. Existing generic SEO builders are infrastructure, not a release certificate: the current LocalBusiness helper assumes weekday opening hours and uses the receiving cutoff as closing time; do not use it unchanged for a 4pm close. The Service helper uses taxonomy descriptions and category values; review schema types and exact client copy before production emission. Use Organization/LocalBusiness, Service, BreadcrumbList and WebPage only with correct supported data. FAQ is optional and only for visible Q&A; no commercial rich-result promise. Article applies only to genuine approved editorial content. Do not emit invented ratings.

## Operational release gates

- Add a pending-triage intake state before any reservation. Define the owner, response hours, escalation and acceptance criteria; missed responses must have a documented fallback.
- Authenticate staff; enforce tenant authorization at every read/write, evidence and audit endpoint. Remove default demo identity, reset access and seeded data from production. Query/session IDs alone are not authorization.
- Replace demo assumptions with approved service labels, rates, tax/accounting rules, bay identifiers and availability policies. Weight checks must not become axle legalization.
- Use durable transactional storage, atomic idempotency and capacity allocation. Fail closed when persistence is unavailable. Current JobStore fallback behavior is a demo limitation.
- Use private evidence storage and controlled access. Define maximum file size/count, actual image decoding/re-encoding, malware/file handling, retention, deletion, backups and access logging. Obtain appropriate customer authorization. Never put BOL/contact details in analytics or public case content.
- Ensure original request context, changes, consent and evidence have suitable audit coverage. The baseline hash covers selected fields, not full photos/intake content; job status is hashed but omitted from ledger entries, limiting independent reconstruction for generic updates.
- Integrate approved dispatch notifications with delivery status and retry behavior. A successful database save is not proof a person was notified.
- Scope service worker caching so staff/private pages and evidence are not indiscriminately cached; verify offline behavior and sign-out data handling. Baseline PWA behavior is unchanged here.

## Accounting and device acceptance

QuickBooks: identify Online vs Desktop, company file, customer naming, item/account mappings, terms, tax rules and duplicate invoice handling. Existing CSV/IIF exports are previews. Test quoting, spreadsheet formula payloads and actual import in a disposable company/test context before production; no import was performed in this implementation.

Dock SOP: pair same authorized client context, confirm request and receiver requirements, inspect freight, capture before evidence, perform approved work, capture after evidence and real signature, review total, dispatch certificate, verify office receipt. Test rear camera, denied permissions, landscape signature, wake lock, audible alert, print layout and PWA installation on target devices. Demonstration timestamps/GPS overlays are not independently verified location evidence.

## Deployment, rollback and acceptance

1. Identify exact repository, branch, project/root, hosting environment, domain, database and storage resources. Record the deployed revision and provider binding without exposing credentials.
2. Back up route/content configuration and data as appropriate. Deploy a preview with synthetic fixtures only. Verify noindex and blocked notification sending.
3. Run contract, negative-input, authorization, tenant isolation, persistence failure, retry, mobile and target-device tests. Obtain content and operational sign-off.
4. Release approved production paths and metadata; verify the exact domain and deployed commit, canonical/robots/sitemap and real request receipt in the authorized workflow.
5. Observe errors and intake delivery; roll back the deployment and route changes if agreed acceptance criteria fail. Preserve submitted requests; do not solve a rollout failure by dropping data.
6. Compare a documented baseline with later qualified inquiries and response metrics. Report observed results separately from projections.

Owners to assign: client operations lead, site/GBP owner, Yorkstead implementation lead, accounting reviewer and privacy/security owner. Production acceptance requires their confirmed responsibilities and a completed readiness record.
