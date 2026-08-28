# Release Ledger — polish round 1

Live URL: <https://retainer-release-ledger.sociobot.in>

Primary visual evidence: [mobile home](evidence/live/home-mobile.png), [mobile demo](evidence/live/demo-mobile.png), and [cold-check results](evidence/live/cold-check.json).

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced the metaphorical headline with the required job, audience, sample action, outcome note, and three facts. Mobile puts all of them before the artwork. | `@claim:accessible-responsive`; live mobile screenshot; CTA y=410 and facts y=592 in 390×844. |
| F-1-2 | Added `/demo` and `?demo=1`, three seeded jobs, `demo:release-ledger`, a persistent banner, Reset demo, and Start for real with database deletion. | `@claim:demo-isolation`; live demo screenshot; separate demo and real databases. |
| F-1-3 | Added seven claims with exactly one tagged observable test each. | `.factory/claims.json`; clean-clone registry run passed every command in both projects. |
| RL-QA-001 / F-1-4 | Excess releases and excess refunds now force Hold and state the exact excess. | `@claim:release-status`; unit boundaries; live shows Hold and the exact excess. |
| RL-QA-002 / F-1-5 | Removed the unavailable purchase, license gate, three-job limit, and merchant claims. All features now work without purchase. | Live `purchaseLinkCount: 0`; no `/checkout` link in the build. |
| RL-QA-003 / F-1-6 | Validates the complete backup first, then writes all stores in one IndexedDB transaction. | Regression `invalid import is atomic…` asserts zero jobs after a valid-prefix/invalid-tail import. |
| RL-QA-004 / F-1-7 | Capped amounts at 10,000,000 and checks input and cent conversion for finiteness. | Unit maximum test; browser regression rejects `1e308`. |
| RL-QA-005 / F-1-8 | Removed the broken paid/license runtime, so stale entitlement UI cannot occur. | No license request or entitlement section; live request log has no external requests. |
| RL-QA-006 / F-1-9 | Prefixes formula-leading CSV cells with an apostrophe, including `= + - @`, tab, and carriage return. | Unit CSV test; browser regression inspects downloaded bytes. |
| RL-QA-007 / F-1-10 | Expanded header and footer link boxes to at least 44 px. | `@claim:accessible-responsive`; live measured heights are 44–48 px. |
| RL-QA-009 / F-1-11 | Moved toast and route live regions outside the replaced shell; mutations render before announcing. | Regression `creates a job, announces an entry…`; live has no console errors. |
| RL-QA-010 / F-1-12 | Initial load leaves focus at document start; client navigation focuses and announces the new h1. | Routing regression; live first Tab is Skip and route focus is true. |
| RL-QA-011 / F-1-13 | Added CSP/frame, Permissions-Policy, immutable asset caching, and manifest MIME rules. | Live header evidence: CSP, DENY, permissions, immutable assets, and `application/manifest+json`. |
| F-1-14 | Added a threshold-styled static 404 and explicit known-route rewrites; unknown paths retain HTTP 404. | Live `/definitely-not-a-route` → 404; header evidence; routing regression. |
| F-1-15 | Added route titles/descriptions/canonicals, OG/Twitter metadata, 1200×630 social art, and apple-touch icon. | Routing regression; live legal titles; social art dimensions. |
| F-1-16 | Added Demo and Privacy header links, full footer ownership/build text, demo/404 sitemap entries, How it works, and limitations sections. | Live mobile screenshot and route crawl. |
| F-1-17 | Rewrote landing, forms, legal text, and README around job, ledger, entry, and release status. | `.factory/copy-audit.md`; terminology search. |
| F-1-18 | Demo includes all five entry types and calculates the release result. | `@claim:release-status`. |
| F-1-19 | Kept no-account, no-bank, and no-custody facts and proved same-origin behavior. | `@claim:browser-privacy`; live external request count is zero. |
| F-1-20 | JSON export/import, full CSV, and per-job CSV are exercised from sample data. | `@claim:data-export`; downloaded contents asserted. |
| F-1-21 | Removed the non-working paid/free split and made every feature available. | No checkout or license UI; job/receipt/export regressions pass. |
| F-1-22 | Removed the unprovable merchant and subscription statements with the unavailable offer. | Copy/build search; purchase link count is zero. |
| F-1-23 | Real and demo records use separate browser databases; the demo makes no external request. | `@claim:demo-isolation`; `@claim:browser-privacy`. |
| F-1-24 | Privacy flow records same-origin requests only and asserts empty demo localStorage. | `@claim:browser-privacy`. |
| F-1-25 | Sample jobs and the installed shell reload offline after first visit. | `@claim:offline-reload`; live offline cold check. |
| F-1-26 | Tests theme, keyboard order, 390 px overflow, touch targets, legal routes, and Axe. | `@claim:accessible-responsive`; Axe serious/critical: 0. |
| F-1-27 | Added boundary tests for payments, refunds, milestones, releases, ordering, and excessive states. | Seven unit tests plus `@claim:release-status`. |
| F-1-28 | Demo receipt proves business/reference/tax/note data and invokes print/PDF. Billing configuration claims were removed. | `@claim:client-receipt`; production build. |
| F-1-29 | Ready/Review/Hold labels, reasons, and all four totals are text, not color-only. | `@claim:release-status`; Axe 0 serious/critical. |
| F-1-30 | Replaced “immutable-style” with a precise list of append-only entry types shown in the demo. | `@claim:release-status`; README copy audit. |
| F-1-31 | Removed billing-base and staging-override claims because the purchase path is not shipped. | README/build search; no billing module or bundled billing code. |
| F-1-32 | Replaced jargon-heavy private/local-first metadata with a concrete browser-storage statement. | `@claim:browser-privacy`; route metadata regression. |
| RL-QA-008 | Kept the compact static implementation and measured it again. | Live Lighthouse: Performance 100, LCP 1.1 s, TBT 0 ms, CLS 0. |

## Verification summary

- Clean clone: `npm ci`, 0 vulnerabilities.
- Clean clone: `npm test`, 7/7 passed.
- Clean clone: `npm run build`, 39.89 KB JS and 23.81 KB CSS before gzip.
- Clean clone: `npm run test:e2e`, 22/22 passed across desktop and 390 px.
- Clean clone: every exact claim command passed separately in both projects.
- Live: verifier passed with no console errors; Axe serious/critical 0.
- Live: Lighthouse 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.1 s, TBT 0 ms, CLS 0.
- Live: HTML SHA-256 matches `dist/index.html`: `3b5346d2685f49e7c9c732764fca22b20900ecf173351f8d8daa3ba3b97aace4`.
