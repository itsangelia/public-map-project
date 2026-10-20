# Cooperative fishing — local style and controls preview

This separate self-contained page previews the confirmed gameplay: one player moves a shared float vertically, the other horizontally; a fish relocates around a flat pond and catch progress accumulates while the float overlaps it.

The muted cream/sage/brown illustrated interface preserves the current map's general palette without changing map or character assets. Two large role buttons let a single reviewer switch A/B for local testing. They are preview controls, not real participants or matchmaking.

Provisional tunable settings are grouped in `settings` in `fishing-preview.html`: movement speed 115 world units/s, catch radius 36, eight accumulated seconds to catch, fish target changes every 2.8 seconds. Leaving the fish's area retains progress; there is no timer or failure penalty. Fish movement between random targets uses a short eased transition. These defaults await user review.

Pointer hold/cancel, keyboard directions, keyboard activation, bounds, hidden-page input reset and completion/restart are implemented. Successful fishing shows a catch and Back to map. No Firebase or network code is included, no rules were changed, no location has been placed on the map, and the production drink-shop stable release is untouched.

Run `node scripts/check-fishing-preview.cjs` to check 320/390/430px portrait controls, separate movement axes, input release, bounds, random targets, overlap-only cumulative progress and completion/reset. This is local UI/mechanics verification only.

Publish only this preview with `python3 scripts/deploy-fishing-preview.py`; it preserves the production homepage and all unrelated releases. Wait for the corresponding GitHub Pages deployment before opening the immutable preview link. Screenshots are immediately viewable from the source branch.
