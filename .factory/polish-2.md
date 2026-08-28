# Release Ledger — polish round 2

Live URL: <https://retainer-release-ledger.sociobot.in>

This pass rechecked every finding in `review-1.md`, `polish-1.md`, and `review-2.md`. Local visual evidence is [mobile demo](evidence/polish-2-demo-mobile.png), [desktop demo](evidence/polish-2-demo-desktop.png), and [404](evidence/polish-2-404.png). Live evidence is recorded after deployment in the handoff.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the plain job, audience, and sample-action first screen. | `@claim:accessible-responsive`; mobile cold check. |
| F-1-2 / F-2-1 | Demo-boundary links now use a document navigation, so `/`, `/demo`, and `?demo=1` select the correct IndexedDB namespace before app startup. | `@claim:demo-isolation`; demo screenshots. |
| F-1-3 / F-2-2 | The demo claim now clicks the visible home CTA, then checks direct `/demo` and `?demo=1` routes. | `@claim:demo-isolation`. |
| F-1-4 / RL-QA-001 | Preserved held status and exact excess protection for unsafe releases and refunds. | `@claim:release-status`; calculation unit tests. |
| F-1-5 / RL-QA-002 | Kept unavailable purchase and license code out of the product. | `@claim:no-purchase-required`; build/source search. |
| F-1-6 / RL-QA-003 | Kept full backup validation before the single IndexedDB transaction. | `invalid import is atomic…`. |
| F-1-7 / RL-QA-004 | Kept finite-cent validation and the 10,000,000 maximum. | calculation unit tests; `invalid import…` browser regression. |
| F-1-8 / RL-QA-005 | Kept the broken license/entitlement path removed. | `@claim:no-purchase-required`; no checkout/license controls. |
| F-1-9 / RL-QA-006 | Kept formula-neutral CSV cells. | CSV unit and browser regression. |
| F-1-10 / RL-QA-007 | Kept 44 px header/footer targets at 390 px. | `@claim:accessible-responsive`. |
| F-1-11 / RL-QA-009 | Kept stable toast and route live regions outside app replacement. | `creates a job, announces an entry…`. |
| F-1-12 / RL-QA-010 | Kept initial document focus and client-route h1 focus/announcement. | `route metadata, focus…`. |
| F-1-13 / RL-QA-011 | Kept CSP, frame protection, Permissions-Policy, manifest MIME, and immutable assets. | `public/staticwebapp.config.json`; live header check. |
| F-1-14 | Kept a configured 404 response and return path. | `static 404 has product metadata…`; live unknown-route check. |
| F-1-15 / F-2-9 | Added canonical, description, OG/Twitter, favicon, apple touch icon, header, and footer to the static 404. | `static 404 has product metadata…`; 404 screenshot. |
| F-1-16 / F-2-4 | Kept shared app skeleton and made demo ↔ real/legal navigation a safe full navigation. | `@claim:demo-isolation`; route test. |
| F-1-17 / F-2-8 | Replaced vague headings, PWA jargon, and `later payment` with `balance payment`; updated audit. | `.factory/copy-audit.md`; README check. |
| F-1-18 | Kept all five entry types and status arithmetic in the sample. | `@claim:release-status`. |
| F-1-19 / F-2-5 | Registered custody, payment-processing, escrow, and no-bank promises in the privacy claim and tested request/UI behavior. | `@claim:browser-privacy`; `.factory/claims.json`. |
| F-1-20 | Kept JSON and CSV import/export coverage. | `@claim:data-export`. |
| F-1-21 / F-2-6 | Replaced the absolute wording with a bounded no-purchase promise and tested a fourth demo job, receipt, and export. | `@claim:no-purchase-required`. |
| F-1-22 | Kept merchant/subscription wording removed with checkout. | `@claim:no-purchase-required`; source search. |
| F-1-23 | Kept separate demo storage and tested it from the public CTA. | `@claim:demo-isolation`. |
| F-1-24 / F-2-7 | Registered analytics, advertising, and online-copy wording; request test now spans mutation, receipt, privacy, and terms. | `@claim:browser-privacy`. |
| F-1-25 | Kept offline sample reload coverage. | `@claim:offline-reload`. |
| F-1-26 | Kept keyboard, theme, legal, mobile, target, and Axe coverage. | `@claim:accessible-responsive`; all-pages Axe test. |
| F-1-27 | Kept boundary and state-transition coverage. | calculation unit tests; `@claim:release-status`. |
| F-1-28 | Kept receipt/PDF and editable record coverage. | `@claim:client-receipt`. |
| F-1-29 | Kept text labels, reasons, and visible totals for every status. | `@claim:release-status`. |
| F-1-30 | Kept precise concrete entry wording. | README and `@claim:release-status`. |
| F-1-31 | Kept unshipped billing configuration claims removed. | source/build search. |
| F-1-32 | Kept concrete browser-storage wording. | `@claim:browser-privacy`. |
| F-2-3 | Added a populated Northstar sample card above demo artwork on phones: client, received amount, Ready reason, and latest entry. | `evidence/polish-2-demo-mobile.png`; `@claim:demo-isolation`. |

## Verification

- `npm test`: 7/7 passed.
- `npm run build`: passed; `dist/` created; initial JS 40.71 kB (12.35 kB gzip), CSS 24.85 kB (6.30 kB gzip).
- `npm run test:e2e`: 26/26 passed in desktop Chromium and 390 px Chromium; serious/critical Axe violations: 0.
- Every command in `.factory/claims.json` was run separately after the final commit from a clean clone; results are in `.factory/handoff.md`.
