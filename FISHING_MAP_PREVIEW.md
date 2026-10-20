# Fishing entrance placement and proximity preview

The user approved the fishing entrance artwork with two rods, two floats, a rear-right dock, pale aqua water and ripples with no live fish. `fishing-spot.png` is copied unchanged from the approved generated transparent image.

Provisional placement is on the southwest lawn: original-art center (350, 690), width 252 and height 209.7, scaled by the existing 1.6 world scale. The original map and all character assets are preserved. Position and size await user review in the isolated map preview.

`fishing-spot.js` draws the overlay in the phone and public-display map passes. Its approach point is near the foreground edge, with the existing 230-world-unit proximity radius. The cached warm alpha-outline, 160ms easing and base-anchored 3.5% breathing cue follow the wishing-tree/drink-shop treatment. Reduced-motion settings retain a steady highlight. Open drink/wishing panels suppress the new approach cue. This phase does not open a fishing panel or change multiplayer, chat, wishes, blessings or Firebase rules.

`npm run build` includes the overlay and artwork in the immutable release. `node scripts/check-fishing-map.cjs` verifies built public-display and phone rendering, near/far state changes and no runtime errors with a stubbed map transport; this does not claim live networking validation. Screenshots are in `previews/fishing-map-overview.png` and `previews/fishing-phone-near.png`.

`python3 scripts/deploy-fishing-map-preview.py` publishes only a dedicated preview entry and that release's assets, asserting the production homepage is unchanged. Its QR keeps both phones on the same immutable preview and room. Wait for the corresponding Pages deployment before opening it. The production drink-shop stable version and backups remain unchanged.

After user approval of the southwest placement, the icon was uniformly reduced by 10% around the same center. Proximity cue and artwork remain unchanged.

## Production approval — 2026-10-20

The user approved the reduced icon at the southwest lawn and authorized production publication. Publish immutable release `077c10fdaab26ed2`. This promotion adds only the pond artwork and proximity reminder to the live map; the standalone fishing mechanics preview is not integrated into production. Existing Firebase rules and multiplayer game behavior are unchanged. The previous stable drink-shop source/site tags remain available.
