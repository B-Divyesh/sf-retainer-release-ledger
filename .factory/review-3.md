# Adversarial first-read review 3 — Release Ledger

**Verdict: PASS**

- Reviewed commit: `147b0e436f7b0bcb47782e91fcd0a8f0299707ff`
- Live URL: <https://retainer-release-ledger.sociobot.in>
- Review date: 2026-08-28 UTC
- Contexts: fresh Chromium at 390×844 and 1440×900; clean clone at the reviewed commit

No blocking or minor findings remain. The deployed home HTML, JavaScript, CSS, and static 404 hash-match the clean build. This was a full re-review, not a diff-only check.

## 30-second cold read

| Question | 390 px | Desktop |
| --- | --- | --- |
| What does this do? | Compare payments with finished work to determine whether client work is safe to release. | Same. |
| For whom? | Freelancers taking deposits. | Same. |
| What should I click first? | **Try it with sample data**. | **Try it with sample data**. |

The required answer is visible before scrolling in both contexts. On the phone, the primary action is at y=410–458 and the three facts end at y=681; it is not hidden behind the illustration. On desktop, the primary action is at y=696–744 in the 900 px viewport.

Exact first-screen copy:

> “Know when client work is safe to release”

> “For freelancers taking deposits, compare payments with finished work before sending files.”

> “Try it with sample data”

## Copy audit

Word counts treat numbers, hyphenated terms, URLs, and paths as one word. Each landing/README sentence and standalone fact is below the 22-word cap. There are no banned marketing adjectives, unexplained jargon, inconsistent core terms, mood/metaphor headings, or non-result-naming controls. The terms used consistently are **job**, **ledger**, **entry**, **balance payment**, and **release status**.

### Landing-page sentences and facts

| Words | Copy | Result |
| ---: | --- | --- |
| 12 | For freelancers taking deposits, compare payments with finished work before sending files. | Pass |
| 4 | Sample jobs open now. | Pass; `demo-isolation` |
| 4 | Your ledger stays unchanged. | Pass; `demo-isolation` |
| 2 | No account | Pass; `browser-privacy` |
| 5 | Works offline after first visit | Pass; `offline-reload` |
| 5 | Data stays in this browser | Pass; `browser-privacy` |
| 12 | Stepping stones lead through a brass gate toward a wrapped portfolio parcel. | Pass; useful image alt text |
| 4 | Add the agreed total. | Pass |
| 7 | Then record each payment and completed milestone. | Pass |
| 6 | Add deposits, balance payments, and refunds. | Pass |
| 7 | Add each completed milestone and its value. | Pass |
| 8 | See Ready, Review, or Hold with the reason. | Pass; `release-status` |
| 7 | Release Ledger records the amounts you enter. | Pass |
| 15 | It does not hold funds, connect to a bank, process payments, or replace a contract. | Pass; operational privacy/custody parts are `browser-privacy`; the contract clause is an explicit limitation, not a service promise |
| 7 | Your release status depends on your entries. | Pass; explicit limitation |
| 8 | It cannot prevent a payment reversal or dispute. | Pass; explicit limitation, not a performance promise |
| 9 | Export all jobs and entries as JSON or CSV. | Pass; `data-export` |
| 8 | Import a JSON backup when you need it. | Pass; `data-export` |
| 7 | Required fields are marked with an asterisk. | Pass |
| 2 | Maximum 10,000,000. | Pass; form and unit boundary enforce it |
| 4 | Amounts are records only. | Pass; clarifying limitation |
| 9 | Release Ledger does not hold funds or process payments. | Pass; `browser-privacy` |
| 9 | Compare client payments with finished work before sending files. | Pass; footer one-line description |
| 10 | Build polish-2 · Hero artwork was generated for this product. | Pass; build label and provenance |

The landing headings (`Your jobs`, `Check release status in three steps`, `Limits and responsibilities`, `Keep a backup`) all name their sections. The landing controls (`Try it with sample data`, `Create job`, `Create your first job`, `Export backup`, `Export CSV`, and `Import backup`) describe their results. Navigation names destinations.

### README sentences and facts

| Words | Copy | Result |
| ---: | --- | --- |
| 14 | Release Ledger helps freelancers and small service shops compare client payments with finished work. | Pass |
| 10 | Record deposits, balance payments, refunds, completed milestones, and release decisions. | Pass; `release-status` |
| 11 | See whether recorded payments cover work that is ready to send. | Pass; `release-status` |
| 3 | Live site: URL | Pass; destination |
| 5 | Try the isolated sample: URL | Pass; `demo-isolation` |
| 15 | It is not invoicing software, a bank connection, a payment processor, accounting advice, or escrow. | Pass; explicit scope/custody limitation; operating portions are `browser-privacy` |
| 10 | A release status: Ready, Review, or Hold, with a reason. | Pass; `release-status` |
| 9 | Entries for deposits, milestones, releases, refunds, and balance payments. | Pass; `release-status` |
| 12 | Payments received, available amount, amount still due, and finished work not sent. | Pass; `release-status` |
| 8 | Client receipts that print or save as PDF. | Pass; `client-receipt` |
| 13 | JSON backup import and export, plus CSV for all jobs or one job. | Pass; `data-export` |
| 12 | Currency, tax label, client details, reference, agreed total, and receipt note fields. | Pass; `client-receipt` |
| 6 | Offline reload after the first visit. | Pass; `offline-reload` |
| 13 | Keyboard operation, light and dark themes, and a layout tested at 390 px. | Pass; `accessible-responsive` |
| 14 | No purchase is required to create jobs, use receipts, or import and export records. | Pass; `no-purchase-required` |
| 7 | Deposits and balance payments increase money received. | Pass; `release-status` |
| 4 | Refunds reduce money received. | Pass; `release-status` |
| 7 | Milestones record the value of finished work. | Pass; `release-status` |
| 9 | A release entry records the decision and value sent. | Pass; `release-status` |
| 13 | Ready appears when recorded payments cover finished work that has not been sent. | Pass; `release-status` |
| 10 | A recorded Hold remains until a newer decision changes it. | Pass; `release-status` |
| 10 | Releasing beyond recorded payments or finished work always shows Hold. | Pass; `release-status` |
| 7 | The release status depends on your entries. | Pass; limitation |
| 12 | It cannot guarantee that a payment will not be reversed or disputed. | Pass; limitation |
| 9 | Open `/demo` or `/?demo=1` to load three sample jobs. | Pass; `demo-isolation` / `data-export` |
| 8 | Demo data uses the separate `demo:release-ledger` browser database. | Pass; `demo-isolation` |
| 5 | Reset demo restores the sample. | Pass; `demo-isolation` |
| 11 | Start for real deletes demo data and returns to your ledger. | Pass; `demo-isolation` |
| 9 | See `.factory/demo.md` for the sample records and verification path. | Pass |
| 5 | Use Node.js 20 or later. | Pass; developer prerequisite |
| 9 | The build writes the offline web app to `dist/`. | Pass; developer instruction |
| 5 | Playwright is pinned to `1.58.2`. | Pass; developer fact |
| 5 | The factory environment includes Chromium. | Pass; developer fact |
| 9 | Elsewhere, install it once with `npx playwright install chromium`. | Pass; developer instruction |
| 8 | Every public product claim is listed in `.factory/claims.json`. | Pass; registry cross-check completed |
| 7 | Each entry includes its isolated test command. | Pass |
| 6 | Deploy `dist/` as a static site. | Pass; developer instruction |
| 11 | Unknown paths return a styled 404 response with the required headers. | Pass; live 404/header check |
| 11 | The installed pages reopen without a connection after the first visit. | Pass; `offline-reload` |
| 9 | Job and client data stays in this browser profile. | Pass; `browser-privacy` |
| 11 | Demo data stays in its separate database until reset or exit. | Pass; `demo-isolation` |
| 13 | There is no analytics, advertising, bank connection, or online copy of the ledger. | Pass; `browser-privacy` |
| 8 | Export a JSON backup before clearing browser data. | Pass; instruction |
| 7 | Read the live privacy policy and terms. | Pass; route/link crawl |
| 11 | See `.factory/brief.json` for scope and `.factory/design.md` for visual and artwork provenance. | Pass; repository reference |
| 1 | MIT. | Pass |
| 2 | See `LICENSE`. | Pass |

README headings are concrete section names. Its controls are shell commands or links, rather than ambiguous product actions.

## Demo and sandbox

The visible home CTA enters `/demo` in one click. In a fresh 390 px live context, the first resulting screen already shows the persistent **“Demo — sample data, nothing is saved to your ledger”** banner; Reset demo and Start for real; Northstar brand handoff; Northstar Coffee; `$1,200.00 received`; Ready to release; the reason; and the latest entry. This is a populated product view, not a second empty landing page.

The direct demo starts with only `demo:release-ledger` in IndexedDB and no localStorage keys. The sample contains three realistic jobs covering Ready, Hold, and Review, and all five entry types. The home-CTA flow was also exercised after creating a real job in the fresh context: demo did not display the real job; Reset restored the sample; Start for real discarded demo storage and restored the real job.

The full live demo request log contained only same-origin requests for the document, built JS/CSS, and the self-hosted hero image. There were no analytics, advertising, payment, bank, or third-party requests. The offline claim test reloads an already visited sample job after `context.setOffline(true)`.

## Claims and clean-clone verification

Fresh clone: `/tmp/release-ledger-review3-oXf2Uq` at `147b0e4`.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 0 audit vulnerabilities |
| `npm test` | Pass; 7/7 |
| `npm run build` | Pass; `dist/` produced |
| Initial built JS | 40.71 kB / 12.35 kB gzip |
| `npm run test:e2e -- --grep @claim:demo-isolation` | Pass; desktop and 390 px |
| `npm run test:e2e -- --grep @claim:browser-privacy` | Pass; desktop and 390 px |
| `npm run test:e2e -- --grep @claim:offline-reload` | Pass; desktop and 390 px |
| `npm run test:e2e -- --grep @claim:data-export` | Pass; desktop and 390 px |
| `npm run test:e2e -- --grep @claim:release-status` | Pass; desktop and 390 px |
| `npm run test:e2e -- --grep @claim:client-receipt` | Pass; desktop and 390 px |
| `npm run test:e2e -- --grep @claim:accessible-responsive` | Pass; desktop and 390 px |
| `npm run test:e2e -- --grep @claim:no-purchase-required` | Pass; desktop and 390 px |
| `npm run test:e2e` | Pass; complete 26-test suite |

All eight registry entries have one matching `@claim:<id>` test. All observed public behavioral promises map to the relevant registry entry above; the remaining wording is a concrete scope limitation, provenance, or developer instruction rather than an unlisted service claim.

## Earlier findings

Every earlier review, polish report, verification report, and handoff was read. The following table confirms the former findings against live behavior and current source rather than accepting a prior “fixed” label.

| Earlier IDs | Result now | Verification |
| --- | --- | --- |
| F-1-1 | Fixed | Cold 390 px/desktop screen gives job, audience, and sample action. |
| F-1-2, F-2-1, F-2-3, F-2-4 | Fixed | CTA performs a document transition into isolated `/demo`; populated phone preview, reset/exit, direct links, legal navigation, reload, and back work. |
| F-1-3, F-2-2 | Fixed | Registry exists; all exact commands passed; CTA itself is covered by `demo-isolation`. |
| RL-QA-001 / F-1-4 | Fixed | Excess release computes Hold with the exact excess; unit and claim tests pass. |
| RL-QA-002 / F-1-5, F-1-21, F-1-22 | Fixed | No unavailable purchase, checkout, license, or merchant claim remains; required features work without purchase. |
| RL-QA-003 / F-1-6 | Fixed | Complete backup validation precedes a single IndexedDB transaction; invalid-import regression passes. |
| RL-QA-004 / F-1-7 | Fixed | Finite-cent/max validation rejects `1e308`; boundary tests pass. |
| RL-QA-005 / F-1-8 | Fixed | License/entitlement path was removed. |
| RL-QA-006 / F-1-9 | Fixed | CSV formula-leading cells are apostrophe-neutralized and browser-tested. |
| RL-QA-007 / F-1-10 | Fixed | 390 px header/footer targets are asserted at ≥44 px. |
| RL-QA-009 / F-1-11 | Fixed | Toast/live regions persist outside rerendered app content. |
| RL-QA-010 / F-1-12 | Fixed | Initial Tab reaches Skip; client routing focuses and announces the new h1. |
| RL-QA-011 / F-1-13 | Fixed | Live CSP including response-header `frame-ancestors`, Permissions-Policy, manifest MIME, and immutable asset caching are present. |
| RL-QA-008 | Not reproduced | Built payload remains well under budget; no load console error. |
| F-1-14, F-1-15, F-1-16, F-2-9 | Fixed | Unknown route returns styled HTTP 404 with metadata, icons, global header/footer, recovery link, and legal links. |
| F-1-17, F-2-8 | Fixed | Full copy audit above: no vague/mood heading, unsupported jargon, or competing `later payment` term. |
| F-1-18 through F-1-20, F-1-23 through F-1-30, F-1-32, F-2-5 through F-2-7 | Fixed | Registry/test mapping, isolated-storage behavior, privacy request check, arithmetic/status, exports, receipt, accessibility, and all wording were rechecked above. |
| F-1-31 | Fixed | Billing configuration and purchase claims/code remain absent. |

## Structure, accessibility, links, and identity

- `/`, `/demo`, demo job/receipt, `/privacy`, and `/terms` expose their own title, one h1, one main, description, canonical, Open Graph/Twitter metadata, SVG favicon, apple-touch icon, shared header/footer, and no console errors.
- The 404 returns HTTP 404 and has its own title, description, canonical, OG/Twitter metadata, icons, skip link, shared skeleton, and return action. The browser’s expected failed-resource message for the deliberately 404 response is not a product JavaScript console error.
- Direct links, reload, History back, focus movement, and route announcements are regression-tested. The demo-to-real boundary uses a full navigation so it cannot retain the wrong IndexedDB namespace.
- Crawled live `/demo` links all return 200: demo home, privacy, terms, all three sample jobs, and the declared external Param Factory link. `robots.txt` and `sitemap.xml` are present and enumerate public routes.
- The live response sends `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`; hashed JS receives `max-age=31536000, immutable`; the manifest receives `application/manifest+json`.
- Serious/critical Axe violations are zero in the responsive/accessibility claim and all-pages test. Keyboard, visible focus, semantic landmarks, 390 px overflow, 44 px targets, theme, and reduced-motion behavior are covered.
- The parchment, brass-gate editorial art, serif/display pairing, ruled-ledger rhythm, and status colors are distinctive to the decision this product supports. This is not a generic SaaS template; the implementation matches the documented threshold-garden visual thesis.

## Missed leverage

No missing AI feature is a finding. The core decision is deterministic record arithmetic; an AI recommendation would weaken rather than improve a release-safety check. The brief’s obvious adjacent value—receipt/PDF, JSON backup/import, and CSV export—is already implemented and tested. Sync would conflict with the deliberately local-browser privacy boundary.

## What would make this perfect

Nothing is required for this release. Maintain the existing claim-to-test discipline as future copy or features are added, preserve demo namespace isolation for every new storage path, and rerun this same clean-context review after any routing, storage, or deployment change.
