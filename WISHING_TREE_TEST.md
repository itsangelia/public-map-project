# Wishing tree integration test

The user approved the wishing-tree preview, proximity glow and promotion to production on 2026-10-19. The approved immutable release is `4409510c7e28c8f6`. Production and the isolated preview use the same release files; only their entry URL and room differ.

## Production entry points

- Display and matching QR: https://itsangelia.github.io/public-map-project/?mode=display&room=campus
- Phone: https://itsangelia.github.io/public-map-project/?room=campus

Production uses the `campus` room. Wishes from the isolated `wish-test` room stay in that room and are not copied into production. The previously published room-generic Firebase rules cover both rooms. Promotion does not alter Firebase data or republish rules.

Backups before promotion: source `backup-before-wishing-tree-2026-10-19`, deployment `backup-site-before-wishing-tree-2026-10-19`. The previous stable tags are also retained.

## Test entry points

- Host setup and copyable additive Firebase rules: https://itsangelia.github.io/public-map-project/preview/wishing-tree-setup.html
- Display and matching QR: https://itsangelia.github.io/public-map-project/preview/wishing-tree-test.html?mode=display&room=wish-test
- Phone: https://itsangelia.github.io/public-map-project/preview/wishing-tree-test.html?room=wish-test

The host must publish the complete `database.rules.json` through Firebase Console → Realtime Database → Rules → Publish. Player/chat rules remain byte-for-byte equivalent as parsed JSON; wishing permissions are added as a sibling. This environment has no authenticated Firebase administration session, so rule publication and deployed rule evaluation are not automated.

## Behavior

Approach the central plaza tree within 230 world units of its base, then tap it. The original map, characters, mobile zoom, joystick, movement speed and five-second speech bubbles are retained. The tree board is a same-origin iframe to keep its approved styles isolated from the map. Movement and map controls pause while it is open. Returning restores controls and the same player connection.

The editor inherits the active player's nickname. Wishes are immutable creates under `rooms/{room}/wishes/{uuid}` and remain after players disconnect. Names are validated against that player's live connection record. Each read is ordered by `createdAt` and limited to the latest 100 wishes; pagination shows six at a time. Older records remain in Firebase but are not loaded by the prototype. No sample wishes are inserted. Successful submission requires Firebase acknowledgement. A queued write keeps its ID and draft while waiting for reconnection; a pending submission cannot be resubmitted or dismissed. Wish errors never change presence/chat connection status.

## Validation

- `npm test`: deterministic Firebase transport fixtures exercise original multiplayer regressions, wishes shared between independent identities, persistence after departure, permission-error isolation, invalid inputs and unchanged player/chat rules. These are not Firebase rules emulator tests.
- `npm run build`
- `node scripts/check-sdk-storage.cjs`: actual SDK with intercepted auth and permanently pending IndexedDB.
- `node scripts/check-wishing-tree.cjs`: Chromium at 375px/390px, real p5 rendering and DOM interactions with a shared mock transport; approach gating, nickname inheritance, wishes, safe text, message cards and restored controls.

After publishing rules, test with the display and two independent phones in `wish-test`: mutual visibility, chat and five-second bubbles; two wishes visible on both phones; literal markup/emoji/newlines; close/reopen and refresh persistence; author leaving while their wish remains; reconnect; mobile keyboard and scrolling. Do not claim these real-device checks passed from the local fixtures.

## Future isolated deployment

Run `npm run build`, then `python3 scripts/deploy-wishing-tree-preview.py`. It adds only the dedicated preview pages and immutable release directory, preserves production `index.html`, and checks that no other deployment paths change. Its QR points back to this exact preview entry and carries the same room. Do not run `scripts/deploy-pages.py` for a test deployment. For the approved production promotion, `npm run build` followed by `python3 scripts/deploy-pages.py` publishes the root entry and retains existing previews and older immutable releases.
