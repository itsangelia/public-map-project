# Cooperative fishing — local style and controls preview

This separate self-contained page previews the confirmed gameplay: one player moves a shared float vertically, the other horizontally; a fish relocates around a flat pond and catch progress accumulates while the float overlaps it.

The muted cream/sage/brown illustrated interface preserves the current map's general palette without changing map or character assets. Two large role buttons let a single reviewer switch A/B for local testing. They are preview controls, not real participants or matchmaking.

Provisional tunable settings are grouped in `settings` in `fishing-preview.html`: movement speed 115 world units/s, catch radius 36, opening progress 20%, ten seconds from zero to full (gain 10% per second), loss 5% per second while misaligned, and fish target changes every 2.8 seconds. Opening progress counts toward completion, so uninterrupted alignment from the start wins after eight seconds. Reaching zero ends the round as a failure, stops movement/progress updates and offers Try again. Restart restores opening progress and fish/float positions. Fish movement between random targets uses a short eased transition. These defaults await user review.

Pointer hold/cancel, keyboard directions, keyboard activation, bounds, hidden-page input reset and completion/restart are implemented. Successful fishing shows a catch and Back to map. No Firebase or network code is included, no rules were changed, no location has been placed on the map, and the production drink-shop stable release is untouched.

Run `node scripts/check-fishing-preview.cjs` to check 320/390/430px portrait controls, separate movement axes, input release, bounds, random targets, aligned gain, misalignment decay, exact minimum success time, zero-progress failure/freeze and retry/reset. This is local UI/mechanics verification only.

Publish only this preview with `python3 scripts/deploy-fishing-preview.py`; it preserves the production homepage and all unrelated releases. Wait for the corresponding GitHub Pages deployment before opening the immutable preview link. Screenshots are immediately viewable from the source branch.

The gain/opening interpretation was explicitly selected by the user: the initial 20% counts, allowing an eight-second fastest catch. The user separately confirmed that zero progress means failure. No multiplayer, map or Firebase changes were made.
