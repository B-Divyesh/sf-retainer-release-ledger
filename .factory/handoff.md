# Release Ledger — adversarial review 1 handoff

**Result: FAIL**

- Work order: `retainer-release-ledger-review-1`
- Reviewed commit: `3474c2652e4a9d340429fa1ea7b3f535be5a38a8`
- Live URL: <https://retainer-release-ledger.sociobot.in>
- Full report: [`.factory/review-1.md`](review-1.md)

## What was done

Reviewed the live product cold at 390×844 and 1440×900, audited all landing and README copy, checked `/demo` and `?demo=1`, inventoried unlisted claims, crawled routes and links, checked route metadata/focus/touch targets/headers, and re-verified every earlier handoff defect against the byte-identical production bundle. No product code was changed.

## Verification

From a clean clone:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Results: 3/3 unit tests, production build, and 8/8 Playwright tests passed. There is no `.factory/claims.json`, no `@claim:` test, and no isolated demo. Two live Lighthouse performance runs scored 100; Axe in the repository suite reported no serious or critical violations. Live HTML and JS matched the clean build by SHA-256.

## Blocking work left

The report records all blockers and exact fixes. Highest priority: replace the metaphorical first screen with a plain audience/job/action; add a one-click isolated sample demo and claim tests; stop unsafe over-release; restore checkout; make imports atomic and CSV safe; correct license refresh, toast, touch, and focus behavior; implement real 404/routing metadata; and add the required response policies.

The tree remains buildable. Only this handoff and the review report were intentionally changed.
