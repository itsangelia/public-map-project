# Cooperative drink shop — isolated map preview

## Behavior

The northwest drink shop opens the approved counter interface in a same-origin iframe. The matching screen has two square character portraits with nicknames above them. The first visitor takes seat A and waits for B. Two players choose Base / Flavor / Topping / Finish in A/B/A/B order. Choices advance only after a committed Firebase transaction; both phones render the same committed recipe. Completion shows the enlarged unbranded drink, its name, authors, and Back to map. No straws, ground shadow or ingredient summary.

For this university prototype there is one shared two-seat counter per map room. A third visitor receives a busy message and may retry. All test links must use the same room. This is not a multi-table queue.

## Isolation and files

- `drink-session.js`: pure table seating/turn guards.
- `drink-network.js`: Firebase transaction/presence service using the parent's existing authenticated app.
- `drink-maker-online.js`: iframe UI adapter and square matching screen.
- `drink-shop.js`: transparent proximity-gated map entry and panel lifecycle.
- `multiplayer.js`: imports/installs the optional drink API; existing authentication/presence flow is retained.
- `sketch.js`, `wishing-tree.js`: suppress movement and overlapping interactions while the drink panel is open.
- `scripts/build.mjs`: builds an immutable online panel from the approved offline preview.
- `database.rules.json`: adds only `drinkVisitors` and `drinkTable`; previous player/chat/wish/blessing rules are unchanged.

Drink presence is separate from map presence. Closing the panel removes drink presence, cancels its disconnect registration and detaches listeners; it leaves the map connection running. An aborted opening is cleaned up. Disconnects disable choices and a missing partner blocks further turns. Stale tables may be replaced by a subsequent visitor. If a table was replaced while offline, return to the map or retry matching. Refreshing creates a new temporary map identity, consistent with existing memory-only auth.

## Manual Firebase setup

Before testing, publish the complete checked-in `database.rules.json` using Firebase console → public-map-project → Realtime Database → Rules → replace editor contents → Publish. Keep a copy of the current console rules before replacing them. No paid services or additional auth provider are required.

The new rules restrict presence writes to its owner, require a joined map connection, enforce distinct seats, immutable earlier choices, valid stage options and the authenticated player's turn. They do not grant general room writes.

## Verification and remaining checks

- `npm test`: existing map/chat/wish/blessing regressions plus two-client controlled transport, third-seat rejection, stale table reuse and all 81 model recipes.
- `node scripts/check-drink-maker-preview.cjs`: approved offline UI, mobile sizes, recipe layers and completion.
- `npm run build && node scripts/check-drink-online.cjs`: square portraits/nicknames, waiting, peer-turn lock and shared completion under a controlled parent transport at 320/390px.
- `node scripts/check-drink-map.cjs`: built p5 map entry, iframe open/close and map restoration with a mocked network.

These controlled tests do not prove deployed Firebase permissions or physical-device networking. Firebase emulator setup was attempted, but the cloud environment could not download its database emulator JAR from storage.googleapis.com. Therefore real rules enforcement is unverified here. GitHub Pages/Actions are also not reachable for live verification from this environment.

After publishing the rules and the matching Pages deployment succeeds, open the preview on a computer in display mode. Scan its QR with two phones, join with different nicknames, walk to the northwest shop and tap it on both phones. Confirm square portraits and both names, A/B/A/B turn locks, simultaneous visible drink updates, equal final name/appearance, return to map, waiting-player exit/reentry, partner disconnect, and ordinary movement/chat/wishes still working. Do not promote production until this device test passes.
