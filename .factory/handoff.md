# Release Ledger — verification handoff

**Independent verification result: FAIL**

- Tested commit: `5bf1a255bb438b2bd915e2f615a511a7918edfc1`
- Tested URL: <https://retainer-release-ledger.sociobot.in>
- Verification date: 2026-08-28 UTC
- Detailed report: [`.factory/verification.md`](verification.md)

## Release blockers

1. **High — unsafe over-release state (`RL-QA-001`):** a `$500` Ready release is accepted against only `$100` paid and `$100` completed work. The UI then shows amber **Review next step**, not a red over-release warning.
2. **High — checkout unavailable (`RL-QA-002`):** the live **Buy once for $24** endpoint returns HTTP 404 with `{"error":"enabled factory product","status":404}`.

## Other defects

- Medium: failed imports partially persist earlier records; `1e308` becomes `$∞`; an invalid background license verdict leaves the page visibly unlocked until reload; CSV formula-leading cells are unsanitized; three mobile targets are below 44px; Lighthouse performance was 76 then 91 across two runs.
- Low: valid-import and other mutation success toasts are erased by re-render; initial focus bypasses the skip/header sequence; hashed-asset caching and response-policy hardening are incomplete.

## What passed

- Clean `npm ci`, 3/3 unit tests, exact production build/type-check, 8/8 repository E2E tests, and `npm audit` with zero findings. No separate lint target exists.
- Normal deposit/milestone/release/refund arithmetic, client receipt and print/PDF path, JSON/CSV export, free-tier archive recovery, privacy/legal routes, desktop and 390px layouts, dark mode, and invalid-input recovery.
- Axe found zero serious/critical issues on tested home, receipt, privacy, terms, and dark/reduced-motion pages; no console or page errors were observed.
- The live HTML, JS, CSS, service worker, manifest, hero assets, and icons match the candidate build byte-for-byte.
- Chromium reports no manifest/installability errors. The service worker controlled live reload, retained IndexedDB data offline, displayed offline state, and surfaced an update-ready toast in a controlled update test.
- First load made same-origin requests only; no analytics, third-party scripts/fonts, or ledger-data egress was observed.
- Bundle/image budgets pass. Lighthouse mobile LCP was 1.2–1.4s and CLS 0; accessibility/best-practices/SEO were 100 in both runs.

## Reproduce

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm audit
```

For the main blocker, create a `$100` job, record a `$100` deposit and `$100` milestone, then record a Ready release for `$500`. For the deployment blocker, request `https://api.sociobot.in/api/v1/products/retainer-release-ledger/checkout`.

No product code was changed during verification. Fix the two high-severity defects, then rerun all local, live identity, offline/update, accessibility, policy, and performance checks.
