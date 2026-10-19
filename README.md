# Multiplayer Public Map

The original p5.js artwork, character assets and streetlight entrance are preserved.
Streetlight repair is a placeholder, not a working cooperative game.

## Local development

Use the existing checkout; do not create a Git worktree for ordinary cloud tasks.
Node.js 24 and Python 3 are available in the prepared cloud environment.

```sh
cd /workspace/public-map-project
npm ci --cache /workspace/.npm-cache
npm run build
npm start
```

The phone entry is `/`; the public display is `/?mode=display&room=campus`.
Use the same room on every client. A room may contain 1–40 ASCII letters,
numbers, underscores or hyphens. Without Firebase configuration, this is an
explicitly labelled local preview. A localhost address is for local checks only;
phones need the deployed HTTPS site. Live server processes must restart in new tasks.

## Firebase setup

1. In Firebase Console, create a project and register a Web App under Project
   settings > General > Your apps. Copy its public `firebaseConfig` object into
   the `firebase` field of `firebase-config.js`. Include the Realtime Database URL.
   Never put service-account private keys or admin credentials in this file.
2. Under Build > Authentication > Get started > Sign-in method, enable Anonymous.
3. Under Build > Realtime Database, create a database in locked mode. In its Rules
   tab, replace the rules with `database.rules.json` and publish. Do not use open
   test-mode rules. These rules allow authenticated room reads and only writes to
   a user's own connection records, with validated fields and coordinate bounds.
4. Use Firebase Hosting for the static site. After installing the Firebase CLI
   and signing in on your own computer, run `npm ci`, `npm run build`, then
   `firebase deploy --only hosting --project YOUR_PROJECT_ID` from this directory.
   The checked-in `firebase.json` specifies the hosting files. No CLI login or
   administrative credentials are required by the browser application.
5. Add the deployed hostname to Authentication > Settings > Authorized domains
   if it is not already present. Open the deployed site with
   `?mode=display&room=campus` on the public screen. The QR code uses that site's
   HTTPS address. If necessary set `publicBaseUrl` in `firebase-config.js` to the
   deployed site URL, then redeploy.
6. Scan with two phones, choose distinct nicknames/characters, and verify that
   each phone moves its own avatar and the display shows both simultaneously.

## Validation checklist

- Desktop and phone entry, all three characters, blank nickname fallback.
- Drag the bottom-center joystick in any direction; movement speed stays fixed.
  Release, pointer cancellation, loss of capture and loss of focus stop movement.
  The small center dead zone prevents accidental movement. Arrow keys/WASD remain available.
- Prototype joystick tuning: `JOYSTICK_SETTINGS` in `sketch.js`;
  `--joystick-size` and `--joystick-bottom` in `style.css`.
- Camera follows local world coordinates and stops at map edges.
- Display fits the entire original map without stretching it.
- Two real phones plus a separate display: positions, independent control, refresh,
  duplicate nicknames, disconnect/reconnect and removal after connection loss.
- QR targets the deployed HTTPS join URL and preserves the room.
- Unauthorized writes to another user's records and malformed values are rejected.

Firebase integration and database rules require validation against your configured
project before multiplayer can be declared ready. Browser-only local checks do not
prove real-device synchronization or deployed security rules.

## Prototype limitations

Movement is client-authoritative; rules bound positions but do not prevent teleporting.
Writes are limited to roughly 12.5 per second per moving phone, with remote visual
interpolation. Each connection gets a distinct record; disconnect cleanup is eventual,
so a brief stale avatar can remain while Firebase detects a network loss. Refresh
starts at spawn. No permanent account, chat, pairing or cooperative game is implemented.
Monitor Firebase usage and close the demo when it is not in use.

## Room chat

The phone's bottom-right speech icon opens room chat with an 80-character input
and four quick emoji reactions. The public display shows speech bubbles only;
there are no chat controls on the display. Bubbles expire after five seconds.
The phone retains up to 30 messages in memory for its current page session.
Firebase stores only the latest speech per player connection, not a room archive.

Publish the complete updated `database.rules.json` using Firebase Console >
Realtime Database > Rules > Publish before testing chat. Previous movement-only
rules intentionally reject the new `speech` field. Existing movement rules are
preserved. Message fields are validated, and successive speech timestamps for a
connection must be at least 1.5 seconds apart. These prototype limits are per
connection and are not a full moderation or abuse-prevention system.

Validate with two phones and a separate display: send text and reactions in both
directions, confirm the correct avatar has the bubble, wait for bubble expiry,
and confirm joystick/keyboard control still works. Message input must not trigger
movement or streetlight shortcuts. Check Chinese IME input on a real iPhone and
Android phone. User text is displayed as text, never HTML.

## Versioned releases and connection recovery

`npm run build` prepares `generated/site` with a content-based release directory.
All application scripts and styles in one HTML page come from the same release.
QR links include a fresh scan token to avoid reusing cached HTML. Deploy with
`python3 scripts/deploy-pages.py` after checking the build. The deployment keeps
older release directories so already-open clients can still load their files.

The client retries transient authentication failures, falls back to in-memory
identity when session storage is unavailable, and supports phone browsers without
`crypto.randomUUID`. Join attempts are fenced by connection generation so an old
pending join cannot mark a new connection online. Permission errors remain visible
and are not retried in an endless loop. Offline movement behavior is unchanged.
These measures reduce known failure modes; real-device verification is still needed.

## Core acceptance checks

Keep this scope fixed until real-device acceptance passes:
1. Scan the public display QR on two phones, join the same room, and verify both
   phones and the public display receive the two distinct player records.
2. Send text and emoji in both directions. Confirm the other phone receives the
   message and the correct avatar has the speech bubble.
3. Speech bubbles remain visible before 5 seconds and disappear at 5 seconds.
4. Leave/rejoin and repeat, confirming only the departed connection is removed.

`npm test` runs the real synchronization module with a deterministic transport
fixture: two-client movement/messages, repeated reconnects, storage fallback,
transient login failure, and restoration of a missing player record. This does
not test deployed Firebase rules or replace the real-phone checks above.
