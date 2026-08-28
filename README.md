# Release Ledger

Release Ledger helps freelancers and small service shops compare client payments with finished work.

Record deposits, later payments, refunds, completed milestones, and release decisions. See whether recorded payments cover work that is ready to send.

Live site: <https://retainer-release-ledger.sociobot.in>

Try the isolated sample: <https://retainer-release-ledger.sociobot.in/demo>

It is not invoicing software, a bank connection, a payment processor, accounting advice, or escrow.

## What it includes

- A release status: Ready, Review, or Hold, with a reason.
- Entries for deposits, milestones, releases, refunds, and later payments.
- Payments received, available amount, amount still due, and finished work not sent.
- Client receipts that print or save as PDF.
- JSON backup import and export, plus CSV for all jobs or one job.
- Currency, tax label, client details, reference, agreed total, and receipt note fields.
- Offline reload after the first visit.
- Keyboard operation, light and dark themes, and a layout tested at 390 px.

All features are available without an account or purchase.

## How release status is calculated

Deposits and later payments increase money received. Refunds reduce money received. Milestones record the value of finished work.

A release entry records the decision and value sent. Ready appears when recorded payments cover finished work that has not been sent.

A recorded Hold remains until a newer decision changes it. Releasing beyond recorded payments or finished work always shows Hold.

The release status depends on your entries. It cannot guarantee that a payment will not be reversed or disputed.

## Sample demo

Open `/demo` or `/?demo=1` to load three sample jobs. Demo data uses the separate `demo:release-ledger` browser database.

Reset demo restores the sample. Start for real deletes demo data and returns to your ledger.

See [.factory/demo.md](.factory/demo.md) for the sample records and verification path.

## Run and test

Use Node.js 20 or later.

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
```

The build writes the static PWA to `dist/`. Playwright is pinned to `1.58.2`.

The factory environment includes Chromium. Elsewhere, install it once with `npx playwright install chromium`.

Every public product claim is listed in [.factory/claims.json](.factory/claims.json). Each entry includes its isolated test command.

## Deploy

Deploy `dist/` as a static site. The included Static Web Apps configuration provides routes, headers, caching, and a real 404 response.

The installed pages reopen without a connection after the first visit.

## Privacy and data ownership

Job and client data stays in this browser profile. Demo data stays in its separate database until reset or exit.

There is no analytics, advertising, bank connection, or online copy of the ledger. Export a JSON backup before clearing browser data.

Read the live [privacy policy](https://retainer-release-ledger.sociobot.in/privacy) and [terms](https://retainer-release-ledger.sociobot.in/terms).

## Product records

See [.factory/brief.json](.factory/brief.json) for scope and [.factory/design.md](.factory/design.md) for visual and artwork provenance.

## License

MIT. See [LICENSE](LICENSE).
