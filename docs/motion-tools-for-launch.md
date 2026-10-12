# Motion tools for the launch: what to reach for, and when

Saved 2026-10-12 at the founder's request: "Leverage wherever and whenever needed during our game
development and launch tasks." It sits beside `animation-prompting-best-practices.md`. That doc
says how to prompt and check motion; this one says which ready-made kits to start from.

**Source.** Mnimiy (@Mnilax) on X, <https://x.com/mnilax/status/2109314840057565345>: a list of
15 GitHub repos "that turn Opus 5.5 into a full motion design studio". The post credits the list
to an unnamed ex-Figma design lead. Its video, a decision map, could not be played here
(`video.twimg.com` is not in the environment's allowed domains). The map below is read from the
video's still, which shows the whole map.

**None of these has been vetted yet.** The descriptions are the post's, not checked. Before any
is installed, apply *vet-assets-before-shortlisting* (`claude-working-notes.md`). Check its
licence, when it last changed, and what it runs. A skill is instructions and scripts an agent
will follow on this machine, so read it before installing it, the way a pull request is read.
Remotion's licence is free for individuals and companies of up to 3 people.

## The map: three questions

1. **A video, or motion on your website?** Website: *Animate your site*.
2. **Starting from footage you already shot?** Yes: *Edit your own footage*.
3. **A launch video, or an animated short?** Launch: *Ship a launch video*. Short: *Make an
   animated short*.

| Group | Repos (as the post describes them) |
|---|---|
| **Ship a launch video** | `AbubakrChan/product-launch-motion`: point it at a product, get script, voice-over, camera moves and film grade. `charlie947/motion-graphics-skills`: 15 skills for launch videos, animated charts and reels. `howseen-ai/claude-motion-design`: every cut on the beat. |
| **Edit your own footage** | `nateherkai/hyperframes-student-kit`: cuts dead air and mistakes from your footage, adds motion graphics. `Barty-Bart/motion-graphics`: motion B-roll timed to your words, and cuts you out of the background. |
| **Make an animated short** | `cth9191/animate`: explainers in 7 styles (cut paper, riso, pixel art...), storyboard first. `whaleyxbt/claude-motion`: teaches taste, makes Claude check its own frames, adds a sound engine. `haidrrrry/claude-remotion-skill`: fixes flat fades and stiff motion. |
| **Animate your site** | `motiondivision/motion`: buttons, cards and page transitions for React, Vue and plain JS. `199-biotechnologies/motion-dev-animations-skill`: one sentence and Claude Code animates a site. |
| **Official building blocks** | `heygen-com/hyperframes` (HeyGen): the agent writes HTML, HyperFrames renders video. `remotion-dev/remotion` and `remotion-dev/skills` (Remotion): video as React, and its best practices for coding agents. `greensock/gsap-skills` (GSAP): official GSAP skills. `LottieFiles/motion-design-skill` (LottieFiles): Disney's 12 principles rewritten for AI agents. |

All are at `github.com/<owner>/<repo>`. The post's link for `cth9191/animate` is malformed
(`http://http://github.com/...`).

## Where each fits in this game's work

| Task | Where it is tracked | Reach for | Why |
|---|---|---|---|
| **The launch trailer** | `launch-roadmap.md` row 4 (planned as OBS + DaVinci Resolve) | *Edit your own footage* on gameplay captures (`tools/smoke-test.mjs` and `tools/store-shots.mjs` already drive the game headless), with *Ship a launch video* for titles, the name card and beat cuts. HyperFrames or Remotion underneath. | Real gameplay is the trailer. The kits cut and dress it, and every cut lands on the music's beat. |
| **The store page's GIF and screenshots, retaken** | `itch-page.md`, design-document V14 and L9 | `tools/make-gif.py` stays the path for the GIF. A HyperFrames or GSAP overlay (a caption, a boon name) only if the page needs one. | The GIF must show the game itself. Keep within X's and itch's limits (best-practices doc §7). |
| **The title or front-page motion** | P1 / L2 | `LottieFiles/motion-design-skill` and the best-practices numbers (springs, easing) applied to Phaser tweens. | It is Phaser, not a website, so *Animate your site* does not apply. The principles do. |
| **In-game "juice"**: hits, boons, the boss's tells | requirements §2.31, §2.45 | `LottieFiles/motion-design-skill` as a checklist: anticipation before a boss strike, squash on hits, follow-through on deaths and splits. | The principles, not the libraries: the game draws with Phaser. |
| **Devlogs and an animated short** (how the well was emptied, how Vritra fell) | launch-roadmap row 4 (devlogs) | *Make an animated short*: `cth9191/animate` (it has a pixel-art style) or `whaleyxbt/claude-motion`, on Remotion. | Short explainers posted with each devlog, made from the founder's own art. |
| **The advertising clip** | design-document, "a name, then a short clip" | *Ship a launch video*, once the cast and the name are settled | It waits on the name (L1) and the cast (L14). |
| **A landing page**, if one is made later | (none yet) | *Animate your site*: `motion` or GSAP | Only if a page beyond itch.io and the GitHub Pages redirect is built. |

Rules carried over from the best-practices doc, whatever the kit:
- Every frame a pure function of `t`.
- Numbers in the prompt, not adjectives.
- Stills at named frames before the full render.
- Sound in code at -14 LUFS and under -1 dBTP in the decoded file.
- Assets the game already licenses only: music and SFX come from the credited sources in
  `game/assets/CREDITS.md`, and no Content ID-registered tracks.
