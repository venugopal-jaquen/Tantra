# Handoff prompt — documentation cleanup and maintainable code

Copy the following into the LLM that owns the primary game build. It is intentionally
conservative: the project is close to a web POC, so clarity and safe iteration matter more
than an ambitious rewrite.

```text
You own the main Loot Chase / Anantarya game build. Work carefully in the existing dirty
repository: preserve unrelated user changes and do not reset, discard, overwrite or reformat
files outside the agreed scope.

Objective: make the documentation trustworthy and the code easier to evolve without changing
player-facing game behavior, balance, save compatibility, assets, URLs, or the live release
path unless a change is explicitly required to preserve behavior.

Phase 0 — establish the baseline
1. Read README.md, docs/requirements.md, docs/design-document.md, docs/launch-roadmap.md,
   docs/pre-launch-security-checklist.md, and tools/smoke-test.mjs.
2. Run `node tools/smoke-test.mjs` before changing anything. Record the pass count and do not
   call a regression pre-existing if the baseline is already failing.
3. Inspect `git status --short` and work around unrelated changes. Never use git reset --hard,
   checkout --, clean, or a destructive bulk operation.

Phase 1 — documentation cleanup
Create one short, current-source-of-truth section near the top of README.md, containing:
- current build/version and the canonical playable file;
- actual default arena and how to request alternatives;
- current title status (working title versus final name);
- current launch status and true blockers;
- exact test command;
- a short list of known pre-launch validation work.

Resolve or explicitly label stale historical claims. In particular, check for contradictions
about canvas scaling, persistence, GitHub Pages/deployment, project-infrastructure status,
the capstone/end condition, title-art state, and the number of smoke tests. Keep valuable
decision history in the detailed documents, but label it as historical and do not let it
contradict the current-state summary.

Do not rewrite the requirements or roadmap into generic prose. Preserve founder decisions,
dates and pinned/post-launch items. Prefer a concise status banner and links to the canonical
detail rather than duplicated lists that will drift again.

Phase 2 — low-risk code organisation
The playable page is a large single-file Phaser build. Do not attempt a framework migration,
TypeScript conversion, bundler introduction, or broad mechanics redesign before launch.
Instead, make small, independently testable extractions in this order only when each one has
clear boundaries:
1. immutable data/configuration: name packs, balance constants, rarity/boon/perk definitions;
2. save/session and settings serialization/migration helpers;
3. visual constants and character/asset manifest;
4. narrowly scoped UI builders or game-system helpers that are already cohesive.

Use plain browser JavaScript compatible with the existing no-build deployment. Keep the
current `game/loot-chase-v0.1.html` playable directly from disk. If extracting modules would
make direct file opening unreliable, keep the code in the one file and improve structure with
clear region boundaries and pure helper functions instead.

Hard rules:
- Preserve `SAVE_KEY`, existing localStorage fields and old-save migration behavior.
- Preserve query-string behavior such as `?arena=fixed`, `?arena=wide`, `?names=...`, and
  `?floors=...`.
- Preserve the 400×700 logical world, Phaser scaling, touch target mapping, and asset paths.
- Do not alter difficulty constants, the tutorial cadence, anti-runner logic, or boss behavior
  in a refactor-only pass.
- Do not rename shipped assets or externalize them to a CDN.
- Keep comments that explain non-obvious game decisions; remove only duplicate or stale ones.
- Make every change small enough to review and explain.

Phase 3 — verification and handoff
1. Run `node tools/smoke-test.mjs` after every meaningful refactor boundary.
2. Run `git diff --check` before completion.
3. Report: files changed, document contradictions resolved, code seams introduced, baseline and
   final test counts, and any deliberately deferred issue.
4. If a refactor changes any test result, stop and diagnose it; do not mask failures by changing
   test expectations unless the user has approved a real behavior change.

Deliverable: a short current-state README, reconciled documentation, and modest maintainability
improvements with unchanged gameplay and a passing smoke suite.
```
