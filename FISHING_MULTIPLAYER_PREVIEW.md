# Cooperative fishing — isolated multiplayer preview

## Confirmed behavior

The approved southwest pond keeps its artwork, reduced size, position and proximity reminder. A nearby player taps it to open the fishing panel. Two square portraits and nicknames match the existing drink-shop screen. One shared two-seat pond is available per map room; an extra visitor receives a busy message and may retry.

A is assigned vertical control, B horizontal control. Roles cannot be switched online. Both phones see one float, fish and progress state. A three-second countdown precedes fishing. The user-selected balance is 20% opening progress, +10% per second aligned, -5% per second misaligned. Initial progress counts, so an uninterrupted aligned catch takes eight seconds. Zero progress fails and full progress succeeds. Both terminal states stop the round. Either connected player can retry; a new round ID resets both phones and starts a new countdown. Return to map preserves the parent map session.

## Synchronization and lifecycle

`fishing-session.js` is the pure model. `fishing-network.js` reuses the map's Firebase app and temporary identity; no additional auth instance or backend server is created. The parent's optional fishing API is installed alongside the existing drink API. Existing map auth/presence code remains unchanged.

Each player writes only their own direction and presence heartbeat. The A client runs the shared simulation and commits it about every 120ms through guarded transactions. The B client renders committed simulation values and never calculates an independent outcome. Input heartbeats expire after 1.5 seconds. Hidden tabs publish not-ready/zero direction, and simulation pauses when either participant is absent/not ready/stale. A stale simulation also disables the visible peer's controls. There is no host migration: if A leaves, B returns to the map to rematch. Rendering interpolates positions without predicting gameplay or progress.

This is a cooperative university prototype with a trusted participant acting as simulation host, not a cheat-resistant server-authoritative competitive game. Network latency can slow simulation advancement; background/offline time is not retrospectively deducted from the progress bar.

Abort/close detaches listeners, stops timers, cancels its disconnect operation and removes only fishing presence. Matching and simulation state are separate from map, chat, wishes, blessings and drink sessions. Matching transactions prevent a third occupied seat; round guards prevent previous-round updates from affecting a new round. Old round records remain stored; active clients subscribe only to their current round.

## Files and Firebase setup

- `fishing-session.js`: deterministic shared movement, target relocation and progress rules.
- `fishing-network.js`: matching, input heartbeat, host transactions, retry/cleanup.
- `fishing-online.js`: approved interface with locked roles, shared rendering and matching screen.
- `fishing-spot.js`: proximity-gated iframe entry/exit.
- `scripts/build.mjs`: generates `fishing-game.html` from the approved standalone preview, omits its local animation loop and adds the online adapter.
- Minimal guards in `sketch.js`, `wishing-tree.js`, `drink-shop.js` prevent overlapping panels/map inputs.
- `database.rules.json`: adds `fishingVisitors`, `fishingTable`, `fishingGames`; all earlier room rules are unchanged.

Publish the full `database.rules.json` in Firebase console → public-map-project → Realtime Database → Rules → Publish, retaining a copy of the previous console rules. The additions restrict each input/presence record to its authenticated owner and each shared simulation to seat A, with current-round, range, shape, terminal/sequence and timestamp validation. Do not set general room read/write permissions to true.

## Verification

- `npm test`: 19 tests, including two independent controlled fishing clients, simultaneous axes, host/background pause, retry, cleanup, all previous map/chat/wish/blessing/drink regressions, and exact gain/decay/success/failure model timing.
- `node scripts/check-fishing-online.cjs`: two assigned-role browser views at 320/390px, square matching, countdown input lock, hold/release, stale-state pause, failure/retry and return-to-map contract with a controlled parent transport.
- `node scripts/check-fishing-map.cjs`: built p5 map, original pond cue, panel entry/exit and restored map with a stubbed network.
- Existing drink online and local fishing preview browser checks also pass.

These are local/model/controlled-transport checks. Deployed Firebase rules and real phone networking are not independently verified here; downloading the database emulator was blocked in this environment during the earlier phase. GitHub Pages/Actions live verification is also unavailable. Wait for the matching Pages deployment to finish before testing the new immutable preview.

## Required device review before production

Open the isolated display preview with `mode=display&room=fishing-test`; scan its QR from two independent phones. Both choose avatars/nicknames, walk to the southwest pond and tap it. Confirm the correct portraits/roles, countdown, A-only vertical input, B-only horizontal input, identical fish/float/progress, decay/failure/retry and a successful catch. Check release of held controls, backgrounding either phone, temporary disconnection, leaving during matching/play and returning to ordinary map movement/chat/drinks/wishes. The production homepage is not changed until the user approves this device test.
