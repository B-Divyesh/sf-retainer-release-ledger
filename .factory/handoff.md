# Release Ledger — build handoff

Build date: 2026-08-28

Work order: `retainer-release-ledger-build-1`

Artifact: static local-first PWA (`dist/`)

## What was built

- A complete per-job release ledger for deposits, balance payments, refunds, completed milestones, and release decisions.
- An explainable red / amber / green release verdict calculated from recorded net payments, milestone value, and value already released.
- Job dashboard with ready/held counts, archive/restore, editable job/client/currency/tax/reference fields, and protected local client data.
- Client-facing receipt with an itemized record and browser Print / Save PDF path.
- Whole-ledger JSON backup/import, whole-ledger CSV, and per-job CSV. These ownership and safety features are never paywalled.
- IndexedDB persistence; install manifest; 192px, 512px, and maskable icons; versioned service-worker caches; navigation fallback; offline notice; and update-ready toast.
- Light and dark treatments, reduced-motion behavior, keyboard-operable native dialogs, skip link, semantic landmarks, named forms, designed focus states, and a responsive 390px layout.
- `/privacy` and `/terms` routes with local-data and no-escrow disclosures.
- One-time $24 Owner edition using the required Sociobot checkout/verify contract. Free includes three active jobs; Owner adds unlimited active jobs and custom receipt notes. License return capture, daily verification cache, optimistic offline unlock, invalid-license notice, and paste-to-restore are implemented. The API base is configurable with `VITE_BILLING_API_BASE`; no product ID or secret is embedded.
- Original “threshold garden” hero and app mark. Source, prompts, review, generator, and license provenance are recorded in `.factory/design.md` and `assets/src/`.

## Release calculation

- Deposit and balance events add to received money.
- Refund events subtract from received money.
- Milestones add work value that is ready for a release decision.
- Release events record the decision and the value actually handed over.
- Available coverage = net received − released value.
- Green appears when available coverage meets all pending milestone value. Red appears when work is uncovered or the latest explicit decision is “hold.” Amber asks for review when no unreleased milestone remains or more information is needed.

The UI says clearly that this is a user-entered record, not escrow, payment processing, accounting advice, or protection against payment reversal.

## Verification

Run from a clean checkout with Node.js 20+:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Verified locally on 2026-08-28:

- `npm test`: 3/3 calculation tests passed.
- `npm run build`: passed; `dist/index.html` produced at the required root.
- Production payload: 35.97 KB JS raw / 11.27 KB gzip; 20.90 KB CSS raw / 5.50 KB gzip; largest hero WebP 81.6 KB. All are below the 200 KB JS, 50 KB CSS, 120 KB fonts, and 300 KB hero budgets. No font files are shipped.
- `npm run test:e2e`: 8/8 passed. Desktop Chromium and 390×844 mobile cover create job → deposit → milestone → green verdict → client receipt, privacy navigation, axe, dark/reduced-motion treatment, and a real service-worker-controlled offline reload with IndexedDB data intact.
- Axe integration: zero serious or critical violations on tested home, legal, light, and dark views.
- Lighthouse 12.8.2 mobile profile against the production build: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**. FCP 0.9 s, LCP 1.5 s, TBT 130 ms, CLS 0, Speed Index 1.0 s.
- The end-to-end suite watches for console errors during the core workflow; none were emitted.
- `npm audit`: 0 vulnerabilities.

## Deployment notes

- Deploy command: `npm ci && npm run build`.
- Publish exactly `dist/` and configure unknown URL paths to fall back to `dist/index.html` so direct visits to `/privacy`, `/terms`, and receipt/job routes resolve before the service worker controls the page.
- The production billing base is `https://api.sociobot.in`. For staging, build with `VITE_BILLING_API_BASE=https://pilot-api.sociobot.in` after the test product is registered.

## Known gaps / next steps

- The hosted checkout and a real verification response cannot be exercised until the factory registers the product slug. The browser integration and offline cached-verdict behavior are implemented against the documented contract.
- PDF export uses the browser’s native print-to-PDF UI rather than bundling a PDF renderer; this keeps the app small, private, and offline-capable.
- Data is intentionally device-local with explicit backup/import. There is no sync or conflict merging because remote sync is outside the brief and would weaken the privacy promise.
- Release status depends on complete and accurate user-entered events. The receipt and terms state this limitation.
