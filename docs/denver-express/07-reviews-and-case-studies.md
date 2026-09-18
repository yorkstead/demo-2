# Reviews and case studies — 2026-09-08

Reusable contracts and eligibility helpers: `lib/client-proof/types.ts`. Client proof configuration: `lib/client-config/clients/denver-express-proof.ts`. Preview: `/denver-express/proof`.

No customer reviews, ratings, counts, case stories or performance numbers have been supplied. The collection is empty, review and case flags remain off, and no review/aggregate-rating/Article schema is emitted. The existing GBP `claimed` field is not proof of owner access, and a maps address search URL is not a verified review deep link.

## Review request operations

1. Staff confirms an actual completed job and permission to contact that customer.
2. Check opt-out and prior request status. Invite customers consistently, regardless of satisfaction. Do not offer an incentive or ask for five stars.
3. Obtain the business’s actual review link from its owner-managed GBP account. Record source, verification date and reviewer. Enable the flag only after verifying the link belongs to the correct location.
4. Generate a neutral draft with `buildReviewRequest`. This utility sends nothing. Approved sending and an auditable request log are later integrations.
5. Reply thoughtfully without disclosing freight/customer details. Track requests sent and opt-outs as operational measures, not invented reviews.

Draft: “Thank you for working with Denver Express. If you would like to share your experience, you can leave an honest review using our review link. All feedback is welcome. This is optional.” Insert the verified link only after owner confirmation.

Google requires genuine experiences and prohibits incentives. Its guidance supports asking with a review link and valuing balanced feedback: [Google review guidance](https://support.google.com/business/answer/3474122?hl=en), consulted 2026-09-08.

## Case-study capture template

- Client and internal job reference (keep customer identifiers private).
- Approved public title and supported service.
- Problem: actual rejection/handling need, with source evidence.
- Work performed: dated operational notes and redacted before/after evidence.
- Outcome: what can be demonstrated. Receiver acceptance, time savings and dollars saved each require their own evidence.
- Metrics: value, definition, source and verification date; omit unknowns.
- Permission: customer publication approval, image/brand rights and approved public attribution.
- Editorial status: draft, reviewer, approval date, source reference.

`approvedCases` suppresses wrong-client, unsupported, unapproved, permissionless and unsourced records. Preview never promotes demo jobs automatically. Future publication needs substantive editorial text, duplicate-intent review and approved production routing; Article schema only when the resulting page actually merits it.
