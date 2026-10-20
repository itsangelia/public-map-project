# Drink maker portrait interface preview

The user approved previewing the drink-shop interior before implementing live two-player matching and synchronization. This is a standalone local UI prototype on `feature/drink-shop-ui`, not a connected multiplayer game. All existing production map, network, rules and assets remain untouched.

## Exact recipe options

| Stage | Turn | Options |
| --- | --- | --- |
| Base | A | Sparkling Water / Milk Tea / Slush |
| Flavor | B | Strawberry / Matcha / Mango |
| Topping | A | Pearls / Coconut Jelly / Red Bean |
| Finish | B | Milk Foam / Ice Cream / Lemon Slice |

Both preview turns can be played on one device. Placeholder labels Player A and Player B are visibly accompanied by INTERFACE PREVIEW; no real participants, online count, pairing or server acknowledgement is simulated. Selecting an option updates the drink illustration. Confirming passes to the next stage with an A/B/A/B sequence. Each stage requires a selection. The last confirmation shows the composed drink, all four ingredients and both placeholder makers, with a restart action. Actual player nicknames, sessions, exclusive turn writes, partner departure and multiplayer synchronization await user approval after visual review.

## Style and isolation

`drink-maker-preview.html` is self-contained HTML/CSS/JavaScript with procedural SVG cups, fruit, toppings and decorations. It uses the approved cream/pink/sage palette, dark illustrated outlines and small striped awning motif. It does not alter original artwork or vendored libraries, load Firebase, store data, or modify the p5.js map. The original application remains based on p5.js; this page is only an appearance prototype for the future interior overlay.

Selection cards and action buttons support touch and keyboard focus. The page uses portrait-responsive layout, safe-area padding, document scrolling where needed and reduced-motion preferences. It has no external runtime dependencies.

## Verification

Run `node scripts/check-drink-maker-preview.cjs` with available Playwright and Chromium. Checks exercise 320×568, 375×667, 390×844 and 430×932 viewports, three choices at each stage, exact representative recipe selections, alternating roles, disabled confirmation before selection, completion, reset, no horizontal overflow, all 81 recipe combinations and absence of runtime errors. They do not validate live multiplayer.

Review screenshots are in `previews/drink-maker-base.png`, `previews/drink-maker-flavor.png` and `previews/drink-maker-finished.png`.

## Preview deployment

Run `python3 scripts/deploy-drink-maker-preview.py`. It publishes only `preview/drink-maker.html` and a version-specific `preview/drink-maker-{hash}.html`; it asserts production index and all unrelated deployment paths are unchanged. No production build, Firebase setup or data migration is needed. A Git push is not verification of a completed Pages deployment. The last observed slow Pages deployment took approximately 12 minutes; await the corresponding successful deployment before claiming the new URL is live. Screenshots on the source branch can be reviewed immediately.

## Approved counter style — 2026-10-20

Updated the isolated preview to the approved muted illustrated counter style: upright ingredient cards, dusty pink/cream controls, wooden scene and an unbranded dynamic SVG cup. The background is embedded so each immutable HTML preview remains self-contained. All twelve choices and alternating A/B/A/B steps remain locally interactive. No Firebase, matching or production map changes.

Validation: four portrait sizes (320×568 through 430×932), visible confirmation controls, no cup logo, selection guards, all 81 recipes, completion/reset, no runtime errors. This validates the local interface only; independent devices are not connected in this preview.
