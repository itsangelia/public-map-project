# Drink shop map placement preview

The user approved the pink-awning drink-shop icon and its placement near the northwest cafe, with the same proximity glow and breathing emphasis as the wishing tree. This phase adds the icon and cue only. Two-player drink selection and its entry interface remain a subsequent phase.

- Source artwork position: center `(275, 150)`, size `234 × 234` pixels, multiplied by the existing `1.6` world scale.
- The user requested a larger shop; dimensions are 30% larger than the initial preview, keeping the original center so the cup roof remains visible below the phone header.
- Asset: `drink-shop.png`, copied from the approved generated image; original map and avatar files are unchanged.
- Rendering: `drink-shop.js`, called before the wishing tree and players in map and display views.
- Cue: same 230-world-unit approach radius, 160ms easing, cached warm outline, 3.5% enlargement with 0.8% breathing variation, trunk/base anchoring and reduced-motion handling as the approved wishing-tree rendering. It has no added instruction text or hand pointer.
- Existing authentication, player synchronization, chat, wishing-tree behavior, blessings and Firebase rules are unchanged.

## Review and deployment

Build with `npm run build`, then publish only the isolated preview with `python3 scripts/deploy-drink-shop-preview.py`. Do not use the production deployment script before user approval. The helper adds only preview entries and immutable release assets, asserts production index is unchanged, and keeps the QR pointed at the exact same preview release. Use `room=drink-test` on the display and phones. No new Firebase setup is required.

The source branch is `feature/drink-shop-map`. Immediate screenshots for review are in `previews/drink-shop-map-overview.png` and `previews/drink-shop-phone-near.png`; viewing them on GitHub does not require waiting for Pages deployment. Interactive Pages previews are available only after their deployment completes.

## Validation

Chromium rendered the actual p5 map at full-map resolution and 390px phone width, confirmed the icon renders, grows on approach and returns to its normal size on departure, with no runtime errors. Networking was stubbed for this layout/cue check. The existing 375px/390px shared wishing-tree/blessing browser fixture also passed, including cleanup and restored controls. These checks do not substitute for real-device networking validation.
