# Release Ledger

Release Ledger is a private, local-first release gate for freelancers and small service shops. It records deposits, later payments, refunds, completed milestones, and release decisions so the person handing over work can answer one question: **is the work recorded as ready and covered?**

Live target: https://retainer-release-ledger.sociobot.in

It is deliberately not invoicing software, a bank connection, a payment processor, accounting advice, or escrow.

## What v1 includes

- Per-job red / amber / green release verdict with a plain-language reason
- Immutable-style event history for deposit, milestone, release, refund, and balance events
- Net paid, available coverage, remaining payable, and unreleased milestone totals
- Client receipt with print-to-PDF output
- Whole-ledger JSON backup/import and CSV export; per-job CSV export
- Configurable currency, tax label, client details, reference, and agreed total
- IndexedDB storage, PWA installation, cached app shell, and tested offline reload
- Light/dark themes, keyboard-complete dialogs, responsive 390px layout, privacy and terms pages
- Useful free tier (three active jobs); one-time $24 Owner unlock for unlimited active jobs and custom receipt notes through the Sociobot billing API

## How the verdict works

Deposits and balance payments increase money received. Refunds reduce it. Milestones record the value of work now ready. Release events preserve the decision and value actually handed over. “Ready to release” appears when available recorded payments cover pending milestone work. A recorded hold always shows as held until a newer decision changes the state.

The verdict is only as accurate as the entries and is not a guarantee against payment reversal or dispute.

## Develop

Requires Node.js 20+.

```sh
npm ci
npm run dev
```

Quality gates:

```sh
npm test          # calculation unit tests
npm run build     # exact production build; outputs dist/index.html
npm run test:e2e # desktop + 390px flows, axe, offline reload
npm run check     # unit tests + build
```

Playwright is pinned to `1.58.2`. The factory image already includes its Chromium build; elsewhere, run `npx playwright install chromium` once.

## Deploy and configuration

Deploy the contents of `dist/` as a static SPA with unknown routes falling back to `index.html`. The service worker handles installed/offline navigation after first load.

The production billing base defaults to `https://api.sociobot.in`. Staging can override it at build time:

```sh
VITE_BILLING_API_BASE=https://pilot-api.sociobot.in npm run build
```

The checkout and verification URLs are derived from the product slug; no billing product ID or secret is stored in this repository.

## Privacy and data ownership

Job and client data stays in IndexedDB on the current browser profile. License tokens and cached verification status use localStorage. There is no analytics, advertising, remote ledger sync, third-party font, or runtime CDN. Users should export JSON backups before clearing browser data.

See [.factory/brief.json](.factory/brief.json) for scope, [.factory/design.md](.factory/design.md) for the visual system and artwork provenance, and [.factory/handoff.md](.factory/handoff.md) for verification results.

## License

MIT. See [LICENSE](LICENSE).
