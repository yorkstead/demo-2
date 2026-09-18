# Public demo shell — 2026-09-08

Baseline: `53f4705`. The client shell is isolated under `/denver-express` with eight intent pages driven by `lib/client-config/clients/denver-express-presentation.ts`. Generic shell, actions and service renderer live in `components/client`. Both route generation and rendering filter verified public capabilities. Unknown slugs return 404; no keyword-variant pages are created.

The authoritative capability matrix in 03 takes precedence over speculative examples in 02/04: no axle legalization, guaranteed same-day service, cold storage, bay reservation promises, hardware-specific recovery claims or unverified customer relationships appear in this layer. Existing baseline screens retain their demo behavior.

No global visual styles or launchpad changes. The navy/slate/gold visual language is retained. Client layout enables zoom without changing the root viewport. Each page has unique demo metadata and permanently uses noindex/nofollow. Namespaced response headers add X-Robots-Tag. Robots now covers the namespace root as well as descendants; sitemap stays unchanged. Robots exclusion alone is not an indexing guarantee; noindex is also emitted. No demo canonical points to a fictitious production URL, and no service/FAQ/review rich-result claims are emitted. Production schema and canonicals require a confirmed live route mapping.

Registry path matching was narrowed to an exact namespace boundary so `/denver-express-other` cannot resolve to this client.

Baseline lint: six existing errors (five set-state-in-effect findings and one dock purity finding). Preserve these as documented baseline debt rather than altering unrelated behavior. Full final verification is recorded in 12-pre-pitch-readiness.md.
