# AGENTS.md — Multiplayer Public Map

## Purpose of this file
This file is the durable project brief for Codex and other coding agents working in this repository. Read it before making changes. The existing p5.js project is the starting point and must not be discarded.

## 1. Project vision and assessment context
This is an interactive public-space experience designed for an academic assessment at Curtin University. The core design aim is to help international students from different cultural backgrounds make a natural first connection with someone outside their existing social circle. The experience should be playful, welcoming, low-pressure, intuitive, and suitable for a short encounter. A meaningful initial interaction should be possible in **two minutes or less**.

The concept is a shared, explorable 2D illustrated map presented on a **large public display**. Visitors use their **own phones** to join, choose a nickname and avatar, and explore the same virtual public space. They can encounter others and later opt into simple cooperative mini-games. The public display gives a shared sense of place; phones are personal input devices and show a local view of the map.

Do not reinterpret this project as a conventional single-player game, a text-chat app, or a full social-network platform. Social interaction should emerge from co-presence and very short cooperative tasks, not mandatory messaging.

## 2. Existing project and assets — preserve them
The project began in **p5.js Web Editor** and has existing source and art. The user has exported these files for GitHub. Files observed during upload include:

- `sketch.js` — existing p5.js logic
- `index.html` — web entry point
- `style.css` — existing styles
- `p5.js`, `p5.sound.min.js` — included libraries
- `map draft.png` — user's map artwork
- `男角色.png`, `女角色.png` — avatar art
- `light icon.png`, `购物袋.png` — existing icons/assets

These filenames reflect the upload screenshot, **not a verified inventory or description of code behavior**. Inspect the actual repository before deciding what is implemented. Additional assets may be present. Preserve original artwork, filenames, dimensions, and working interactions unless a change is necessary and explained. In particular, do not replace the illustrated map with a generated generic map or substitute unrelated avatar art.

Do not assume that one file is the whole application. Keep asset paths and p5.js version compatibility working. Avoid modifying vendored/minified `p5.js` libraries unless absolutely required; prefer changes in application code.

## 3. Target experience
### Public display (large landscape screen)
- Show the **entire shared map**, or a clearly understandable overview with all participating avatars.
- Show a scannable **QR code in the top-right corner**. It must point to a publicly accessible mobile join URL, not `localhost` when visitors use separate phones.
- Display newly joined players' avatars and nicknames, using the shared state.
- Update avatar positions in near real time when each player moves on their own phone.
- Support multiple concurrent human players. Do not fake multiplayer by creating computer-controlled stand-ins in the final demonstration.

### Player's phone (portrait screen)
- QR scan opens a mobile join flow.
- Player chooses a **nickname and avatar** before entering. Keep the existing choices where possible; earlier prototypes included three choices, but verify the current project instead of assuming exact options.
- Once in the world, show **only the nearby portion of the larger map**, in portrait orientation. The phone is a camera/viewport onto the shared map, not a miniaturized full-map overview.
- Show large, touch-friendly **direction controls in the lower part of the phone screen** (up/down/left/right, or an accessible D-pad). The user's avatar moves smoothly while the map viewport follows.
- Keep the avatar near the center when possible, clamping the camera at map boundaries. Handle different mobile sizes and touch input reliably, including iPhone and iPad.
- Player movement should change their shared world coordinates, not move a separate copy of the map. Other connected displays must see the same resulting position.

### Multiple users and synchronization
- Support at least two independent phones controlling **different avatars simultaneously**, with the shared public display visible on a separate device.
- Use one authoritative, coherent representation of player identities, positions, and connection/session state. Separate world coordinates from display-specific camera coordinates.
- Do not claim multiplayer works unless tested with separate devices/browsers.
- Handle rapid input, join/leave/reconnect, duplicate nicknames or IDs, stale disconnected players, and mobile page refresh without bringing down the session.
- Choose a practical real-time backend that fits the existing code and deployment needs. **Firebase Realtime Database was discussed as a candidate, but is not mandated**. If using Firebase, ask for or document required project configuration and security rules; never hardcode secrets or loosen security unnecessarily. Consider an alternative only with a brief reason.

## 4. Interaction design constraints
- Overall tone: inviting, playful, low-pressure, campus/public-space appropriate.
- First-time users should be able to understand how to join and move without lengthy instructions.
- Joining and participating should not require creating a permanent personal account.
- The project should create opportunities for interaction between strangers from different cultural backgrounds, rather than requiring them to already be friends.
- Avoid making free-text chat, lengthy dialogue, or complicated onboarding a prerequisite for participation.
- Aim for a meaningful shared activity lasting **no more than approximately two minutes**.
- The user has existing hand-drawn/illustrated assets. Maintain their style rather than imposing a different visual language.

## 5. Later phase: optional cooperative mini-games
**Do not implement these before the core multiplayer map is stable unless explicitly asked.**

### Broken streetlight repair (previously discussed concept)
- A broken streetlight is discoverable from the shared map.
- Two distinct users can opt into a short cooperative repair interaction; players have individual screens and roles.
- A prior concept had **five buttons on each side**, a brief flashing sequence to remember/replicate, and **three successful rounds** lighting up a connecting circuit to repair the streetlight.
- Allow a short waiting state and clear completion feedback, then return both participants to the shared map.
- Keep the complete cooperative encounter short and intuitive, ideally within the two-minute interaction constraint.
- This is a design direction, not permission to override a newer prototype. Confirm details against current code and user instruction before implementation.

Additional game ideas (e.g. shared delivery/maze tasks) have been explored separately; do not silently merge their rules into the streetlight game or the core map.

## 6. Technical and engineering approach
- The original implementation is **p5.js**. Work with the current project first; do not migrate to a heavy framework without user approval.
- Preserve 2D world coordinates and keep rendering/camera transforms conceptually separate. On phones, compute camera position from the local player's world position and viewport size.
- Prefer a clear separation among: shared configuration/map dimensions, asset loading, rendering, input controls, join/authless session flow, and real-time sync. Do this incrementally, not as a destructive full rewrite.
- Support landscape desktop display and portrait phone layouts with responsive CSS/canvas sizing.
- Use standard browser-safe mobile interactions (touch/pointer events, appropriate `touch-action`, prevention of accidental scroll while using controls).
- Document how to run locally, how to deploy a reachable HTTPS site, and how to configure any backend so phones can connect through the QR code. Never assume scanning a QR containing a local file URL or `localhost` works on another device.
- Protect privacy: use temporary player IDs, collect no unnecessary personal data, and avoid exposing administrative credentials.
- Test with more than one device, including a public display plus at least two phones, before declaring real-time sync complete.

## 7. Required working style for Codex
1. **Inspect before editing.** Read all app source and relevant assets. Report the current architecture, what works already, and blockers. Distinguish verified implementation from assumptions.
2. **Do not rewrite the whole project.** Make small, reviewable changes that retain the original user's creative work.
3. **Implement in phases:**
   - Phase A: audit current project and verify it still renders correctly.
   - Phase B: responsive mobile viewport, camera-follow, and touch D-pad, preserving public full-map view.
   - Phase C: QR join, nickname/avatar selection, shared session and real-time multiplayer synchronization.
   - Phase D: multi-device testing, stability, reconnect/leave behavior, accessibility and presentation polish.
   - Phase E: cooperative mini-games only after explicit approval.
4. Before each substantial phase, explain **which files will change**, why, and what manual setup the user must perform.
5. Keep instructions beginner-friendly. The user is familiar with p5.js Web Editor but may not know Git, deployment, backend configuration, or server operations. Provide exact click paths when external setup is necessary.
6. Favor complete, runnable updates over isolated code fragments when the user asks for working code. Do not say a feature is complete without checking for runtime errors.
7. Run available checks/tests; disclose what you could not test. If credentials, URLs, or deployment steps are missing, explicitly ask for them rather than inventing values.
8. Avoid expanding project scope just because extra features are possible. Prioritize a reliable demonstration over excessive features.
9. Retain a clear change history via commits or pull requests. Never delete existing assets or existing implemented behaviors without explicit reason and user consent.
10. Project discussion, explanatory communication, and setup guidance may be in **Chinese**, but preserve technical labels, code identifiers, filenames, and developer-facing documentation in **English**.

## 8. First instruction when this repository is opened
**Start with an audit only. Do not make code edits yet.** Examine `sketch.js`, `index.html`, `style.css`, and the asset paths. Summarize: (a) which existing map/avatar/input features actually work; (b) current map dimensions and camera behavior; (c) any obvious issues or missing dependencies; (d) a practical minimal architecture for one public display and multiple mobile browsers; and (e) the smallest safe first implementation step. Explain the findings in Chinese and ask for confirmation before editing.