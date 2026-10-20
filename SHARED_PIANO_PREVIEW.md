# Shared Piano — isolated preview

## User-approved design

- Approved sign-free wooden piano icon, on the existing east stage (original map x1210/y435), width135/height126 before the existing 1.6 world scale. Original map art is untouched.
- Three rows of seven round diatonic keys: C3–B5, low/middle/high 1–7, no semitones or scoring. Synthesized decaying harmonic tones use Web Audio; no external samples are fetched.
- One performer per room, anyone else can listen. The authenticated owner gets a 12-second lease renewed about every five seconds. Explicit Finish, closing the panel and backgrounding release it; lost presence or expiry permits takeover.
- Joined phone users hear live notes across the map after a user gesture unlocks audio. Distant notes are softer, panel notes full level. A remembered mute toggle remains available in the panel. Public display starts muted.
- Events older than the listener's subscription are skipped. Local note echoes use the same event ID and are not played twice. Short tones cannot stick indefinitely; voice count is capped.
- Background music is not included: the user has not selected a recording. No audio is fabricated as a claimed user-selected soundtrack.

## Architecture and limits

`piano-session.js` contains lease decisions and pitch mapping. `piano-network.js` reuses the existing Firebase app/auth/room, watches the lease and at most 32 recent note events, and sends only key/time/session events. `piano-audio.js` synthesizes tones and handles gesture/mute/distance. `shared-piano.js` owns the responsive modal and 21-key controls. `piano-spot.js` follows the approved proximity glow/breathing pattern. Small modal guards prevent simultaneous map movement or overlapping activity panels.

Each note sounds immediately for the performer and on arrival for remote listeners; this is casual live listening, not sample-accurate ensemble synchronization. Do not replay delayed notes after reconnection. Successful note writes are removed after ten seconds while the page remains alive. A page closed immediately after a note may leave residual database events; the read limit and timestamp gate prevent replay, but archival retention is not a scheduled server cleanup. Mobile browsers may require an additional sound-button tap, and headphone/device output has not been physically tested here.

## One-time Firebase setup

Publish the complete `database.rules.json` in Firebase Console → public-map-project → Realtime Database → Rules → Publish, after saving the current console text. Only `pianoSeat` and `pianoNotes` are added. Every prior room subtree is checked against `stable-fishing-2026-10-20` in a regression test. The seat is owner/presence/time guarded, and notes require an unexpired seat token and keys0–20. No general room read/write permission is added. Refresh the preview after publishing so failed listeners can reconnect.

The deployment helper creates a phone-readable setup page containing a copy button and the full rules. No administrative access or rule publication is performed automatically.

## Verification and release

- `npm test`: map/chat/wish/blessing/drink/fishing regressions; exclusive seat, stale lease recovery, pitch range, additive rules and two independently instantiated controlled piano services (competing claims, live note delivery, echo identity, no late-join replay, seat handover and background release).
- `node scripts/check-piano.cjs`: built p5 stage placement/proximity, all21 keys at320/390px, owner/listener controls, actual Web Audio oscillator creation, mute preventing voices, received note highlights, modal close and silent display default. Transport is stubbed; no claim of live Firebase or real device verification.
- Recheck existing fishing and drink modal entry/exit after adding guards.
- Build with `npm run build`, publish only with `python3 scripts/deploy-piano-preview.py`. It preserves the production homepage and existing immutable entries, writes an immutable preview and ensures its QR points to that same preview. Production remains on the approved fishing release until explicitly approved.

Device review: publish the additive rules, open the preview display in room `piano-test`, scan with two phones, join and approach the east stage. One claims, the other must be unable to claim/play but hears/observes notes. Test all three pitch rows, mute on/off, handover, closing, backgrounding and disconnection expiry, new joins without old-note playback, and map/chat/drink/fishing/wish behavior. Check whether piano position/size and phone layout match the user's preferences before production promotion.
