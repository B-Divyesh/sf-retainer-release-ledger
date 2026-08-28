# Release Ledger — polish round 1 handoff

**Result: PASS**

- Work order: `retainer-release-ledger-polish-1`
- Candidate repaired: `3474c2652e4a9d340429fa1ea7b3f535be5a38a8`
- Review source: `6bdee6c7d7a1a44a950a657664c3a9eddde8a3bd`
- Repair commit: `4a4be10` plus the evidence handoff commit
- Live URL: <https://retainer-release-ledger.sociobot.in>
- Demo URL: <https://retainer-release-ledger.sociobot.in/demo>
- Deployment: Azure Static Web Apps production deployment `ec94c6b4-64d5-4abd-9add-25e3eadb2f0d`

## What changed

Every finding in `.factory/review-1.md` and `.factory/verification.md` is resolved. The first screen now names the job and audience, exposes the sample action before artwork on mobile, and keeps the threshold-garden identity.

The sample path is isolated in `demo:release-ledger`, has realistic seeded jobs, Reset demo, and Start for real. Unsafe release/refund states show Hold. Imports are atomic, amounts are bounded, CSV is formula-safe, and mutation announcements persist.

Routes now have titles, descriptions, canonical metadata, social art, focus announcements, legal navigation, policy headers, correct manifest MIME, immutable asset caching, and an HTTP 404 page.

The external $24 checkout remained unavailable. The product now ships every feature without a purchase or license gate; no broken commercial claim remains.

## Verification

From a fresh clone of commit `4a4be10`:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Results: 0 audit vulnerabilities, 7/7 unit tests, a production build, and 22/22 browser tests. Every claim command also passed separately in both browser projects.

Built sizes: JS 39.89 KB (12.18 KB gzip), CSS 23.81 KB (6.10 KB gzip), mobile hero 29.59 KB, desktop hero 81.57 KB.

Live verification after deployment:

- Factory verifier: title/lang/h1/main/alt pass; no console errors.
- Axe: 0 serious or critical issues.
- Lighthouse: 100 performance, 100 accessibility, 100 best practices, 100 SEO.
- LCP 1.1 s, TBT 0 ms, CLS 0.
- Unknown path returns HTTP 404; known routes return 200.
- CSP, `frame-ancestors`, Permissions-Policy, immutable asset caching, and manifest MIME confirmed.
- Cold 390×844 check: CTA and three facts appear before artwork; no horizontal overflow; all global targets are 44–48 px high.
- Live demo reloads offline, uses a separate database, and an excessive release shows Hold with the exact excess.
- Live HTML matches local `dist/index.html` by SHA-256.

Evidence is in `.factory/evidence/`, with the finding map in `.factory/polish-1.md`.

## Known gaps and next steps

None. Billing can be reconsidered only after the Sociobot product endpoint is enabled and independently smoke-tested.
