# Release checklist: before every itch.io upload

The founder's checks and balances of 2026-10-17, proposal 1. Tick each in the pull request
that makes the release. A release that cannot tick one does not go up.

1. **The founder's word** to release, in this chat, quoted in the pull request.
2. **Every check on the PC:** `node tools/check-game.mjs`, the smoke test on the game and on
   the itch.io folder, `node tools/check-floor.mjs`. The timed checks count here.
3. **GitHub's run passed** on the pull request.
4. **The other AI reviewed it** independently, and its findings are answered.
5. **A real phone:**
   - one run on a mid-range Android;
   - one on an iPhone, if one is at hand;
   - on the itch.io draft page, not only GitHub Pages.
6. **The version** on the title screen is the one being released.
7. **The store page matches the build:**
   - the description promises nothing the build does not do;
   - the privacy paragraph matches what Feedback sends (`SECURITY.md`);
   - the AI disclosure matches the credits.
8. **Rollback is ready:**
   - the zip of the build before this one is in `OneDrive\Sevenwell backup` (the Beta zips
     are in `beta-releases`);
   - the new zip goes there too once it is live.
9. **The founder's one-page "what changed"** is in the pull request, and a devlog line on
   the itch.io page says it to players.
