# Release Ledger — adversarial review 2 handoff

**Result: FAIL**

- Work order: `retainer-release-ledger-review-2`
- Reviewed commit: `814114aaefd9f8ab014e7581536b89e5837bfb47`
- Report: `.factory/review-2.md`
- Product code changed: no

## What was done

Reviewed the live product cold at 390×844 and 1440×900, audited every landing/README sentence, entered and mutated the direct demo, verified reset and real-data isolation, recorded production requests, crawled links, checked route metadata/focus/404 behavior, reran all prior findings, and inspected missed leverage.

The first screen is clear and the direct sandbox is isolated. The primary `Try it with sample data` action is broken because in-app navigation cannot change the storage mode selected at module load. Demo-to-legal navigation also breaks, the first demo phone viewport does not expose realistic records, several claims remain unlisted, copy issues remain, and the static 404 lacks required metadata and the shared skeleton.

## Verification

- `npm ci`: pass, 0 vulnerabilities
- `npm test`: pass, 7/7
- `npm run build`: pass; `dist/` created; JS 39.89 kB (12.18 kB gzip)
- Every exact `.factory/claims.json` command: pass 2/2 in desktop and mobile projects
- Full Playwright run: all 22 cases executed without a reported test failure
- Live Axe: zero serious/critical findings on home, demo, demo job, privacy, terms, and 404
- Live direct demo: separate databases, reset works, Start for real deletes demo storage and preserves real data, 0 external requests
- Live link crawl: all resolved links return 200; unknown route returns 404

## Left to do

Resolve F-2-1 through F-2-9 in `.factory/review-2.md`, add tests that click the public demo and cross the real/demo boundary, then rerun the full adversarial checklist. Screenshots are in `.factory/evidence/review-2/`.
