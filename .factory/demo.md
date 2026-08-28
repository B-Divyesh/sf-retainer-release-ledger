# Release Ledger demo

- URL: `https://retainer-release-ledger.sociobot.in/demo` or `/?demo=1`
- Storage: IndexedDB database `demo:release-ledger`; the real database is `release-ledger`
- Sample: Northstar brand handoff is Ready, Harbor website launch is Hold, and Cedar packaging files is Review
- Entries: deposits, a balance payment, milestones, a release, and a refund
- Reset: choose **Reset demo** in the persistent banner
- Exit: choose **Start for real**; this deletes the demo database before opening the real ledger

All claim tests start from the demo entry point. The offline test reloads a sample job after disabling the browser network.
