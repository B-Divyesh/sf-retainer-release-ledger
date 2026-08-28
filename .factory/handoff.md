# Release Ledger — polish round 2 handoff

**Result: PASS**

- Work order: `retainer-release-ledger-polish-2`
- Base reviewed: `814114aaefd9f8ab014e7581536b89e5837bfb47`
- Repair commit: `6aefad5b85d2016b75cfa9378bc852994b1a841f`
- Deployment: <https://retainer-release-ledger.sociobot.in>
- Deploy tool: `/opt/fleet/lib/deploy-static.sh retainer-release-ledger dist`
- Azure deployment ID: `2ced8112-9bb7-45d8-b8d4-f1e592c1f863`

## What changed

- Demo entry is a true real↔demo document transition, so the visible CTA and header link select `demo:release-ledger` before the app opens.
- The demo phone screen immediately shows Northstar brand handoff, Northstar Coffee, received money, a Ready reason, and a recent entry. It retains reset and discard controls.
- Public privacy/custody/payment/analytics/advertising/online-copy wording and the no-purchase promise are in `.factory/claims.json`, with observable tests.
- Copy now consistently calls the post-deposit entry a **balance payment**, uses `release status`, and uses plain section/deployment wording.
- Static 404 now has full route metadata, icons, product header/footer, legal links, factory credit, and build label while Static Web Apps preserves the HTTP 404 response.
- Manifest and service-worker cache version advanced to v3.

## Exact verification evidence

Clean remote clone: `/tmp/release-ledger-clean-Sc1mfE` at `6aefad5`.

- `npm ci`: passed; 0 vulnerabilities.
- `npm test`: 7/7 passed.
- `npm run build`: passed; `dist/` produced. JS 40.71 kB (12.35 kB gzip); CSS 24.85 kB (6.30 kB gzip).
- `npm run test:e2e`: 26/26 passed across desktop Chromium and 390 px Chromium. This includes Axe checks with 0 serious/critical violations, keyboard/focus, static 404 metadata, responsive targets, privacy requests, and offline sample reload.
- Every exact claim command passed separately in that clean clone, each in both browser projects:
  - `npm run test:e2e -- --grep @claim:demo-isolation`
  - `npm run test:e2e -- --grep @claim:browser-privacy`
  - `npm run test:e2e -- --grep @claim:offline-reload`
  - `npm run test:e2e -- --grep @claim:data-export`
  - `npm run test:e2e -- --grep @claim:release-status`
  - `npm run test:e2e -- --grep @claim:client-receipt`
  - `npm run test:e2e -- --grep @claim:accessible-responsive`
  - `npm run test:e2e -- --grep @claim:no-purchase-required`

## Live cold recheck

After deployment, a fresh 390×844 Chromium context opened the live home, created a real `Cold real job`, then clicked the visible sample CTA. The result was `/demo` with the persistent banner, Northstar sample preview, and no real job present. Demo → Privacy performed a correct full transition without the demo banner. A cold unknown path returned the styled static 404 with title, canonical, header, and footer. Normal live home/demo/privacy flows had no console errors; Chromium reports the expected failed-resource message when navigating to the deliberately HTTP-404 path.

- [Live cold-check JSON](evidence/live-polish-2-check.json)
- [Live mobile demo screenshot](evidence/live-polish-2-demo-mobile.png)
- [Local static-404 screenshot](evidence/polish-2-404.png)
- [Finding-by-finding map](polish-2.md)

## Known gaps and next steps

None. The product remains a static, local-first offline PWA; deployment infrastructure was not otherwise changed.
