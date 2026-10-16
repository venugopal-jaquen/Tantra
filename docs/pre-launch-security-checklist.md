# Security checklist: run just before the itch.io push

Given by the founder on 2026-10-06: "Once we are ready to launch, just before that these
things need to be executed so I want you to save it and execute at the right time."

**When:** after the build for itch.io is final and before it is uploaded (launch track L9,
`design-document.md` §1.2). Go through every line, do what applies, and write the result
beside it in a dated copy of the table below. **Run on 2026-10-14 against build 0.22 (Version Beta): see the last section.** One thing is left: a look inside itch.io's frame (line 18). The FormSubmit alias went in with build 0.24. Line 2's decision was made on 2026-10-14: the history stays as it is.

## The list, as given

1. Hide API keys
2. Purge secrets from Git
3. Expose only the public DB key
4. Enable row-level security
5. Encrypt sensitive data
6. Enforce server-side auth
7. Lock record access
8. Block field tampering
9. Secure session cookies
10. Hash passwords
11. Rate limit login
12. Add bot protection
13. Parameterize queries
14. Validate all input
15. Escape user content
16. Restrict file uploads
17. Trim API responses
18. Add security headers
19. Force HTTPS
20. Scan dependencies

## What each means for this game, as it stood on 2026-10-06

The game on that day is one HTML page and its image and sound files. It has no server of
its own, no database, no accounts and no uploads; progress is kept in the browser; the
only thing it sends anywhere is a feedback message, through FormSubmit. Half the list is
about things the game does not have. **That must be checked again at launch, not assumed:**
a leaderboard for the daily descent (P9), or anything else with a server, brings those
lines to life.

| # | Item | Applies today? | What to do at launch |
|---|---|---|---|
| 1 | Hide API keys | Partly | There are no keys. The feedback form carries the founder's email address in the page: swap it for the private alias FormSubmit issued. Search the build for anything that looks like a key or token |
| 2 | Purge secrets from Git | Check | Run a secret scanner over the whole history of the repository, not only the latest files. The email address is in the history and stays there unless history is rewritten: decide then whether that matters |
| 3 | Expose only the public DB key | No database | Applies the day one is added |
| 4 | Enable row-level security | No database | Same |
| 5 | Encrypt sensitive data | Nothing sensitive is stored | The save holds progress and a nickname, in the player's own browser. Re-check what the save holds |
| 6 | Enforce server-side auth | No server | Applies the day one is added |
| 7 | Lock record access | No records | Same |
| 8 | Block field tampering | Not while offline | A player can edit their own save; it harms no one while nothing is shared. If scores or names are ever shown to other players, they must be checked on a server |
| 9 | Secure session cookies | No cookies | Confirm none are set |
| 10 | Hash passwords | No accounts | Applies the day accounts exist |
| 11 | Rate limit login | No login | The feedback form is the nearest thing: limit how often one browser can send |
| 12 | Add bot protection | Yes, for feedback | The form's captcha is switched off because it posts in the background. Add a hidden honeypot field, and consider the alias plus a send limit |
| 13 | Parameterize queries | No queries | Applies with a database |
| 14 | Validate all input | Yes | Nickname (cleaned, 14 characters), feedback text (2,000), and the address options (`?names=`, `?floors=`), which must only ever pick from fixed lists |
| 15 | Escape user content | Yes | The nickname and any typed text must reach the page as text, never as markup. Search for every place player text is shown |
| 16 | Restrict file uploads | No uploads | Confirm |
| 17 | Trim API responses | No API | Applies with a server |
| 18 | Add security headers | Yes | A content security policy in the page that allows only the game's own files and the few outside hosts it needs. itch.io serves the game in a frame with its own headers: test inside it |
| 19 | Force HTTPS | Yes | Every outside address in the page is https; confirm, and confirm the GitHub Pages site enforces it |
| 20 | Scan dependencies | Yes | One dependency, the Phaser engine, plus two typefaces, loaded from other hosts. The itch.io build is to carry its own copies (L9); check the engine version for known flaws, and if anything is still fetched from another host, pin it with an integrity hash |

## What has changed since (not a run of the list)

- **2026-10-10.** The engine and the two typefaces now sit beside the game
  (`requirements.md` §2.34), so nothing is loaded from another host. For line 20 that
  leaves one dependency to check for known flaws, Phaser 3.70.0, already pinned by being
  a file whose checksum was verified. For line 18 it means the content security policy
  can allow the game's own files and one outside host, the feedback relay, and nothing
  else. The smoke test now fails if the page fetches anything from the internet.

## Run of 2026-10-14: build 0.22, Version Beta

Run by Claude in the Beta worktree (`release-prep`), at the founder's word ("yes" to starting the security pass, 2026-10-14). Checks named here were run that day; nothing is marked done that was not.

| # | Item | Result | What was done, and what is left |
|---|---|---|---|
| 1 | Hide API keys | ✅ Done (build 0.24) | No keys or tokens anywhere in the game. Since build 0.24 feedback goes to the private alias FormSubmit issued (the founder sent it on 2026-10-14), and no address of the founder's is in the game. One labelled test message sent from the live game through the alias on 2026-10-14 reached the founder ("Test Message received correctly", 2026-10-15). A failed send no longer offers an "Email it instead" link, which needed the address; the message stays in the box to try again. `check-game` now fails if an email address appears in the game's files |
| 2 | Purge secrets from Git | ✅ No secrets; one decision left | All 130 commits on every branch were searched for the shapes of cloud keys, API tokens, GitHub tokens, Slack tokens and private keys: none. The feedback address is in the history (23 times written whole, more often split). It stays there unless the history is rewritten, which would break every copy of the repository, ChatGPT's Gamma clone included. **Decided by the founder on 2026-10-14: left as it is** ("Handle the email the way you recommend"): the history is not rewritten, and the alias (line 1) keeps the address out of the game from now on. Commits carry the founder's Apple relay address as author, which is what a relay is for |
| 3 | Expose only the public DB key | — No database | |
| 4 | Enable row-level security | — No database | |
| 5 | Encrypt sensitive data | ✅ Nothing sensitive | The save, in the player's own browser, holds progress, a nickname, settings, records and the times of recent feedback. A feedback message carries the build, the deepest level, the screen's size, the browser's description and a reply address only if one is typed; the form says so |
| 6 | Enforce server-side auth | — No server | |
| 7 | Lock record access | — No records | |
| 8 | Block field tampering | ✅ Harms no one | A player can edit their own save; nothing is shared. To revisit with any leaderboard (P9) |
| 9 | Secure session cookies | ✅ None | The game sets no cookies (no `document.cookie` anywhere). itch.io's own page has its own, outside the game |
| 10 | Hash passwords | — No accounts | |
| 11 | Rate limit login | ✅ Done for feedback | One browser can send at most three messages in ten minutes; a fourth is held back with a line saying so. Checked by the smoke test. Clearing the browser's storage resets it; FormSubmit has limits of its own |
| 12 | Add bot protection | ✅ Done | A field no person sees (`_honey`), which form-filling robots fill; FormSubmit drops any message that arrives with it filled. It is off the screen, out of the Tab order and hidden from screen readers. Checked by the smoke test |
| 13 | Parameterize queries | — No queries | |
| 14 | Validate all input | ✅ Done | Nickname: cleaned, 14 characters (as before). Feedback: 2,000 characters in the page. The address switches (`?names=`, `?floors=`, `?arena=`, `?wear=`) now take only a name from their own lists: before, a word every object answers to, such as `constructor`, was taken as a choice and stopped the page. Tried with four such words at once: the game reached the title screen as normal |
| 15 | Escape user content | ✅ Nothing to escape | The nickname is drawn on the canvas or set as plain text, never as markup. The one place markup is written (the side panels on a wide screen) holds the game's own words and no player's. A feedback message is sent, never shown |
| 16 | Restrict file uploads | — No uploads | |
| 17 | Trim API responses | — No API | |
| 18 | Add security headers | ✅ Done; one look left | A content security policy in the page: it loads only its own files and sends only to the feedback relay. Tried: an outside picture and an outside request were both refused, and a whole smoke run (127 checks) met no refusal. The engine's failure handler moved out of its tag, so nothing inline runs. Headers the page cannot set itself (framing, HSTS) are the host's: GitHub Pages and itch.io. **Left:** on the itch.io draft page, check the game loads and a feedback message sends inside itch.io's frame (`itch-page.md` §5) |
| 19 | Force HTTPS | ✅ Done | The only outside address is `https`. GitHub Pages enforces HTTPS, and `http://` answers with a permanent redirect to `https://` (both checked 2026-10-14) |
| 20 | Scan dependencies | ✅ Clean | Phaser 3.70.0, a file kept in the repository; GitHub's advisory database lists no advisories for Phaser (asked 2026-10-14). The two typefaces are OFL files. Nothing is fetched from another host (smoke test) |

## Run of 2026-10-16: the "vibe-coded app" checklist

The founder passed on a long list of what vibe-coded apps lack (a post on X) and asked what applies here, to run what can be run, and to say what was found. Most of the list is for an app with a server, accounts, payments or a model at run time; Sevenwell has none of them. What applies, and what was done, on build 0.27 and 0.28:

| Area | Checked | Found | Done |
|---|---|---|---|
| Secrets in the code, the repository and its history | All 146 commits of every branch and tag, for the shapes of keys and tokens; the tracked files, for anything like a key, a `.env` or local settings | Nothing | — |
| "Every package the AI installed is the one you meant" | The engine file against the one published on npm | `vendor/phaser-3.70.0.min.js` is byte for byte the published Phaser 3.70.0 | — |
| Dependency scanning and upgrades | GitHub's advisories; the newest releases | No advisories for 3.70.0. It is from November 2023; the newest of its line is 3.90.0 (May 2025), and Phaser 4 is out | On 3.70 a lost WebGL context leaves the game black until reloaded (forced and seen). The founder chose "C": build 0.29 restarts the page itself (`requirements.md` §2.55), and 3.90 is pinned for after the launch on its own branch (`design-document.md`, P15). Phaser 4 is a rewrite, not for now |
| Validation of what is stored, and "a save that survives a damaged field" | Ten damaged saves loaded into the game | Two stopped it: a depth written as text broke the title screen, and a name that was not text broke the profile | `mendSession()` (build 0.28): every field back to its own kind or its first value. A smoke check loads damaged saves |
| Emoji, accents and right-to-left text in every field | Thirteen names: apostrophes, accents, Arabic, Hebrew, Devanagari, emoji families, flags, combining marks, a direction override, zero-width characters, the widest letters, markup | A direction override could turn a name backwards; three zero-width characters made a blank name that counted as a name; a long run of flags was cut through a flag | The naming form (build 0.28) drops invisible and direction-changing characters, keeps the joiners Indian scripts and emoji need, and counts and cuts whole characters. A smoke check holds them |
| Deduplication for the user who clicks submit four times | Four presses of Send | One message. Already safe | — |
| Input sanitization and XSS | Every place player text is shown | Canvas or plain text only; the one place markup is written holds the game's own words | — |
| Terms and a privacy policy that match what the code does | What the feedback form sends against what it says | It sent the screen size without saying so | The form says so (build 0.28). A privacy paragraph for the itch.io page (`itch-page.md` §3) and a longer one in `SECURITY.md` |
| A deploy pipeline that runs the tests before anything reaches players | The repository | No automated checks: GitHub Pages publishes `main` as soon as it is merged, and the tests run only on the founder's PC | `.github/workflows/tests.yml`: GitHub runs `check-game` and the smoke test, on the game and on the itch.io folder, on every pull request into `main`. Its machines have no graphics chip (the game ran at 10 frames a second, and 120 of 130 passed: the ten that failed all time movement or animation), so there those ten are set aside (`SMOKE_SLOW_MACHINE`) and count only on the PC |
| Least privilege for the AI agent holding production credentials | `main`'s protection | `main` is not protected: anyone with push rights, Claude through the founder's login included, could push to the live game directly or force-push over its history | `main` protected: pull requests only, merged only once the tests have passed, no direct push, force-push or deletion, for the founder's own login too |
| One-click rollback | Tags | Only build 0.21 is tagged | `beta-build-0.23` to `beta-build-0.28` added on their merges; every build merged from now on gets one |
| Dead code, the 2,000-line file | Every name declared in `game/src` against its uses | No dead code; `loot-scene.js` is 1,999 lines, as `code-architecture.md` §6 already says, left whole on purpose | — |
| A disclosure process | The repository | No way for a stranger to report a weakness | `SECURITY.md`: report through the Feedback button, starting SECURITY; what is covered; what the game keeps and sends |
| Backups, and a bus factor above one | Where everything lives | The game's repository is on GitHub; ChatGPT's support files (`support-artifacts/`) are only on the founder's PC, and never pushed by rule | A copy in the founder's OneDrive, made and checked on 2026-10-16 (every file, the same bytes; the notes and scripts the same by hash), with a refresh file beside it that only adds and updates. Not on GitHub |
| Accessibility | Small phones (also ChatGPT's audit A-002) | Words of 7 and 8 at 0.8 scale; volume cells 10 by 18 CSS pixels; a 136-by-19 skip button; one label at 4.4 to 1 | Build 0.28: nothing under 9, profile headings at 11, the volume row one finger-high target, the skip button 220 by 34, the muted word lighter (5.1 to 1 on the darkest panel sampled), Overdrive's button larger |

The founder chose the CI run, protecting `main`, the tags, `SECURITY.md` and the privacy note on 2026-10-16 ("go with 4 to 8"), and they were done that day with build 0.28. The backup (a OneDrive copy) and the engine ("C": restart now, upgrade after the launch) were chosen the same day.

Not applicable here: accounts, passwords, MFA, SSO, sessions, roles, tenants, a database and its migrations, payments, tax, webhooks, an API, uploads, email sending of our own, a model at run time.

