# Stable cooperative drink-shop release — 2026-10-20

User approved the two-device drink-shop experience and its visual corrections, then authorized production promotion and an independent backup.

- Immutable site release: `0375db001d569553`.
- Stable source tag: `stable-drink-shop-2026-10-20`.
- Stable deployed-site tag: `stable-site-drink-shop-2026-10-20`.
- Production room: `campus`; the preview room `drink-test` remains separate.
- Backup branch: `backup-drink-shop-stable-2026-10-20`, containing independent source and runnable website ZIP archives and SHA-256 checksums.

The release includes the existing map, movement, chat, wishing tree and blessings, plus the approved drink-shop artwork and proximity entry, square character matching with nicknames, A/B/A/B synchronized ingredient selection, the Your turn toast, centered unbranded drink, and enlarged final drink with name and return-to-map action. The user confirmed the device test. Controlled tests and limitations are documented in `DRINK_MULTIPLAYER_PREVIEW.md`; no independent cloud verification of Firebase rules or live GitHub Pages is claimed.

The previously deployed map source remains at `6ffeceeaf2a5d8a894efe2cbdafe343818cfee42`, with immutable entry `campus-ab81af9580087887.html`. Existing release entries and previews are retained on gh-pages. The backup archives do not contain Firebase database exports: live wishes/blessings remain in the Firebase project. Website files require HTTP(S), and multiplayer requires the already configured Firebase project and rules.
