# Wish blessings — isolated integration test

The user approved implementing a small response action on 2026-10-20 (Australia/Perth). This branch is `feature/wish-blessings`. The approved production source remains `af6de6f`, immutable site release `2a460071474cdf85`. Do not promote this test to production without user approval.

## Behavior and identity

The pinned paper reading card retains its message, nickname and date. Its footer adds **May it come true ✨**, the shared count, a pending state and a disabled **Blessing sent ✨** state after acknowledgement. Opening a different paper or closing the card unsubscribes the previous listener. The iframe cleanup unsubscribes too. Blessing errors appear only in the card, leaving player presence, movement, wishes and chat untouched. No new animations, notifications or rankings are added.

One immutable boolean is stored at `rooms/{room}/wishBlessings/{wishId}/{anonymousUid}`. Counts are derived from distinct `true` records, so concurrent contributions cannot overwrite each other. UI and network guards prevent rapid double taps. Firebase rules also reject a second record for the same anonymous identity, changes or deletion, writing another UID, an absent wish, and writes without a live player record. Existing wishes can receive blessings without migration. Votes remain after players leave.

The limit is **once per wish per anonymous signed-in identity**, not permanent identity or device tracking. This app intentionally uses memory-only Firebase authentication to avoid the previously observed mobile login/storage hangs. Reloading or reopening the app can create a new anonymous identity. No authentication persistence, fingerprints, identifiers, or account flow is added to enforce cross-session deduplication.

## Host setup

1. Build with `npm run build` and use `python3 scripts/deploy-wishing-tree-preview.py` to publish only the isolated preview and immutable release files. It asserts production `index.html` is unchanged. Do not use the production deployment script for this test.
2. Wait for the corresponding GitHub Pages deployment to succeed. Push completion is not a verified live publication; a previous observed Pages run took 12 minutes 22 seconds.
3. Open the version-specific `preview/wishing-tree-setup-{release}.html` page, copy the complete rules, then Firebase Console → Realtime Database → Rules → replace → Publish. The `players` and `wishes` permissions are unchanged from the approved source; only sibling `wishBlessings` is added. No authenticated Firebase administrator session is available to the agent.
4. Open `preview/wishing-tree-test-{release}.html?mode=display&room=wish-test`. Scan its QR with two independent phones; both join the same exact preview release and room. Production still uses `campus`; no test data is migrated.

## Validation and acceptance

- `npm test`: deterministic transport tests cover simultaneous distinct votes, repeat attempts and pending double taps, offline attempts, persistence after departure, reopening a subscription, denied blessing access while chat/wishes/presence remain operational, and additive permissions. These fixtures do not validate deployed Firebase rules or substitute for a rules emulator.
- `node scripts/check-wishing-tree.cjs`: real Chromium p5/DOM rendering at 375px and 390px, shared mock transport; two open cards update from zero to one to two blessings, buttons disable, reopening retains the sent state, subscriptions close, literal user text stays safe, and map controls resume.
- `node scripts/check-sdk-storage.cjs`: actual Firebase SDK with intercepted auth verifies permanently pending IndexedDB cannot block the login request. The auth implementation remains unchanged.

After the host publishes rules, test with the actual display and two phones: create a wish; open that same wish on both phones; send one blessing and observe the other count; repeatedly tap the sent button; have the other player send; close/reopen the card and check count/state; leave and verify the count remains; verify chat and mutual visibility; temporarily disconnect and recover. Also inspect an existing wish created before this feature. Only the user can confirm these real-device and deployed-rule outcomes.
