# Independent product verification

**Verdict: FAIL**

- Candidate: `5bf1a255bb438b2bd915e2f615a511a7918edfc1`
- URL: <https://retainer-release-ledger.sociobot.in>
- Verified: 2026-08-28 UTC
- Work order: `retainer-release-ledger-verify-1`
- Environment: Node `v22.23.2`, npm `10.9.8`, Playwright/Chromium `1.58.2`

The deployed PWA is the candidate build and most normal workflows are polished, accessible, local-first, and offline-capable. It is not releasable because it accepts and records an over-release without a red warning, directly undermining the job-to-be-done, and because the live purchase CTA returns HTTP 404.

## Clean-checkout gates

The checkout began clean at the candidate commit. Ignored files and prior build output were removed before installation.

| Gate | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 51 packages installed; audit reported 0 vulnerabilities |
| `npm test` | PASS | 1 file, 3/3 calculation tests |
| Type check | PASS | `tsc --noEmit`, invoked by the production build |
| Lint | N/A | No lint script or lint configuration exists |
| `npm run build` | PASS | Vite 6.4.3; `dist/index.html` created |
| `npm run test:e2e` | PASS | 8/8 existing tests across desktop Chromium and 390×844 mobile |
| `npm audit` | PASS | 0 vulnerabilities |

Production output was rebuilt again after the service-worker update test. Sizes are 35,967 B JS (11.27 KB gzip), 20,895 B CSS (5.50 KB gzip), no fonts, 29,592 B mobile hero WebP, and 81,570 B desktop hero WebP. These satisfy the static-product budgets.

## Independent functional coverage

### Normal and recovery paths

- PASS — Empty state, job creation, custom INR currency, GST label, client/reference fields, and persistence.
- PASS — Representative `₹1,000.01` job: `₹400.01` deposit plus `₹400.01` milestone produced green **Ready to release** with correct coverage.
- PASS — Deposit, milestone, balance/refund, and release event controls are present. A release without a selected decision shows `Choose the release decision you made.` and succeeds after correction.
- PASS — Required job name, malformed email, negative amount, zero non-release event, and fractions beyond the `0.01` step are blocked by browser validation and can be corrected.
- PASS — After a `₹400.01` release and `₹0.01` refund, received net was `₹400.00`, available `₹0.00`, still payable `₹600.01`, and pending milestone work `₹0.00`.
- PASS — Receipt rendered four event rows with the configured currency/tax label. The Print / save PDF control invoked print, and Chromium produced a valid 2,747,263-byte PDF.
- PASS — Whole-ledger JSON export contained schema 1, one job, and four events. Whole-ledger and per-job CSV downloads worked. A valid JSON backup restored data.
- PASS — Malformed JSON displayed an error and allowed the user to continue.
- PASS — Three active free jobs are allowed; a fourth is blocked; archiving one permits another job.
- PASS — Archive/restore, not-found, privacy, and terms paths rendered.

### Boundary/adversarial paths

- FAIL — A `$100` job with `$100` received and `$100` milestone work accepted a **Ready** release event for `$500`. It then displayed amber **Review next step**, `$0` available, `$0` pending, and no indication that released value exceeded both work and money. See `RL-QA-001`.
- FAIL — `1e308` passes the amount input's validity check; the persisted job renders `$∞` for agreed and payable totals. See `RL-QA-004`.
- FAIL — Import is not atomic: a backup with one valid job followed by one invalid job reports an error but leaves the first job persisted. See `RL-QA-003`.
- FAIL — CSV preserves cells beginning `=1+1` and `=HYPERLINK(...)`, allowing spreadsheet formula interpretation. See `RL-QA-006`.

## Live deployment and identity

The deployment matches the candidate's rebuilt artifacts byte-for-byte:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `5e742877eec9f6999dae7c04628c05026630175d9924bd163dad505d5b67ccb2` |
| `sw.js` | `5f7a592fd3b011ba0e80323bb8640529c3e69ae7b8e8be7f28230843fc2fab09` |
| `manifest.webmanifest` | `d2bf12a1669ccc494a861aad4732c5a8691ae028bc95023d553925b9886ed800` |
| `assets/index-nbjDJguD.js` | `9ade57e07bc2c5de5fe8646f73725bcd285ddb89de951051b7a3683425cc7c01` |
| `assets/index-DRIUbsB7.css` | `b24e8026915277c1102c252b9efef84047b4550d2a555063519ab9c03c1a9ca9` |

The two hero images and all three PNG icons also matched byte-for-byte. Direct `/privacy` and unknown-route requests returned the SPA shell.

Fresh billing checks:

- `GET https://api.sociobot.in/api/v1/products/retainer-release-ledger/checkout` → **404**, body `{"error":"enabled factory product","status":404}`.
- Invalid-token verification → HTTP 200, `{"expires_at":null,"reason":"invalid","valid":false}` with correct CORS for the product origin and `Cache-Control: no-store`.

## PWA and offline

- PASS — Chromium parsed the manifest with no errors; it reports standalone display, versioned start URL, expected scope, colors, and 192/512/maskable icons. CDP reported no installability errors.
- PASS — The live service worker controlled the page after reload. A locally created record survived a live offline reload and the offline banner appeared.
- PASS — Update behavior was exercised by changing only the generated `dist/sw.js` cache version after a controlled first load, calling `registration.update()`, and observing `An update is ready. Reload to use it.` The exact candidate build was regenerated afterward.
- PASS — Icon dimensions are 192×192 and 512×512; manifest declarations match.
- PASS — No runtime CDN or third-party font/script is used.
- WARN — All live content, including hashed JS/CSS/assets, uses `Cache-Control: public, must-revalidate, max-age=30`; hashed assets are not long-lived immutable resources.

## Accessibility, responsive behavior, and browser health

- Axe: zero serious/critical findings on home, populated receipt, privacy, terms, and dark/reduced-motion views.
- Semantic smoke tests passed: `lang=en`, descriptive title, one `<h1>`, one `<main>`, meaningful hero alt, labels, and landmarks.
- Desktop and 390×844 mobile had no horizontal overflow. Body text is 16px; the product-specific light/dark visual system remained legible.
- Reduced motion converts animation and transition durations to `0.01ms`; no looping/flashing motion was found.
- Keyboard dialog open/Escape close returned focus to the trigger. Focus styling is a visible 3px accent outline.
- No console errors or uncaught page errors occurred in local or live workflows.
- The app initially moves focus to `<main>`; the first forward Tab therefore lands on **Create job**, bypassing the skip link and header controls. See `RL-QA-010`.
- At 390px, the brand link is 34px tall and footer Privacy/Terms links are 20px tall, below the required 44px target. See `RL-QA-007`.

## Performance and policies

Two fresh Lighthouse 12.8.2 mobile runs against the live URL produced:

| Run | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Speed index |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 76 | 100 | 100 | 100 | 1.1 s | 1.4 s | 1,200 ms | 0 | 2.0 s |
| 2 | 91 | 100 | 100 | 100 | 0.9 s | 1.2 s | 370 ms | 0 | 1.3 s |

LCP and CLS meet budget, but the ≥90 performance gate was not stable across repeated runs.

On a clean first load, browser traffic was same-origin only. Ledger/client data remained in IndexedDB; only license state used localStorage. No analytics or tracking request was observed.

Live responses include HSTS, `nosniff`, and `strict-origin-when-cross-origin`. They do not include Content-Security-Policy (including `frame-ancestors`), Permissions-Policy, or X-Frame-Options. The manifest is served as `application/octet-stream`, although Chromium parses it successfully.

## Defects

### High

#### RL-QA-001 — Over-release is accepted and not surfaced as held

Given a `$100` job, `$100` deposit, and `$100` milestone, recording a `$500` Ready release succeeds. The resulting status is amber **Review next step**, with no over-release message. This can normalize an accidental handoff beyond both recorded coverage and completed work—the central risk the product exists to prevent. Reject impossible release amounts or preserve the historical record while showing a red held/over-released state with the exact excess.

#### RL-QA-002 — Live Owner checkout is unavailable

The shipped **Buy once for $24** URL returns HTTP 404 with `{"error":"enabled factory product","status":404}`. A user cannot purchase the advertised one-time unlock. This is fresh production evidence, not an assumption based on the prior handoff.

### Medium

#### RL-QA-003 — Failed backup imports partially mutate the ledger

Import writes each record before validating the whole backup. A valid first job followed by an invalid second job reports failure but leaves the first job stored. Validate the complete payload first and commit it in one IndexedDB transaction.

#### RL-QA-004 — Extremely large finite inputs become infinite persisted totals

`1e308` is accepted by the number input and by the pre-rounding finite check; cent rounding overflows to `Infinity`. The UI renders `$∞`. Add a realistic maximum and verify the rounded result remains finite.

#### RL-QA-005 — Invalid background license verdict leaves stale unlocked UI

With `?license=qa-invalid-token`, the token is stored, stripped from the URL, and verified once. The mocked API returns `valid:false` and the invalid verdict is cached, but the current page continues to show **Unlimited ledgers unlocked** until reload because the background result does not re-render. Reconcile the UI immediately after verification.

#### RL-QA-006 — CSV export permits spreadsheet formulas

User-controlled job/note cells beginning with `=` are exported unchanged (including `=HYPERLINK(...)`). Quote escaping does not stop Excel/Sheets formula evaluation. Prefix formula-leading cells (`=`, `+`, `-`, `@`, tab, CR) safely.

#### RL-QA-007 — Mobile touch targets miss the 44px contract

At 390px the brand link measured 161×34px, Privacy 47×20px, and Terms 38×20px. Increase the interactive box without changing the visual size.

#### RL-QA-008 — Mobile performance gate is inconsistent

One of two consecutive Lighthouse mobile runs scored 76 with 1,200ms TBT; the next scored 91 with 370ms TBT. The product does not reliably demonstrate the required ≥90 score in this environment.

### Low

#### RL-QA-009 — Successful import feedback is erased by re-render

A valid import completes, but its success toast is immediately replaced by the new shell and is empty after render. The same call order affects event/edit/archive success toasts. Announce success after rendering or preserve the live region.

#### RL-QA-010 — Initial focus bypasses the skip link and header

Initial render focuses `<main>`. The first forward Tab lands on **Create job**, not the skip link or header navigation. Avoid moving focus on the initial document load; reserve route focus management for client-side navigation.

#### RL-QA-011 — Deployment caching/security policy hardening is incomplete

Hashed assets are cached for only 30 seconds rather than immutable long-lived caching. CSP/frame protection and Permissions-Policy are absent. These are deployment configuration issues; HSTS, referrer policy, and MIME sniff protection are present.

## Release decision

**FAIL.** Do not promote this candidate. Resolve at least `RL-QA-001` and `RL-QA-002`, then rerun the full suite. The remaining medium issues should be fixed before release because they concern stored-record integrity, license correctness, spreadsheet safety, accessibility, and the explicit performance contract.
