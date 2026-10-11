# Claude handoff: make the game easier to evolve, then merge PR 18

Paste everything below the divider into Claude with access to the repository and PR 18. This is an implementation prompt, not a claim that the refactor or PR checks have already been completed.

---

Refactor my existing game so that future changes are easier, safer and more localised. Then, once the implementation and verification gates below are satisfied, merge **PR 18**.

Repository: `C:\Users\venug\Documents\Game\loot-chase-project`

PR: `https://github.com/venugopal-jaquen/Tantra/pull/18`

I am close to launch. I want useful modularity, not a new engine, development stack or months-long rewrite. Another assistant is creating the art and doing secondary checks; you own the main game implementation. Preserve the approved Well Delver visuals and material language, including work already integrated or in progress.

## 1. What success means

Make the common edits straightforward:

- Change a balance value without searching through menus, drawing code and the update loop.
- Add an item, boon, perk or asset mapping in a well-defined place, with validation for missing definitions.
- Adjust a screen or material style without affecting combat or having to copy the change into a second game page.
- Fix a save/settings issue without depending on Phaser or accidentally resetting a player's progress.
- Understand who owns state, when it changes and which code consumes it.
- Run targeted tests and package exactly the scripts/assets the game requires.

This is a **behaviour-preserving refactor**. Existing gameplay, balance, animation, art, UI appearance, controls, timings, save compatibility, URLs and deployment behaviour are the baseline. Do not quietly combine it with design changes, performance experiments or bug fixes. Record unrelated bugs separately; fix only regressions introduced by the refactor. Ask before implementing an unrelated behaviour change.

Start with an audit and a short proposed extraction order, then implement. Do not stop at the plan or produce only architectural advice. Complete each safe extraction and verify it before moving to the next.

## 2. Establish the actual baseline and PR identity

Read applicable repository instructions and these documents:

```text
README.md
docs/requirements.md
docs/design-document.md
docs/launch-roadmap.md
docs/pre-launch-security-checklist.md
docs/well-delver-visual-integration-prompt.md
docs/well-delver-visual-contract.md
docs/well-delver-integration-handoff.md
docs/other-llm-maintenance-brief.md
```

Inspect the current code, tests and packaging. Older notes may describe features that have since changed. Preserve dated founder decisions and use the current functional requirements; do not reverse recent gameplay or approved visuals because an old README is stale.

The inspected checkout has a roughly 397 KB, 6,600-line `game/loot-chase-v0.1.html`, one large `LootScene`, and an almost complete duplicate in `game/well-delver-playtest.html`. These are observations, not assumptions about your current branch. Re-audit if visual integration has already changed the layout.

Before edits:

1. Inspect the working tree and identify unrelated tracked/untracked work. Never stage everything blindly. Do not reset, clean, force checkout, discard changes or replace generated art with older assets.
2. Read live PR 18 metadata: repository, state, actual head branch/SHA, base branch, diff, review discussions and checks. Do not assume the local branch is its head. At prompt creation the local branch was `title-art`, and GitHub CLI was not authenticated, so PR readiness was **not verified**.
3. Work on the actual PR head in a suitable checkout. Do not switch a dirty, shared checkout or copy all of its changes onto the PR. If isolating the work is necessary, preserve the original checkout and follow the project's worktree workflow.
4. If visual integration is actively editing the same files, establish a stable checkpoint/sequence first. Do not refactor an in-flight file concurrently or mix a visual change into the refactor baseline.
5. Run `node tools/smoke-test.mjs`; record the actual result. Run the current packaging workflow and test the staged build. Capture representative screenshots and save/settings fixtures in an isolated test profile.
6. Create a small dependency map: early loader/bootstrap, definitions, persisted state, run state, scene/UI methods, rendering, audio, tooling and deployment. Identify which tables contain functions, which refer to `N` or current state, and what the existing tests access directly.

A failing baseline must be investigated and reported. Do not call a newly observed failure “pre-existing” without baseline evidence, and do not use the refactor to hide it.

## 3. Use a small architecture that fits this game

Keep Phaser, plain browser JavaScript, the vendored engine/fonts and the existing no-install browser workflow. No React, ECS, TypeScript conversion, bundler, package-manager migration, generic plugin framework or new runtime dependency in this pass.

The playable page must still open directly from disk as well as over HTTP. Avoid an ES-module-only browser migration or `fetch()`-loaded configuration that breaks `file://`. Ordered local **classic scripts**, scoped with IIFEs and a small explicit namespace such as `GameApp`, are a suitable option. Keep dependency order explicit; do not create an uncontrolled collection of globals, dynamic script loading or circular imports. ES modules in Node-only tooling are not the problem.

Use a modest number of cohesive files. An illustrative target, to adapt after inspecting dependencies:

```text
game/
  loot-chase-v0.1.html       existing production entry; DOM shell and ordered boot wiring
  well-delver-playtest.html existing candidate entry; shared runtime plus explicit art override
  styles/
    game.css               common DOM/loading/forms presentation
  src/
    config.js              title/build, dimensions, runtime/query configuration
    names.js               name packs and pack selection
    rules.js               balance/content definitions and definition factories
    persistence.js         session/settings defaults, loading, migration and saving
    assets.js              texture keys, production asset manifest and pack overrides
    audio.js               existing audio services and lifecycle
    calculations.js        testable stats/progression/eligibility calculations
    ui.js                  shared material tokens and reusable UI primitives
    screens.js             a cohesive screen family, split further only when useful
    renderers.js           cohesive floor/character presentation helpers if safely separable
    loot-scene.js          Phaser lifecycle and gameplay orchestration
    boot.js                ordered assembly and single game startup
```

This is not a quota or a demand to create empty files. Combine small closely related modules and split only where ownership becomes clearer. Moving thousands of lines into `helpers.js`, `utils.js` or many prototype mixins is not success.

Allow the scene to remain the orchestrator. Extract low-risk data, services, pure calculations and presentation first. Do not tear apart every combat method or replace the state machine immediately before launch. Keep high-risk boss/collision/update-loop internals together unless a narrow extraction is genuinely justified and tested. Document remaining seams rather than falsely claiming the entire engine is decoupled.

Each module should have a short description of its responsibility, exports, dependencies and state ownership. Prefer explicit parameters or a small renderer/service interface. Do not hand every helper a giant mutable application object just to disguise coupling, or introduce an event bus for ordinary function calls.

## 4. Extraction order and safeguards

### Stage A — configuration, content and asset definitions

Move naming packs, runtime options, dimensions, balance tables and content definitions to clear homes. Keep identifiers and object-key order stable where they influence content selection. Put units next to values: milliseconds, seconds, logical pixels, fractions and percentages must not become interchangeable.

Definitions currently include name-dependent strings/functions, including `N.*` references. Use explicit initialisation/factories where necessary; do not turn those into prematurely evaluated constants with the wrong name pack. Do not JSON-serialise tables containing functions or Phaser-dependent drawing callbacks.

Separate static definitions from mutable entity/run state. Do not freeze everything indiscriminately, clone mutable objects on every frame or introduce stale cached values for calculations depending on depth, equipment, movement, health or phase.

Centralise semantic texture keys and production asset paths. Keep approved source versions, rarity masks/variants and icon meanings from the visual integration prompt. Make candidate art selection an explicit entry/boot option rather than a forked copy of the entire game.

### Stage B — persistence and settings

Extract session defaults, loading/migration, saving and reset; expose a narrow storage dependency that can be replaced in tests. Keep one authoritative session object and one settings object, with their existing reference semantics. Do not create separate copies for the loader, scene and UI.

Preserve exactly:

- `SAVE_KEY = 'loot-chase-session-v1'` and `SETTINGS_KEY = 'loot-chase-settings-v1'`, unless current code has an explicitly approved successor.
- All saved fields, records, nickname, depth progress, earned/worn perks, tutorial flags and well progress.
- Existing older-save migration, including saves before depths and before records.
- In-memory fallback when storage is unavailable or throws.
- The current reset behaviour: game progress resets; user settings survive.
- Existing loading-screen reads and write timing. Merely opening the game must not unexpectedly replace an old save.

Do not improve validation, strip unknown fields, change migration semantics or bump the schema as an incidental cleanup. Separate pure migration/calculation from the storage boundary where safe, and prove parity with fixtures.

### Stage C — reusable presentation and screens

Separate material/style tokens and UI primitives from gameplay calculations. Preserve the approved sandstone/bronze/leather/cloth direction and current rendered appearance. This stage is organisation, **not another redesign**.

Start with the existing `glass()`, button/panel helpers, typography and one cohesive screen family such as profile/satchel or settings. Screens should consume a view of current state and invoke explicit existing actions; they should not silently change combat values while rendering. Avoid precomputing a view model that becomes stale when equipment, perk selection or health changes.

Keep overlay ownership, object destruction, pointer interception, HUD fixing, text metrics, frost caching and return-to-previous-screen behaviour unchanged. Preserve DOM forms, keyboard focus, loading progress and error states. Do not use one shared collection to dispose both persistent HUD objects and transient overlays.

### Stage D — pure gameplay calculations and orchestration seams

Extract calculations that can be tested without a browser or Phaser renderer: eligibility, derived stats, upgrade costs, banking/progression and similar cohesive rules. Read current inputs explicitly rather than reaching into unrelated globals.

Preserve formulas, addition/multiplication order, rounding and exact threshold comparisons. Examples worth testing include additive boon bonuses, movement-intent bonuses, equipment-dependent sleeping boons, `Last Stand`, Blood Shield overflow, and death/extract banking. Do not “simplify” formulas because they look equivalent at ordinary values.

Retain `damageEnemy()` as the single player-damage authority, whether implemented in the scene or delegated internally. Preserve shields, vulnerability, kill side effects and Vritra's transition clamp. Do not create a second damage path when separating weapon/status effects.

If introducing named update helpers, preserve the original execution order and time units. The update loop, Phaser timers, tweens and headless stepping do not all advance in the same way. Do not consolidate timers, alter random-number consumption or change entity iteration/removal order as a cleanup. An apparently equivalent loop can change collisions, split spawns, loot or who dies first.

### Stage E — boot, shared entry points and package support

Make production and the candidate playtest load the same runtime. Preserve any intentional differences currently present in the modified playtest; replace duplication with explicit configuration, not by overwriting that page wholesale. Keep its URL and the production entry/root redirect intact.

Preserve startup sequencing: naming/configuration and loading UI, engine readiness, fonts with timeout, asset loading, then **one** Phaser game instance. Respect the existing engine-load error path. Extracted scripts must not reference a namespace, session or Phaser class before it exists. Do not add race conditions by casually applying `async`/`defer` to all scripts.

Remember browser URL bases: JavaScript asset paths, stylesheet font/image URLs and staged-page locations can resolve differently after extraction. Test from the real entry pages rather than an artificial harness that sets a convenient base URL.

Audit tools that expect current globals: `tools/smoke-test.mjs`, `tools/playtest-bot.js`, `tools/store-shots.mjs`, `tools/lazy-players.mjs`, and any other current capture/test scripts. The smoke suite directly reads names such as `Loader`, `session`, `settings` and `N`, and tools use `window.game`/`game.scene.keys.LootScene`.

Keep those interfaces temporarily or introduce one documented narrow test/debug adapter and update **all** maintained consumers deliberately. It must refer to real state, not duplicated fake state. Avoid keeping permanent global aliases for every extracted symbol solely to appear modular. Preserve the supported `window.game` inspection path and scene identity unless a documented compatible adapter is necessary. Do not ship the playtest bot or test fixtures as new runtime dependencies.

`tools/build-itch.py` currently assumes one HTML file, shallow asset folders and inline `GAME_TITLE`/`BUILD` constants. Update it for the chosen structure: explicit production scripts/styles/asset manifests, correct staged relative paths and a reliable source for title/build metadata. Do not leave duplicate manually maintained version strings or evaluate arbitrary application JavaScript from Python to retrieve them.

Validate all local runtime resources, including dynamic asset definitions, not just literal HTML paths. Preserve the current external-request policy, licences and credits. Do not recursively ship `incoming/`, tools, source backups, candidate-only assets or unneeded raw artwork. Keep running the game browser-direct without a mandatory compilation step.

## 5. Non-negotiable behaviour contracts

Characterise and preserve the following, adapting to explicitly approved current code if it differs:

- Query strings/defaults: `?names=...`, `?arena=fixed`, `?arena=wide`, floor selection and other supported development switches.
- The 400 × 700 logical coordinate system, high-DPI scale, 76-pixel HUD, default wide arena, camera clamp/follow and fixed-screen UI.
- Tap-to-walk, held drag steering, keyboard takeover and equal movement rules. Physics position remains separate from animation offsets.
- One damage pipeline; boss focus/vulnerability, shields/anchors, Vritra transition, slams and contact damage.
- Phase/convergence timing and exact resumption of the interrupted phase.
- Tejas charge/activation/form/duration and the current five weapon effects.
- Loot rarity/identity/reveal rules, satchel capacity/oldest-item behaviour, swaps and boon compatibility/ranks/queue/rerolls.
- Tutorial pauses, skipping/replaying, pause/resume, boon screens, satchel and background-tab behaviour; no timers or attacks advancing unexpectedly under a modal.
- Depths/perks/well/records progression, tribute escalation, anti-runner logic, extraction, death and abandonment banking.
- Audio unlock/visibility behaviour, music remaining off if currently off, settings and reduced-flash/shake preferences.
- Approved sprites, icon colouring, animation state, floor geometry, layer order and readable telegraphs.

Do not retune first-run pacing or fix perceived exploits in this refactor. Those are gameplay tasks, not modularity.

Explicitly distinguish persistent session state, settings, one-run state, enemy/entity state and transient UI/animation state. Write down reset and disposal ownership. Avoid expanding global mutable state while moving files.

Track listeners, timers, tweens and display objects created by extracted components. Preserve current lifetimes and make shutdown/disposal explicit for newly introduced owners. Do not invent separate copies of clocks or phase state. Reopening menus or restarting a run must not register duplicate input/visibility handlers or leak stale callbacks.

## 6. Verification: prove parity, not just file movement

Use a private throwaway browser profile and fixture saves. Never run a bot that overwrites my real progress. Mute automated sound; do not send real feedback submissions.

After each meaningful stage, run the smoke suite and targeted tests, and inspect the diff for accidental functional edits. Add lightweight tests using the existing Node runtime/built-in facilities rather than introducing a test framework as a prerequisite. Pure modules should be testable without booting Phaser; a classic-script module can be exercised in a controlled VM context where appropriate.

Test at least:

1. Fresh, legacy and current saves; older records; reset with settings preserved; malformed/unavailable storage using existing fallback semantics.
2. Representative derived stats, sleeping/waking boons, exact health thresholds, overflow shields, upgrade costs and death/extract rounding.
3. Content/asset referential integrity: every referenced key exists, all current name packs cover their required labels, and runtime paths/atlas frames are present in the package.
4. Loader/boot success and failure, fonts timeout, one game instance, production/candidate entry differences and shared runtime usage.
5. Pause, tutorial, boons, satchel, resume, descend, death, victory and repeated menu/run transitions without new listeners, timers or display-list leaks.
6. Existing automated combat checks, with damage/phase/boss behaviours preserved.

For comparisons affected by randomness, use controlled fixtures or test-only injected/replayed RNG at a narrow boundary, preserving production call order. Do not add a new gameplay RNG or claim exact parity from noisy unseeded runs. Keep a fresh browser between baseline and candidate to avoid leftover globals concealing missing dependencies.

Run the established source and shipping checks:

```text
node tools/smoke-test.mjs
python tools/build-itch.py
node tools/smoke-test.mjs "" dist/itch/index.html
```

Document the exact new targeted-test command, and keep it reproducible. Preserve all existing assertions of real behaviour. Updating test access paths after extraction is allowed; weakening expectations, increasing timeouts to hide a startup regression or skipping failures is not.

Verify both `file://` and local HTTP, root redirect and packaged entry, with no missing scripts/styles/assets or unexpected network dependencies. Do not rely only on the headless runner's `--allow-file-access-from-files` flag to prove ordinary browser-direct compatibility. Test the normal supported browser path; report any pre-existing platform restriction accurately.

Compare baseline/after screenshots of loader, title, combat, profile, perks/boons, satchel, settings/tutorial and end states. Confirm mobile layout at 420 × 740 and a smaller portrait viewport, high DPI, plus fixed/wide arena camera edges. The appearance should not drift during a structural refactor.

Record load/texture counts and practical dense-combat/UI-loop observations. Refactoring should not add per-frame allocations, repeated definition construction, duplicated textures or a noticeable runtime regression. Report measurements honestly; do not invent performance gains because there are now more files.

## 7. Documentation that makes future editing easy

Add a concise architecture/editing guide, for example `docs/code-architecture.md`, containing:

- Module responsibilities and dependency/boot order.
- State owners, reset/disposal rules and the test/debug adapter.
- “To change X, edit Y” guidance for names, balance, loot/boons/perks, art manifests, UI material tokens, save migration, screens and packaging.
- Two short concrete worked examples: adding an icon-backed content definition and adjusting a panel style, including the tests to run. Choose examples the current architecture genuinely supports; do not invent a generic content/plugin engine.
- The source/candidate entry relationship, asset preparation and deployment workflow.
- Exact test commands, known residual coupling and narrowly scoped post-launch extraction opportunities.

Update the README's current-state/run/test/package instructions and obsolete structural claims. Preserve historical decisions and requirement IDs in detailed docs; do not rewrite the roadmap or claim pinned features are built. Avoid duplicating long content lists across documents.

Use short JSDoc/type descriptions where shapes are otherwise ambiguous—saved session, runtime item, boon definition, asset definition and relevant renderer input. Preserve comments explaining why a mechanic is unusual. Comments should describe responsibility/contracts, not narrate every statement.

Success is demonstrated by localised edits and tests, not by the number of files. At minimum, configuration/content, persistence, asset selection and a useful UI/pure-calculation seam must have clear ownership; production and playtest must no longer maintain separate copies of the gameplay runtime. If a high-risk extraction is deferred, explain the remaining dependency and why it is outside this pre-launch pass.

## 8. PR 18 review and merge gates

The founder has authorised merging **PR 18 after this work is completed and verified**. Do not merge first and promise to refactor later. Do not create or merge a different PR as a substitute, and do not assume this prompt itself proves readiness.

For this task, the scoped PR update/merge authorisation here supersedes the earlier visual handoff's instruction not to commit, push or merge automatically. It does not authorise unrelated commits, another PR or deployment.

If live PR 18 is unrelated, already closed/merged or has a materially different target, stop the merge step and report the actual situation. Do not repurpose an unrelated PR without direction.

If updating PR 18 is appropriate, commit/push only changes belonging to this authorised scope to its actual head branch, respecting the repository workflow. Do not scoop up unrelated dirty files, force-push another contributor's work or change the PR's base casually. Keep extraction changes reviewable; avoid blanket formatting that obscures the moved code. Any approved visual work already in that PR must be preserved and included in final validation, not silently removed as “unrelated”.

Before merging, require:

1. The intended refactor and prior approved PR scope are complete; no half-migrated paths, runtime duplication or missing shipped assets.
2. Source, targeted and packaged tests pass on the final committed PR head, with required reviews/checks satisfied. A lack of configured CI is not evidence of testing; include local results.
3. The full PR diff—including changes that predate your refactor—is reviewed for regressions. No unresolved blocking review findings, conflict, security issue or broken release path.
4. The head remains compatible with the latest base. Resolve conflicts without losing either side's approved work; rerun relevant tests if base integration changes the tested tree.
5. The architecture/edit map, credits/packaging and visual parity evidence are accurate. No test result applies only to uncommitted local files absent from the PR.
6. Re-fetch/check the PR head SHA and live check status immediately before merge. Merge the **tested head**, using a head-SHA guard where the client supports it. If another push changes the head, revalidate rather than racing it.

Use the repository's allowed merge strategy and normal authenticated client. Do not bypass branch protection, dismiss required reviews, use an administrator override or disable checks. Do not delete a shared head branch automatically; preserve other ongoing work.

If credentials, checks, required reviews or permissions prevent a safe merge, finish all safe local work and report the precise remaining requirement. Do not ask for tokens in chat, fabricate a merged status or treat a blocked merge as permission to push directly to the base branch.

After a successful merge, verify PR state/merge SHA and the resulting base-branch tree; run the relevant source/package checks on that tree in a suitable checkout. Merge does not authorise a separate store upload or deployment action. If a post-merge regression is discovered, report it immediately and propose the smallest corrective change; do not hide it or automatically perform a destructive revert.

## 9. Final report

Give me a compact, evidence-backed handoff:

- What became easier to edit, with links to the editing guide and examples.
- Files/modules created and their ownership; what intentionally remains in the scene.
- Baseline and final test results, source/staged-build checks and visual/performance observations.
- Confirmation that saves, controls, mechanics and approved visuals were preserved.
- Any deferred coupling, real blocker or remaining launch validation.
- PR 18 URL, tested head SHA and actual merge status. If merged, include merge SHA/base and post-merge verification; if not, state why.

Do not call this a successful refactor merely because the HTML got shorter. I should be able to give the next LLM a focused change, point it to the right module, and verify the result without touching unrelated systems.
