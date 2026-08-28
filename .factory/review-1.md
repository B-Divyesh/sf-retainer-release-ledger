# Adversarial first-read review 1 — Release Ledger

**Verdict: FAIL**

- Reviewed commit: `3474c2652e4a9d340429fa1ea7b3f535be5a38a8`
- Live URL: <https://retainer-release-ledger.sociobot.in>
- Review date: 2026-08-28 UTC
- Viewports: 390×844 and 1440×900, each in a fresh Chromium context
- Production identity: the live HTML and JavaScript SHA-256 hashes match the clean build (`5e7428…` and `9ade57…`)

There are blocking first-screen, demo, claims, routing, safety, purchase, data-integrity, export, accessibility, and deployment findings. This cannot pass while any finding remains.

## 30-second cold read before scrolling

| Question | 390 px | Desktop |
| --- | --- | --- |
| What does this do? | Not clear enough. “Know what can cross the gate” is a metaphor. The supporting line suggests payment and handoff tracking but does not say what is compared or what result the product gives. | Partly clear: it tracks deposits, finished work, and a release decision. The release-status result is still implicit. |
| For whom? | Cannot answer. No audience appears on the first screen. | Cannot answer. The repository says freelancers and small service shops, but the live first screen does not. |
| What should I click first? | Cannot answer before scrolling. The artwork takes most of the viewport and only the top edge of “Create job” appears at the bottom. There is no sample-data action. | “Create job” appears to be first, but that asks for setup rather than offering a tryable sample. |

Exact copy that fails the test:

> “Know what can cross the gate.”

> “Track deposits against finished work, record the release decision, and keep every handoff explainable.”

> “Create job” / “Import backup”

## Findings — blocking

### F-1-1 — The first screen does not state the job, audience, and first action

**Location:** live home hero, especially 390 px. **Why:** the headline is a gate metaphor, the sentence never names freelancers or service shops, and the mobile action sits below the initial viewport. A cold visitor cannot answer all three mandatory questions. **Fix:** use `Know when client work is safe to release` as the h1; follow with `For freelancers taking deposits, compare payments with finished work before sending files.` Put `Try it with sample data` and its outcome beside the real `Create job` action, above the artwork on mobile. Keep three visible facts: `No account`, `Works offline after first visit`, and `Data stays in this browser`, once those claims have tests.

### F-1-2 — There is no one-click demo, and `/demo` writes to the real namespace

**Location:** live `/`, `/demo`, and `/?demo=1`. **Evidence:** there is no `Try it with sample data` action, no sample records, no demo banner, no Reset, and no Start for real. Both demo entry forms render the ordinary empty ledger. Creating `Demo namespace probe` from `/demo` stores it in IndexedDB database `release-ledger`, the same namespace used by `/`. **Why:** visitors must invent data before seeing the product, and the nominal demo URL is not isolated. Offline and privacy claims cannot be verified through the required sandbox. **Fix:** implement `/demo` with realistic jobs and event histories already visible, use a `demo:` database or an in-memory store, add the persistent `Demo — sample data, nothing is saved` banner with `Reset demo` and `Start for real`, discard demo changes on exit, and document it in `.factory/demo.md`.

### F-1-3 — The required claims registry and claim tests do not exist

**Location:** `.factory/claims.json` is absent; `rg '@claim:'` finds no tests. **Evidence:** a clean clone passes 3 unit tests and 8 Playwright tests, but none is tagged to a published claim. **Why:** every product promise is untested under the claims contract. **Fix:** add `.factory/claims.json`; give every claim exactly one `@claim:<id>` test that starts from the isolated demo; remove any sentence that cannot be proved. The individual unlisted claims are F-1-18 through F-1-32.

### RL-QA-001 / F-1-4 — Over-release is still accepted without a held warning

**Location:** live job event flow and `src/calculations.ts`. **Exact result:** with a $100 job, $100 deposit, $100 milestone, and $500 Ready release, the live page shows `Review next step` and `The latest decision was ready; no unreleased milestone remains.` **Why:** the central safety decision conceals a $400 over-release. **Fix:** reject a release above recorded paid and completed work, or preserve it while forcing a red held state that states the exact excess. Add boundary tests. This is unchanged from the prior finding.

### RL-QA-002 / F-1-5 — The advertised $24 purchase still returns 404

**Location:** live `Buy once for $24` link. **Evidence:** `GET https://api.sociobot.in/api/v1/products/retainer-release-ledger/checkout` returns HTTP 404 and `{"error":"enabled factory product","status":404}`. **Why:** the paid feature cannot be bought. **Fix:** enable the product in the Sociobot billing API and add a smoke test for a successful checkout handoff, or remove the purchase offer until it works. This is unchanged from the prior finding.

### RL-QA-003 / F-1-6 — A failed import still partially writes data

**Location:** `src/db.ts`, `importBackup`. **Evidence:** importing a backup containing a valid first job and invalid second job reports `The backup contains an invalid job record.` but leaves `Partially persisted` in IndexedDB. **Why:** an error does not restore the previous ledger state. **Fix:** validate the entire backup first, then write jobs, events, and settings in one transaction. This is unchanged from the prior finding.

### RL-QA-004 / F-1-7 — A finite input still becomes an infinite stored total

**Location:** amount parsing and job display. **Exact input/result:** `1e308` is browser-valid and renders `$∞` and `Agreed $∞`. **Why:** unusable financial values can be persisted. **Fix:** set a documented realistic maximum and reject values whose cent conversion or formatted total is not finite. This is unchanged from the prior finding.

### RL-QA-005 / F-1-8 — Invalid license state still remains visibly unlocked until reload

**Location:** live `/?license=qa-invalid-token` and `src/main.ts:421`. **Evidence:** verification returns HTTP 200 and caches `valid:false`, while the current page still says `Unlimited ledgers unlocked`; after reload it changes to `License no longer active.` **Why:** paid entitlement is misrepresented during the active session. **Fix:** re-render or update the entitlement section after background verification resolves. This is unchanged from the prior finding.

### RL-QA-006 / F-1-9 — CSV still exports spreadsheet formulas verbatim

**Location:** `src/main.ts`, CSV export. **Exact output:** cells contain `"=1+1"`, `"=HYPERLINK(""https://example.test"")"`, and `"+SUM(1,1)"`. **Why:** opening the export in common spreadsheet software may execute user-controlled formulas. **Fix:** neutralize cells beginning with `=`, `+`, `-`, `@`, tab, or carriage return, and test the downloaded bytes. This is unchanged from the prior finding.

### RL-QA-007 / F-1-10 — Mobile links still miss the 44 px touch target

**Location:** live 390 px header/footer. **Measured:** brand 161.1×34 px, Privacy 47.1×19.5 px, Terms 38.3×19.5 px. **Why:** these controls do not meet the stated accessibility baseline. **Fix:** expand each interactive box to at least 44×44 px without relying on adjacent whitespace. This is unchanged from the prior finding.

### RL-QA-009 / F-1-11 — Mutation success feedback is still erased

**Location:** event save/import/archive flows. **Evidence:** after saving an event, `#toast` is empty because `showToast(...)` runs before `render()`, which replaces the live region. **Why:** users, especially screen-reader users, do not receive confirmation. **Fix:** render first and announce afterward, or preserve a stable live region outside the replaced shell. This is unchanged from the prior finding.

### RL-QA-010 / F-1-12 — Initial focus still bypasses the document start

**Location:** live initial load. **Evidence:** focus is moved to `MAIN#main`; the first Tab lands on `Create job`, skipping the skip link, wordmark, Jobs link, and theme control. Route changes also focus `<main>`, not the new h1, and have no dedicated route announcement. **Why:** keyboard and screen-reader navigation order is unexpected. **Fix:** do not move focus on first load; on client-side navigation focus the new h1 and announce its text in a persistent polite live region. This is unchanged from the prior finding.

### RL-QA-011 / F-1-13 — Response policy and asset caching remain incomplete

**Location:** live response headers. **Evidence:** HTML and hashed assets use `Cache-Control: public, must-revalidate, max-age=30`; CSP, frame protection, and Permissions-Policy are absent; the manifest is `application/octet-stream`. **Why:** the shipped deployment does not meet the repository's own policy/caching contract. **Fix:** add a matching CSP and `frame-ancestors` response header, Permissions-Policy, immutable long-lived caching for hashed assets, and the correct web-manifest MIME type. This is unchanged from the prior finding.

### F-1-14 — Unknown routes silently become the home page

**Location:** live `/definitely-not-a-route`. **Evidence:** HTTP 200, home title, home h1, and home content. `renderNotFound()` is used only for missing job/receipt IDs. There is no `404.html` or `staticwebapp.config.json`. **Why:** broken links look valid, search engines receive false pages, and users get no route-specific recovery. **Fix:** render the designed 404 for all unknown routes, return/rewrite with 404 semantics through `staticwebapp.config.json`, and add a crawl test.

### F-1-15 — Every route keeps the home metadata

**Location:** `/`, `/privacy`, `/terms`, `/demo`, and unknown routes. **Evidence:** all use `Release Ledger — know when work is safe to release` and the same description. Canonical, Open Graph, Twitter card, and apple-touch metadata are absent. **Why:** privacy, terms, demo, and error pages are mislabeled in history, sharing, and search results. **Fix:** set route-specific titles such as `Privacy — Release Ledger`, canonical URLs, plain route descriptions, product-specific 1200×630 social art, Twitter/OG tags, and an apple-touch icon.

### F-1-16 — Required header, footer, sitemap, and landing sections are incomplete

**Location:** every route and `public/sitemap.xml`. **Evidence:** the header has only Jobs and omits Demo/Privacy; the footer omits `Built by Param Factory` and version/build ID; the sitemap omits `/demo` and a real 404; the landing sequence has no three-step How it works section and no full plain-language limitations/privacy section. **Why:** navigation and ownership information are inconsistent with the standard product skeleton. **Fix:** add the missing global links/footer fields/routes and the two required landing sections. Preserve the distinct threshold-garden identity; it is recognizably product-specific and is not itself a finding.

### F-1-17 — Landing and README copy contains metaphor, jargon, vague headings, and weak controls

**Location:** detailed copy audit below. **Why:** terms such as `gate`, `folio`, `local-first`, `immutable-style`, and `cached app shell` require interpretation; several headings name a mood instead of a section; README sentences exceed 22 words; `Have a license?` and `Verify` do not name their result. **Fix:** apply the proposed rewrites in the audit and use one term per concept.

## Unlisted claim findings

Every row is blocking because it has no `.factory/claims.json` entry or `@claim:` test. Exact duplicate ideas are grouped into one finding; every claim-like sentence on the live landing page and README is represented.

| ID | Exact quote and location | Required fix/test |
| --- | --- | --- |
| F-1-18 | Landing: “Track deposits against finished work, record the release decision, and keep every handoff explainable.” README: “It records deposits, later payments, refunds, completed milestones, and release decisions so the person handing over work can answer one question: is the work recorded as ready and covered?” | Add a demo flow test that records every event type and asserts the displayed release result; shorten the README sentence. |
| F-1-19 | Landing: “No account. No bank connection. No money held here.” Job dialog: “Amounts are records only. Release Ledger does not hold funds or process payments.” README: “It is deliberately not invoicing software, a bank connection, a payment processor, accounting advice, or escrow.” | Record all requests and inspect the UI/storage path in a clean demo; add separate no-account, no-bank, and no-custody claim entries or remove the claims. |
| F-1-20 | Landing: “Export every job and event as a JSON backup, or take the full event ledger to a spreadsheet. Export is always free.” README: “Whole-ledger JSON backup/import and CSV export; per-job CSV export.” | Test JSON and CSV content, import round-trip, per-job filtering, and access without a license. |
| F-1-21 | Landing: “The free ledger includes three active jobs (0/3 used). A one-time purchase unlocks unlimited active jobs and custom receipt notes. CSV and JSON exports always remain free.” README: “Useful free tier (three active jobs); one-time $24 Owner unlock for unlimited active jobs and custom receipt notes through the Sociobot billing API.” | Test the free limit, archive recovery, entitlement unlock, receipt notes, export access, and the live checkout handoff. |
| F-1-22 | Landing: “Sociobot / Dodo is the merchant of record. No subscription.” | Add a billing-contract fixture and checkout test, or remove the statement until the endpoint works. |
| F-1-23 | Landing: “Your job data stays in this browser.” README: “Job and client data stays in IndexedDB on the current browser profile. License tokens and cached verification status use localStorage.” | Record all demo requests and inspect IndexedDB/localStorage namespaces through create, reload, export, reset, and exit. |
| F-1-24 | README: “There is no analytics, advertising, remote ledger sync, third-party font, or runtime CDN.” | Add a full-flow request-log test that allows only documented origins and asserts no analytics/script/font/CDN requests. |
| F-1-25 | README: “IndexedDB storage, PWA installation, cached app shell, and tested offline reload.” and “The service worker handles installed/offline navigation after first load.” | Add installability and offline-reload claim tests using the demo sample; the existing untagged normal-data test is insufficient. |
| F-1-26 | README: “Light/dark themes, keyboard-complete dialogs, responsive 390px layout, privacy and terms pages.” | Split into testable claims for theme contrast, complete keyboard operation, 390 px overflow/touch targets, and legal-route content. The touch-target portion currently fails. |
| F-1-27 | README verdict section: “Deposits and balance payments increase money received.” “Refunds reduce it.” “Milestones record the value of work now ready.” “Release events preserve the decision and value actually handed over.” “Ready to release appears when available recorded payments cover pending milestone work.” “A recorded hold always shows as held until a newer decision changes the state.” | Add tagged arithmetic and state-transition tests, including over-release, over-refund, ordering, and amount bounds. |
| F-1-28 | README: “Client receipt with print-to-PDF output”; “Configurable currency, tax label, client details, reference, and agreed total”; and “The checkout and verification URLs are derived from the product slug; no billing product ID or secret is stored in this repository.” | Add tagged receipt/PDF, editable-field, and built-artifact/configuration tests. |
| F-1-29 | README: “Per-job red / amber / green release verdict with a plain-language reason”; “Net paid, available coverage, remaining payable, and unreleased milestone totals.” | Test color-independent labels, reasons, and each displayed total against the event fixture. |
| F-1-30 | README: “Immutable-style event history for deposit, milestone, release, refund, and balance events.” | Replace `Immutable-style` with a precise promise, then test whether saved events can be changed or removed and whether all types appear. |
| F-1-31 | README: “The production billing base defaults to https://api.sociobot.in.” and “Staging can override it at build time.” | Add a build/configuration test that inspects the generated URL for default and override builds. |
| F-1-32 | Meta description: “A private, local-first ledger for deposits, milestones, and confident work release decisions.” README: “Release Ledger is a private, local-first release gate for freelancers and small service shops.” | Rewrite in plain words and cover `private` with the request/storage test; remove the untestable adjective `confident`. |

Developer prerequisites, commands, file paths, and license references in README are repository instructions rather than product promises. They were checked during the clean-clone run but are not treated as claims-registry entries. The artwork provenance sentence is corroborated by `.factory/design.md`; it is provenance, not a behavioral promise.

## Copy audit

Word counts treat hyphenated terms, slash terms, URLs, and numbers as one word. Landing controls/headings are included because their clarity is part of the first-read test. Code blocks are excluded from README sentence counts.

### Live landing page

| # | Words | Exact copy | Flag and proposed rewrite |
| ---: | ---: | --- | --- |
| 1 | 4 | Skip to main content | — |
| 2 | 2 | Release Ledger | — |
| 3 | 1 | Jobs | — |
| 4 | 4 | A local release record | `release record` is unclear. Use `Compare payments with finished work`. |
| 5 | 6 | Know what can cross the gate. | Blocking metaphor/headline. Use `Know when client work is safe to release`. |
| 6 | 14 | Track deposits against finished work, record the release decision, and keep every handoff explainable. | Audience missing; `explainable` is abstract. Use `For freelancers taking deposits, compare payments with finished work before sending files.` |
| 7 | 2 | Create job | — |
| 8 | 2 | Import backup | — |
| 9 | 2 | No account. | Untested claim; otherwise plain. |
| 10 | 3 | No bank connection. | Untested claim; otherwise plain. |
| 11 | 4 | No money held here. | Untested claim; otherwise plain. |
| 12 | 2 | Current folio | Brand-lore term. Use `Your jobs`. |
| 13 | 2 | Active jobs | — |
| 14 | 4 | Begin with the agreement. | Heading does not name the section. Use `Create your first job`. |
| 15 | 7 | Create a job with its agreed total. | — |
| 16 | 11 | Then record the deposit and each completed milestone as they happen. | — |
| 17 | 4 | Create your first job | — |
| 18 | 3 | Your records, portable | Fragment. Use `Export your records`. |
| 19 | 4 | Keep an exit copy. | Metaphor. Use `Keep a backup`. |
| 20 | 18 | Export every job and event as a JSON backup, or take the full event ledger to a spreadsheet. | `event ledger` is jargon. Use `Export all jobs and events as JSON or CSV.` |
| 21 | 4 | Export is always free. | Untested claim. Keep only with a claim test. |
| 22 | 2 | Export backup | — |
| 23 | 2 | Export CSV | — |
| 24 | 4 | Owner edition · $24 once | `edition` is inconsistent with `license`. Use `Owner license · $24 once`. |
| 25 | 6 | Keep every job in one folio. | Metaphor. Use `Store unlimited active jobs`. |
| 26 | 9 | The free ledger includes three active jobs (0/3 used). | Untested quantitative claim. |
| 27 | 11 | A one-time purchase unlocks unlimited active jobs and custom receipt notes. | Untested purchase claim. |
| 28 | 7 | CSV and JSON exports always remain free. | Untested duplicate claim. |
| 29 | 7 | Sociobot / Dodo is the merchant of record. | Slash construction is unclear. Use `Sociobot handles payment through Dodo.` if verified. |
| 30 | 2 | No subscription. | Untested claim. |
| 31 | 4 | Buy once for $24 | Result is incomplete. Use `Buy Owner license — $24`. |
| 32 | 3 | Have a license? | Question is not a result-naming action. Use `Enter license`. |
| 33 | 3 | Private by default. | Generic slogan and untested claim. Delete it. |
| 34 | 7 | Your job data stays in this browser. | Useful fact, but untested. Keep only with the privacy claim test. |
| 35 | 1 | Privacy | — |
| 36 | 1 | Terms | — |
| 37 | 11 | Original threshold artwork generated for Release Ledger with Azure AI Foundry. | Provider detail is not useful in global navigation. Use `Hero artwork was generated for this product.` on an About/design note. |
| 38 | 4 | Amounts are records only. | Useful limitation, but untested. Keep it with a no-custody claim test. |
| 39 | 9 | Release Ledger does not hold funds or process payments. | Useful limitation, but untested. Keep it with a no-custody claim test. |

Rows 38–39 appear in the job dialog opened from the landing page. The hidden license form also contains `Verify`, which does not name a result. Use `Verify license`.

### README

| # | Words | Exact copy | Flag and proposed rewrite |
| ---: | ---: | --- | --- |
| 1 | 14 | Release Ledger is a private, local-first release gate for freelancers and small service shops. | `local-first release gate` is jargon. Use `Release Ledger helps freelancers and small service shops compare client payments with finished work.` |
| 2 | 29 | It records deposits, later payments, refunds, completed milestones, and release decisions so the person handing over work can answer one question: is the work recorded as ready and covered? | Over 22 words. Use `Record deposits, later payments, refunds, completed milestones, and release decisions. See whether recorded payments cover work that is ready to send.` |
| 3 | 4 | Live target: https://retainer-release-ledger.sociobot.in | — |
| 4 | 16 | It is deliberately not invoicing software, a bank connection, a payment processor, accounting advice, or escrow. | — |
| 5 | 10 | Per-job red / amber / green release verdict with a plain-language reason | `verdict` and color-first status are inconsistent. Use `Per-job release status—Ready, Review, or Hold—with a reason`. |
| 6 | 11 | Immutable-style event history for deposit, milestone, release, refund, and balance events | `Immutable-style` is vague jargon. State exactly whether events can be edited or deleted. |
| 7 | 10 | Net paid, available coverage, remaining payable, and unreleased milestone totals | `available coverage` is jargon. Use `Payments received, amount available for finished work, amount still due, and finished work not yet sent`. |
| 8 | 5 | Client receipt with print-to-PDF output | Use `Print client receipts or save them as PDF.` |
| 9 | 9 | Whole-ledger JSON backup/import and CSV export; per-job CSV export | `whole-ledger` is jargon. Use `Import or export all records as JSON, and export all jobs or one job as CSV.` |
| 10 | 10 | Configurable currency, tax label, client details, reference, and agreed total | — |
| 11 | 11 | IndexedDB storage, PWA installation, cached app shell, and tested offline reload | `IndexedDB`, `PWA`, and `app shell` are implementation jargon. Use `Install the app and reopen saved records without a connection after the first visit.` |
| 12 | 11 | Light/dark themes, keyboard-complete dialogs, responsive 390px layout, privacy and terms pages | `keyboard-complete` is jargon. Use `Light and dark themes; all dialogs work by keyboard; layouts fit 390 px screens.` |
| 13 | 23 | Useful free tier (three active jobs); one-time $24 Owner unlock for unlimited active jobs and custom receipt notes through the Sociobot billing API | Over 22 words; `Useful` is marketing and `unlock`/API are jargon. Use `The free version stores three active jobs. A $24 Owner license adds unlimited active jobs and custom receipt notes.` |
| 14 | 7 | Deposits and balance payments increase money received. | — |
| 15 | 3 | Refunds reduce it. | Ambiguous pronoun. Use `Refunds reduce money received.` |
| 16 | 8 | Milestones record the value of work now ready. | — |
| 17 | 10 | Release events preserve the decision and value actually handed over. | `events` is product jargon. Use `A release entry records the decision and value handed over.` |
| 18 | 12 | “Ready to release” appears when available recorded payments cover pending milestone work. | `available recorded payments` and `pending milestone work` need decoding. Use `Ready appears when recorded payments cover finished work that has not been sent.` |
| 19 | 14 | A recorded hold always shows as held until a newer decision changes the state. | — |
| 20 | 19 | The verdict is only as accurate as the entries and is not a guarantee against payment reversal or dispute. | `verdict` differs from `status`. Use `The release status depends on your entries. It cannot guarantee that a payment will not be reversed or disputed.` |
| 21 | 3 | Requires Node.js 20+. | — |
| 22 | 2 | Quality gates: | — |
| 23 | 5 | Playwright is pinned to 1.58.2. | — |
| 24 | 15 | The factory image already includes its Chromium build; elsewhere, run npx playwright install chromium once. | `factory image` is insider jargon. Use `The factory environment includes Chromium. In other environments, install it once with …` |
| 25 | 16 | Deploy the contents of dist/ as a static SPA with unknown routes falling back to index.html. | `SPA` is jargon. Use `Deploy dist/ as a static site and direct unknown application routes to index.html.` |
| 26 | 9 | The service worker handles installed/offline navigation after first load. | `service worker` is implementation detail. Use `After the first visit, installed pages reopen without a connection.` |
| 27 | 8 | The production billing base defaults to https://api.sociobot.in. | — |
| 28 | 7 | Staging can override it at build time: | — |
| 29 | 22 | The checkout and verification URLs are derived from the product slug; no billing product ID or secret is stored in this repository. | Dense but within cap. Use two sentences: `Checkout and verification URLs use the product slug. This repository stores no billing product ID or secret.` |
| 30 | 12 | Job and client data stays in IndexedDB on the current browser profile. | `IndexedDB` is unnecessary for users. Use `Job and client data stays in this browser profile.` |
| 31 | 8 | License tokens and cached verification status use localStorage. | `localStorage` is implementation jargon. Use `This browser stores the license token and its latest verification result.` |
| 32 | 13 | There is no analytics, advertising, remote ledger sync, third-party font, or runtime CDN. | `remote ledger sync` and `runtime CDN` are jargon. Use `There is no analytics, advertising, online copy of your ledger, or externally loaded font or script.` |
| 33 | 9 | Users should export JSON backups before clearing browser data. | — |
| 34 | 17 | See .factory/brief.json for scope, .factory/design.md for the visual system and artwork provenance, and .factory/handoff.md for verification results. | — |
| 35 | 1 | MIT. | — |
| 36 | 2 | See LICENSE. | — |

README headings are `Release Ledger`, `What v1 includes`, `How the verdict works`, `Develop`, `Deploy and configuration`, `Privacy and data ownership`, and `License`. `How the verdict works` should become `How release status is calculated` to use the chosen term.

### Terminology and controls

| Concept | Current competing terms | Use one term |
| --- | --- | --- |
| A client work record | job, ledger, folio | `job` |
| The complete stored collection | ledger, records, full event ledger | `ledger` |
| Computed result | verdict, release status, ready/review/held, gate | `release status`; values `Ready`, `Review`, `Hold` |
| Paid access | Owner edition, Owner unlock, license | `Owner license` |
| Recorded activity | event, entry, decision | `entry`, with `release decision` only for that entry type |

Controls that fail result-naming language: `Have a license?` → `Enter license`; `Verify` → `Verify license`; `Buy once for $24` → `Buy Owner license — $24`. `Create job`, `Import backup`, `Export backup`, and `Export CSV` already name their results.

## Claims and clean-sandbox verification

| Check | Result | Evidence |
| --- | --- | --- |
| Read `.factory/claims.json` | FAIL | File does not exist. |
| Run every listed claim test | FAIL / none available | There are zero listed tests and zero `@claim:` tags. No published claim is verified under the required contract. |
| `npm ci` from a clean clone | PASS | 51 packages; 0 audit vulnerabilities. |
| `npm test` | PASS | 1 file, 3/3 calculation tests. |
| `npm run build` | PASS | Type check and Vite build; `dist/index.html`; 11.27 kB gzip JS. |
| `npm run test:e2e` | PASS | 8/8 existing desktop and 390 px tests. These are not claim-tagged and do not use a demo. |
| Request log during normal create/event flow | PASS with limitation | All requests were same-origin, but there is no demo sandbox in which to verify the privacy claim. |
| Offline reload | PASS with limitation | Existing clean-clone Playwright test passed for manually created data, but no sample is reachable through a demo. |

## Earlier finding verification

No `.factory/review-*.md` or `.factory/polish-*.md` files existed before this report. The earlier `.factory/handoff.md` and `.factory/verification.md` contained the findings below.

| Earlier ID | Current result | Evidence |
| --- | --- | --- |
| RL-QA-001 | UNFIXED — blocking again | Live $500 release against $100 paid/work still shows Review, not Hold. |
| RL-QA-002 | UNFIXED — blocking again | Live checkout still returns 404. |
| RL-QA-003 | UNFIXED — blocking again | Failed import still leaves the valid prefix in IndexedDB. |
| RL-QA-004 | UNFIXED — blocking again | `1e308` still becomes `$∞`. |
| RL-QA-005 | UNFIXED — blocking again | Live invalid response is cached while the current page remains unlocked until reload. |
| RL-QA-006 | UNFIXED — blocking again | Formula-leading CSV cells remain unchanged. |
| RL-QA-007 | UNFIXED — blocking again | The same three mobile targets remain below 44 px. |
| RL-QA-008 | NOT REPRODUCED | Two live Lighthouse runs scored 100, with LCP 1.1/1.2 s, TBT 10/0 ms, and CLS 0. Two local runs also scored 100. No current finding. |
| RL-QA-009 | UNFIXED — blocking again | Mutation toast is still empty after re-render. |
| RL-QA-010 | UNFIXED — blocking again | Initial focus remains on main; first Tab skips global controls. |
| RL-QA-011 | UNFIXED — blocking again | Cache, CSP/frame, Permissions-Policy, and manifest MIME defects remain. |

## Structure, routing, links, and accessibility

| Check | Result |
| --- | --- |
| Product-specific title pattern | Home PASS; route-specific titles FAIL. |
| Exactly one h1 and one main | PASS on tested routes. The home h1 wording fails plain words. |
| Meta description | Present but unlisted and jargon-heavy; route-specific descriptions FAIL. |
| Canonical / OG / Twitter / apple-touch | FAIL; absent. |
| Designed 404 | FAIL; arbitrary paths render home with HTTP 200. Missing-job UI exists but is not a general 404. |
| Deep links and back button | Privacy/terms deep links and back navigation work. Route focus/announcement FAIL. |
| Link crawl | Internal links return 200. Purchase link returns 404. Unknown paths falsely return 200. |
| Consistent header/footer | Partial; wordmark and legal footer links are consistent, but required global items are missing. |
| Distinct identity | PASS. The parchment, brass gate, editorial typography, asymmetry, and original threshold art are product-specific rather than a generic SaaS template. |
| Axe serious/critical | PASS in the existing desktop/mobile light/dark runs. Manual focus and touch-target checks still fail. |
| Reduced motion / overflow | PASS in existing tests and manual 390 px overflow check. |
| Console on normal load | PASS; no page error. The Playwright-only service-worker-block warning is expected in blocked contexts. |

## Missed leverage

No AI feature is warranted. The brief asks for deterministic money/event arithmetic, and an AI assistant would weaken trust without solving the core job. The expected import/export and receipt/PDF paths already exist. The obvious missing leverage is the required isolated sample-data demo, covered by F-1-2; sync is not implied by the local-first brief.

## What would make this perfect

Resolve every finding above, then run a new review from a fresh browser and clean clone. The acceptance bar is: a phone visitor can identify the job, audience, and sample action without scrolling; `/demo` immediately shows a realistic safe/held decision without touching real data; every public promise has one passing claim test; impossible financial states cannot look safe; payment and all links work; imports are atomic and CSV is inert; every route has correct metadata, focus, status, and 404 behavior; all targets meet 44 px; and the complete copy audit has no flagged line. There is nothing else to add until those checks pass.
