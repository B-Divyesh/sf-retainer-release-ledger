# Adversarial first-read review 2 — Release Ledger

**Verdict: FAIL**

- Reviewed commit: `814114aaefd9f8ab014e7581536b89e5837bfb47`
- Live URL: <https://retainer-release-ledger.sociobot.in>
- Review date: 2026-08-28 UTC
- Fresh viewports: 390×844 and 1440×900
- Evidence: [review-2 screenshots](evidence/review-2/)

The first screen is clear, the direct demo sandbox is isolated, and all declared test commands pass. The product still fails because its primary sample-data action does not enter demo mode, the direct demo hides the realistic records below the first phone viewport, navigation across the demo boundary breaks, three public claim groups are absent from the registry, prior copy defects remain, and the production 404 is outside the required site skeleton.

## 30-second cold read before scrolling

| Question | 390 px | Desktop |
| --- | --- | --- |
| What does this do? | Compares client payments with finished work to decide whether work is safe to release. | Same answer. |
| For whom? | Freelancers who take deposits. | Same answer. |
| What should I click first? | `Try it with sample data`. It is fully visible at y=410. | `Try it with sample data`. It is fully visible at y=696. |

The exact first-screen copy succeeds on its own:

> “Know when client work is safe to release”

> “For freelancers taking deposits, compare payments with finished work before sending files.”

> “Try it with sample data”

The click does not deliver the stated result; see F-2-1.

## Findings — blocking

### F-2-1 / F-1-2 — The primary sample-data action does not enter demo mode

**Location:** live `/`, `Try it with sample data`; `src/db.ts:4-5`; `src/main.ts:109-110`. **Exact result:** after creating `Private test job` in a fresh real ledger and clicking the CTA, the URL becomes `/demo`, but the page keeps the real home headline and real job. There is no `Demo — sample data, nothing is saved to your ledger` banner and no sample job. The header `Demo` link fails the same way. **Why:** `isDemoMode` and `DB_NAME` are constants chosen when the module loads. The client router changes only `history`, so crossing from real mode to demo mode cannot change the storage namespace or rendered mode. This is a regression of the earlier demo finding and the advertised one-click path is not usable. **Fix:** make every real↔demo boundary link perform a full navigation, or make storage mode safely reinitializable before rendering. Add a test that clicks the visible home CTA, asserts the banner and three named jobs, and confirms that the real job is absent.

### F-2-2 / F-1-3 — The passing demo claim test bypasses the broken public path

**Location:** `.factory/claims.json` claim `demo-isolation`; `tests/claims.spec.ts:4-6`. **Exact test behavior:** the test creates real data and then calls `page.goto('/?demo=1')`. It never clicks `Try it with sample data` or the header `Demo` link. **Why:** the command passes while the action named in the claim's `where` field fails in production. The one-click demo outcome is untested, so the registry is incomplete despite seven green commands. **Fix:** change `@claim:demo-isolation` to enter through the visible CTA and separately cover direct `/demo` and `/?demo=1` deep links.

### F-2-3 — The direct demo does not show realistic sample records in the first phone viewport

**Location:** live direct `/demo`, 390×844. **Exact content before scrolling:** `See release decisions with sample jobs`, `1 Ready`, `1 Hold`, `1 Review`, three generic facts, and the top edge of the hero artwork. The first named job, client, amount, and ledger entry are below the viewport. **Why:** even after bypassing F-2-1 with a hard navigation, the first demo screen is a second landing page. A visitor must click `Open a ready job` or scroll past the artwork before seeing realistic data. That fails the requirement that the first screen after one click already show the product being used with realistic sample data. **Fix:** on demo entry, put the sample job list or a populated job verdict with client, amount, status reason, and recent entries above the artwork at 390 px.

### F-2-4 — Navigation across the demo boundary renders the wrong mode or a false 404

**Location:** global header/footer links in demo and real mode; `src/main.ts:21-40,109-110`. **Exact results:** real `/` → `Demo` changes the URL but remains on the real ledger; direct `/demo` → `Privacy` changes the URL to `/privacy` and renders `Page not found — Release Ledger` inside the demo banner. Directly loading `/privacy` returns the correct page. **Why:** the same visible link has different, broken behavior depending on how the app was entered. Deep links work, but ordinary navigation does not. **Fix:** force a document navigation whenever the target crosses the demo namespace, or redesign the router/storage layer so mode follows the current route. Add forward, back, reload, focus, and data-isolation tests for `/` ↔ `/demo` ↔ `/privacy` and `/terms`.

### F-2-5 / F-1-19 — No-custody and no-payment-processing claims remain unlisted

**Location:** landing limitations and job dialog; README lines 11 and 72; privacy/terms/receipt copy. **Exact quotes:** `It does not hold funds, connect to a bank, process payments, or replace a contract.`; `Release Ledger does not hold funds or process payments.`; `It is not ... a payment processor ... or escrow.` **Why:** `browser-privacy` lists only no account, no bank connection, and browser storage. Its test title and a text assertion mention more, but the registry claim itself does not list no custody, no payment processing, or no escrow. This is the earlier unlisted-claim finding only partially repaired. **Fix:** add the exact no-custody/no-processing promise to a claim entry with an observable full-flow test for no payment UI/API/requests, or remove those promises.

### F-2-6 / F-1-21 — “All features” without purchase is an unlisted claim

**Location:** README line 24. **Exact quote:** `All features are available without an account or purchase.` **Why:** no claim entry promises absence of a purchase gate, and no single tagged test proves that every feature is available without purchase. Removing the broken checkout fixed the prior product flow but left a new absolute claim unregistered. **Fix:** replace it with a bounded statement such as `No purchase is required` and add a claim test that exercises job creation beyond the old limit, receipt notes, import/export, and receipts without a license, or remove the sentence.

### F-2-7 / F-1-24 — Analytics, advertising, and online-copy claims remain unlisted

**Location:** README line 72 and live `/privacy`. **Exact quotes:** `There is no analytics, advertising, bank connection, or online copy of the ledger.`; `The app does not send ledger data to a server. It has no analytics, advertising, bank connection, or online ledger copy.` **Why:** the registered `browser-privacy` claim does not mention analytics or advertising. The tagged test records demo requests, but a test title is not a registry entry. These remain public promises without a corresponding claim. **Fix:** expand the registered claim and its `where` field to include these exact promises, then record requests across home, demo mutation, export/import, privacy, and receipt flows.

### F-2-8 / F-1-17 — Copy still has a vague heading, jargon, and inconsistent event terms

**Location:** landing and README. **Exact copy:** `Keep money and decisions with you` does not name the limitations section; `Check a handoff in three steps` changes the established `release` term to `handoff`; README uses `later payments` while the interface calls the entry `Balance payment`; `The build writes the static PWA to dist/` uses unexplained jargon; `real 404 response` is imprecise. **Why:** the earlier copy finding required one term per concept and headings that work out of context. These remaining lines are half-fixed and therefore blocking again under the review instructions. **Fix:** use `Limits and responsibilities`; `Check release status in three steps`; choose either `later payment` or `balance payment` everywhere; `The build writes the offline web app to dist/`; and `Unknown paths return a 404 status.`

### F-2-9 / F-1-15 / F-1-16 — The production 404 lacks route metadata and the common skeleton

**Location:** live `/definitely-not-a-route`; `public/404.html`. **Exact result:** HTTP 404, title `Page not found — Release Ledger`, one h1, and a return link work. The response has no meta description, canonical, Open Graph/Twitter metadata, favicon, apple-touch icon, product header, footer, Privacy, Terms, Param Factory credit, or build ID. **Why:** the earlier route-metadata and consistent-header/footer findings required these on every route. The repair created a usable 404 but left both findings half-fixed. **Fix:** give `404.html` the product metadata and the same wordmark/navigation/footer skeleton while retaining HTTP 404 semantics and the return action.

## Copy audit

Word counts treat a path, URL, number, and hyphenated term as one word. Code blocks are excluded. No sentence exceeds 22 words and no banned marketing word appears. Flags below map to findings above.

### Live landing page sentences and standalone facts

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 12 | For freelancers taking deposits, compare payments with finished work before sending files. | Pass |
| 2 | 4 | Sample jobs open now. | Pass; promised result fails after the click in F-2-1 |
| 3 | 4 | Your ledger stays unchanged. | Pass as copy; direct sandbox confirms it |
| 4 | 2 | No account. | Registered claim |
| 5 | 5 | Works offline after first visit. | Registered claim |
| 6 | 5 | Data stays in this browser. | Registered claim |
| 7 | 12 | Stepping stones lead through a brass gate toward a wrapped portfolio parcel. | Pass; image alt describes the artwork |
| 8 | 4 | Add the agreed total. | Pass |
| 9 | 7 | Then record each payment and completed milestone. | Pass |
| 10 | 6 | Add deposits, later payments, and refunds. | Terminology flag: F-2-8 |
| 11 | 7 | Add each completed milestone and its value. | Pass |
| 12 | 8 | See Ready, Review, or Hold with the reason. | Registered claim |
| 13 | 7 | Release Ledger records the amounts you enter. | Pass |
| 14 | 15 | It does not hold funds, connect to a bank, process payments, or replace a contract. | Unlisted claim: F-2-5 |
| 15 | 7 | Your release status depends on your entries. | Pass; limitation |
| 16 | 8 | It cannot prevent a payment reversal or dispute. | Pass; limitation |
| 17 | 9 | Export all jobs and entries as JSON or CSV. | Registered claim |
| 18 | 8 | Import a JSON backup when you need it. | Registered claim |
| 19 | 7 | Required fields are marked with an asterisk. | Pass |
| 20 | 4 | Maximum 10,000,000. | Pass; code and boundary tests enforce it |
| 21 | 4 | Amounts are records only. | Pass |
| 22 | 9 | Release Ledger does not hold funds or process payments. | Unlisted claim: F-2-5 |
| 23 | 9 | Compare client payments with finished work before sending files. | Pass; footer one-liner |
| 24 | 9 | Build polish-1 · Hero artwork was generated for this product. | Pass; build ID and provenance |

### Landing headings, navigation, and controls

| Copy | Type | Result |
| --- | --- | --- |
| Skip to main content | Link | Pass |
| Release Ledger | Wordmark | Pass |
| Jobs / Demo / Privacy | Navigation | Plain destinations; demo behavior fails in F-2-1/F-2-4 |
| Compare payments with finished work | Eyebrow | Pass |
| Know when client work is safe to release | h1, 8 words | Pass |
| Try it with sample data | Primary action | Result-naming; behavior fails in F-2-1 |
| Create job / Create your first job | Buttons | Result-naming |
| Your jobs / Active jobs | Section labels | Pass |
| How it works | Section label | Pass |
| Check a handoff in three steps | h2 | Flag: inconsistent term; use `Check release status in three steps` (F-2-8) |
| Record payments / Record finished work / Check release status | Step headings | Pass |
| What it does not do | Section label | Pass |
| Keep money and decisions with you | h2 | Flag: vague out of context; use `Limits and responsibilities` (F-2-8) |
| Read how browser data is handled | Link | Result-naming |
| Export your records / Keep a backup | Section labels | Pass |
| Export backup / Export CSV / Import backup | Buttons | Result-naming |
| Privacy / Terms / Built by Param Factory | Footer links | Pass |
| New job / Create a job | Dialog headings | Pass |
| Cancel / Create job | Dialog buttons | Pass |

### README sentences and standalone statements

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 14 | Release Ledger helps freelancers and small service shops compare client payments with finished work. | Pass |
| 2 | 10 | Record deposits, later payments, refunds, completed milestones, and release decisions. | Terminology flag: F-2-8 |
| 3 | 11 | See whether recorded payments cover work that is ready to send. | Pass |
| 4 | 3 | Live site: URL | Pass |
| 5 | 5 | Try the isolated sample: URL | Pass; live CTA defect is F-2-1 |
| 6 | 15 | It is not invoicing software, a bank connection, a payment processor, accounting advice, or escrow. | Unlisted claim: F-2-5 |
| 7 | 10 | A release status: Ready, Review, or Hold, with a reason. | Registered claim |
| 8 | 9 | Entries for deposits, milestones, releases, refunds, and later payments. | Terminology flag: F-2-8 |
| 9 | 12 | Payments received, available amount, amount still due, and finished work not sent. | Registered claim |
| 10 | 8 | Client receipts that print or save as PDF. | Registered claim |
| 11 | 13 | JSON backup import and export, plus CSV for all jobs or one job. | Registered claim |
| 12 | 12 | Currency, tax label, client details, reference, agreed total, and receipt note fields. | Covered by receipt/export flows |
| 13 | 6 | Offline reload after the first visit. | Registered claim |
| 14 | 13 | Keyboard operation, light and dark themes, and a layout tested at 390 px. | Registered claim |
| 15 | 9 | All features are available without an account or purchase. | Unlisted absolute claim: F-2-6 |
| 16 | 7 | Deposits and later payments increase money received. | Terminology flag: F-2-8; arithmetic is registered |
| 17 | 4 | Refunds reduce money received. | Registered claim |
| 18 | 7 | Milestones record the value of finished work. | Registered claim |
| 19 | 9 | A release entry records the decision and value sent. | Registered claim |
| 20 | 13 | Ready appears when recorded payments cover finished work that has not been sent. | Registered claim |
| 21 | 10 | A recorded Hold remains until a newer decision changes it. | Registered claim |
| 22 | 10 | Releasing beyond recorded payments or finished work always shows Hold. | Registered claim |
| 23 | 7 | The release status depends on your entries. | Pass; limitation |
| 24 | 12 | It cannot guarantee that a payment will not be reversed or disputed. | Pass; limitation |
| 25 | 9 | Open /demo or /?demo=1 to load three sample jobs. | Direct URLs pass; public CTA fails in F-2-1 |
| 26 | 9 | Demo data uses the separate demo:release-ledger browser database. | Registered claim |
| 27 | 5 | Reset demo restores the sample. | Registered claim |
| 28 | 11 | Start for real deletes demo data and returns to your ledger. | Registered claim |
| 29 | 11 | See .factory/demo.md for the sample records and verification path. | Pass |
| 30 | 6 | Use Node.js 20 or later. | Pass; developer prerequisite |
| 31 | 8 | The build writes the static PWA to dist/. | Jargon flag: use `The build writes the offline web app to dist/` (F-2-8) |
| 32 | 7 | Playwright is pinned to 1.58.2. | Pass; developer fact |
| 33 | 5 | The factory environment includes Chromium. | Pass; developer fact |
| 34 | 9 | Elsewhere, install it once with npx playwright install chromium. | Pass; developer instruction |
| 35 | 10 | Every public product claim is listed in .factory/claims.json. | False because of F-2-5 through F-2-7 |
| 36 | 7 | Each entry includes its isolated test command. | Pass for the seven entries |
| 37 | 6 | Deploy dist/ as a static site. | Pass; developer instruction |
| 38 | 15 | The included Static Web Apps configuration provides routes, headers, caching, and a real 404 response. | Imprecise copy; use `Unknown paths return a styled 404 response with the required headers` (F-2-8/F-2-9) |
| 39 | 11 | The installed pages reopen without a connection after the first visit. | Registered claim |
| 40 | 9 | Job and client data stays in this browser profile. | Registered claim |
| 41 | 11 | Demo data stays in its separate database until reset or exit. | Registered claim |
| 42 | 13 | There is no analytics, advertising, bank connection, or online copy of the ledger. | Partly unlisted: F-2-7 |
| 43 | 8 | Export a JSON backup before clearing browser data. | Pass; instruction |
| 44 | 7 | Read the live privacy policy and terms. | Pass |
| 45 | 15 | See .factory/brief.json for scope and .factory/design.md for visual and artwork provenance. | Pass |
| 46 | 1 | MIT. | Pass |
| 47 | 2 | See LICENSE. | Pass |

README headings are `Release Ledger`, `What it includes`, `How release status is calculated`, `Sample demo`, `Run and test`, `Deploy`, `Privacy and data ownership`, `Product records`, and `License`. Each names its section. No README sentence exceeds 22 words; the average is 9.0 words.

## Demo and sandbox evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Visible one-click action on home | FAIL | F-2-1; click changes URL only |
| Direct `/demo` seed | PASS | `Northstar brand handoff`, `Harbor website launch`, and `Cedar packaging files`; Ready/Hold/Review |
| First 390 px demo viewport shows realistic records | FAIL | F-2-3; only aggregate status counts appear |
| Persistent banner | PASS on direct entry | `Demo — sample data, nothing is saved to your ledger`, Reset, Start for real |
| Separate storage | PASS on direct entry | Both `release-ledger` and `demo:release-ledger` exist; the private job is absent from demo |
| Reset | PASS | Added `Transient demo change`; Reset removed it and restored samples |
| Start for real | PASS | Deletes `demo:release-ledger`, preserves and shows `Private test job` |
| Privacy request log | PASS on direct demo | 12 requests, all to the product origin; no console/page errors |
| Offline | PASS in declared test | Service-worker-controlled sample job reloaded with the context offline |

## Claims registry and clean-sandbox commands

The checkout was clean at the reviewed base before `npm ci`. Every exact command in `.factory/claims.json` returned zero and ran in both configured browser projects.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS 2/2, but inadequate coverage: F-2-2 |
| `browser-privacy` | `npm run test:e2e -- --grep @claim:browser-privacy` | PASS 2/2; registry text remains incomplete: F-2-5/F-2-7 |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | PASS 2/2 |
| `data-export` | `npm run test:e2e -- --grep @claim:data-export` | PASS 2/2 |
| `release-status` | `npm run test:e2e -- --grep @claim:release-status` | PASS 2/2 |
| `client-receipt` | `npm run test:e2e -- --grep @claim:client-receipt` | PASS 2/2 |
| `accessible-responsive` | `npm run test:e2e -- --grep @claim:accessible-responsive` | PASS 2/2 |

Additional gates: `npm test` passed 7/7; `npm run build` passed and produced `dist/`; the full Playwright run executed all 22 desktop/mobile cases without a reported test failure. Production Axe checks found zero serious/critical violations on home, demo, a populated demo job, privacy, terms, and 404.

## Earlier finding verification

Each earlier finding was rechecked against production behavior and the current source. “Half-fixed” findings are blocking again under their original IDs.

| Earlier ID | Result now | Independent evidence |
| --- | --- | --- |
| F-1-1 | FIXED | Cold mobile/desktop copy states job, audience, and first action before scroll. |
| F-1-2 | REGRESSED — BLOCKING | Direct demo isolation works, but the visible CTA/header link cannot enter it: F-2-1. |
| F-1-3 | HALF-FIXED — BLOCKING | Seven entries/tests exist and pass; the demo test bypasses the CTA and public claims remain absent: F-2-2/F-2-5–7. |
| RL-QA-001 / F-1-4 | FIXED | Live `$1,000` excess release shows `Hold release` and states the excess; calculation tests pass. |
| RL-QA-002 / F-1-5 | FIXED | No purchase, checkout, or license copy/control in live UI or source. |
| RL-QA-003 / F-1-6 | FIXED | Live invalid-tail import reports `Nothing was imported`; valid-prefix job count remains zero; source uses one transaction. |
| RL-QA-004 / F-1-7 | FIXED | Live `1e308` is invalid; code caps values at 10,000,000; unit boundary passes. |
| RL-QA-005 / F-1-8 | FIXED | License runtime and entitlement UI were removed from live output and source. |
| RL-QA-006 / F-1-9 | FIXED | Live CSV prefixes formula-leading job/note cells with `'`; unit/browser regressions pass. |
| RL-QA-007 / F-1-10 | FIXED | Live 390 px global targets measure 44–48 px. |
| RL-QA-009 / F-1-11 | FIXED | Stable toast region announces saved entries after render. |
| RL-QA-010 / F-1-12 | FIXED | First Tab reaches Skip; ordinary route changes focus and announce h1. Cross-mode routing still fails separately. |
| RL-QA-011 / F-1-13 | FIXED | Live CSP/frame, Permissions-Policy, manifest MIME, and immutable hashed-asset caching confirmed. |
| RL-QA-008 | NOT REPRODUCED | Built JS is 39.89 kB (12.18 kB gzip); no console errors or layout overflow. |
| F-1-14 | FIXED | Unknown path returns HTTP 404 with a usable return action. |
| F-1-15 | HALF-FIXED — BLOCKING | App routes have correct metadata; the production 404 lacks description/canonical/OG/icons: F-2-9. |
| F-1-16 | HALF-FIXED — BLOCKING | App routes have the skeleton; static 404 lacks it and demo-boundary nav is broken: F-2-4/F-2-9. |
| F-1-17 | HALF-FIXED — BLOCKING | Most copy is plain; vague heading, jargon, and competing event terms remain: F-2-8. |
| F-1-18 | FIXED | Direct demo contains all five entry types and release arithmetic passes. |
| F-1-19 | HALF-FIXED — BLOCKING | No-custody/payment/escrow copy is not in the claim registry: F-2-5. |
| F-1-20 | FIXED | JSON import/export, full CSV, and per-job CSV claim passes. |
| F-1-21 | HALF-FIXED — BLOCKING | Broken paid tier is removed; absolute no-purchase claim is unlisted: F-2-6. |
| F-1-22 | FIXED | Merchant/subscription statements are gone. |
| F-1-23 | FIXED | Direct demo uses separate IndexedDB and preserves real data. |
| F-1-24 | HALF-FIXED — BLOCKING | Same-origin behavior passes; analytics/advertising promises are missing from registry text: F-2-7. |
| F-1-25 | FIXED | Offline sample reload claim passes. |
| F-1-26 | FIXED | Keyboard, theme, 390 px, touch-target, legal-route, and Axe claim passes. |
| F-1-27 | FIXED | Unit boundaries and release-status claim cover arithmetic and unsafe release. |
| F-1-28 | FIXED | Receipt fields and print invocation pass; billing claim removed. |
| F-1-29 | FIXED | Ready/Review/Hold labels, reasons, and totals are text and tested. |
| F-1-30 | FIXED | `Immutable-style` claim removed; entry types are concrete. |
| F-1-31 | FIXED | Billing-base and override claims/code removed. |
| F-1-32 | FIXED | Private/local-first slogan removed; browser-storage wording is concrete. |

## Structure, routing, links, and identity

| Check | Result |
| --- | --- |
| Titles | PASS on `/`, direct `/demo`, demo job/receipt, `/privacy`, `/terms`, and 404; all follow the product/plain-purpose pattern. |
| One h1, one main, lang | PASS on every tested direct route. |
| Meta/canonical/OG/favicon | PASS on app routes; FAIL on static 404 (F-2-9). |
| Designed 404 | Partial: product colors/type and return action are present, but global skeleton/metadata are absent. |
| Deep links | PASS when loaded directly. |
| Back/focus | PASS within one mode; FAIL across real/demo mode (F-2-4). |
| Link crawl | All resolved home/demo/job/receipt/privacy/terms/Param Factory links return 200; `mailto:` is explicitly excluded. Behavioral SPA links still fail as described. |
| Header/footer | PASS on app routes; FAIL on static 404. |
| Console | No errors in tested direct flows. |
| Accessibility | Zero serious/critical Axe violations; visible focus, no 390 px overflow, 44 px global targets. |
| Visual identity | PASS. Parchment, editorial serif, brass threshold art, asymmetry, and ruled-ledger details are recognizably product-specific, not a generic SaaS template. |

## Missed leverage

No additional AI feature is justified. Release status is deterministic financial arithmetic, and model output would weaken the core decision. Import/export and receipt/PDF paths already exist. Remote sync is not implied by the local-browser privacy position. The obvious leverage still missing is the promised one-click, immediately populated demo covered by F-2-1 through F-2-3.

## What would make this perfect

Fix the demo boundary as a real mode transition; make the first demo phone viewport show named jobs, money, and a status reason; test the public CTA instead of a direct URL; repair demo-to-legal navigation; register or remove every no-custody, no-purchase, analytics, and advertising claim; standardize copy around `balance payment` and `release status`; and bring the HTTP 404 into the same metadata/header/footer skeleton. Then rerun this complete review from a fresh browser and clean checkout. Nothing else should remain.
