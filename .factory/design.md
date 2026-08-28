# Release Ledger — visual thesis

## Direction: the threshold garden

Release Ledger uses **surreal editorial scenery** to turn an abstract money-and-delivery decision into a physical threshold. A quiet paper landscape holds a brass release gate, while colored stepping-stones represent money received and work earned. The scene is strange enough to be memorable, but its geometry explains the product: a job moves from held, through review, to ready only when the ledger supports it.

This is a focused utility, not an accounting suite. Chrome is intentionally quiet; the release verdict, covered amount, and event history dominate. Editorial details—small caps, hairline rules, crop marks, paper grain, and asymmetric composition—make each job feel like a case file rather than a generic dashboard.

## Palette

All color roles are semantic and encoded as CSS tokens.

| Role | Light | Dark | Reason |
| --- | --- | --- | --- |
| Background | `#F2EBD9` parchment | `#15201C` night ink | Warm record paper / deep archive shelf |
| Surface | `#FFFDF5` | `#202E28` | Clean working sheet |
| Text | `#17241F` | `#F6F0DF` | Deep green-black editorial ink |
| Muted text | `#59655F` | `#B9C3BA` | Secondary notes, ≥4.5:1 |
| Accent | `#B64231` | `#FF8D72` | Vermilion sealing wax / decisive actions |
| Accent contrast | `#FFFFFF` | `#17241F` | Button label contrast |
| Success | `#267054` | `#65D0A2` | Verdigris gate: ready |
| Warning | `#9A5A0A` | `#F2B85B` | Aged brass: review |
| Danger | `#AD342E` | `#FF8279` | Red pencil: held |
| Rule | `#C8BEA8` | `#46564E` | Ledger ruling |

Color never stands alone: every status includes an icon, a word, and an explanation.

## Typography

- **Display:** Georgia, `Times New Roman`, serif. The high-contrast serif gives the verdict and job names the authority of an editorial folio without shipping a font payload.
- **Utility:** Inter-like system stack (`ui-sans-serif`, `system-ui`, sans-serif). Compact, familiar, and fast for forms and tables.
- Scale: 14 / 16 / 20 / 28 / clamp(40–72) px. Body is 16px minimum; long text is limited to 68ch with 1.55 leading. Financial figures use tabular numerals.

## Spacing and shape

- Base rhythm: 4px; primary gaps: 8, 12, 16, 24, 32, 48, 64px.
- Working width: 1180px; reading width: 68ch.
- Cards are reserved for independent jobs and the release verdict. Event rows stay visually connected as ruled ledger entries.
- Corners are subtly irregular in spirit but implemented as crisp 2/12/24px radii. Verdict pills are fully rounded; controls are 10px.
- Every pointer target is at least 44×44px. Mobile at 390px stacks the balance, verdict, and controls; decorative scene details simplify while all data and actions remain.

## Interaction grammar

- Primary verbs are explicit: “Create job”, “Record event”, “Record release decision”.
- Adding an event feels like placing a new line in the ledger: it enters from the form’s edge and the balance figures briefly emphasize.
- Release decisions are deliberate records, not a toggle. Ready/review/held is computed from money received, work due, and the latest decision; users can always see why.
- Destructive deletion requires a named confirmation. Job deletion is not offered in v1; records can be archived and restored.
- Toasts announce saves, exports, offline status, and updates. Focus returns to the action’s logical origin after dialogs close.

## Motion

UI transitions last 160–240ms and animate only opacity/transform. The hero illustration drifts once into place on first paint; nothing loops. Under `prefers-reduced-motion: reduce`, all spatial movement is removed, smooth scrolling is disabled, and state changes use instant/opacity-only feedback.

## Original asset plan and provenance

### Hero: `threshold-garden`

- Use case: `stylized-concept`
- Subject/world: a floating parchment island holding a slim brass gate; five terracotta and verdigris stepping-stones cross a dark ink void toward a wrapped portfolio parcel.
- Materials: torn cotton paper, oxidized brass, sealing wax, graphite marks, tiny ledger ruling.
- Light/lens: soft raking window light, long editorial shadows, elevated three-quarter view, generous negative space.
- Palette words: parchment, bottle-green ink, sealing-wax vermilion, aged brass, verdigris.
- Negative list: people, hands, currency symbols, readable text, numbers, logos, watermarks, UI screenshots, gradients, glossy 3D plastic, photoreal banking imagery.
- Prompt: “Use case: stylized-concept. Asset type: responsive landing-page editorial hero. Scene/backdrop: a surreal floating island cut from warm cotton ledger paper over a deep bottle-green ink void. Subject: a slender oxidized-brass threshold gate, five terracotta and verdigris stepping-stones forming a clear path, and a small portfolio parcel wrapped in cream paper waiting safely beyond the gate. Style/medium: sophisticated hand-built editorial still life, paper sculpture with subtle graphite and screenprint texture. Composition/framing: wide 3:2 elevated three-quarter view, clean silhouette and breathing room around every object. Lighting/mood: soft raking studio window light, long calm shadows, cautious but hopeful. Color palette: parchment, bottle-green, sealing-wax vermilion, aged brass, verdigris. Materials/textures: torn cotton paper fibers, brushed metal patina, matte wax, faint ledger ruling. Constraints: no people, no hands, no currency symbols, no readable text, no numbers, no logos, no watermark, no UI, no border; avoid glossy plastic, generic fintech imagery, neon gradients.”
- Generator: Azure AI Foundry factory image deployment via `/opt/fleet/lib/gen-image.sh`; generated 2026-08-28. Original generated asset for this product. No third-party or stock assets.
- Review criteria: no accidental glyphs or brands; a legible path-to-gate metaphor; clean crop at desktop and mobile; palette cohesion.

The app icon and small interface symbols are original inline SVG geometry authored for Release Ledger. Generated imagery is disclosed in the footer.

