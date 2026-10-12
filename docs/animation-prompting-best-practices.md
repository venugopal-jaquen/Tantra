# Best practices: prompting for code-rendered animation loops

Saved 2026-10-12 at the founder's request, as standing guidance for short animated pieces
(promo clips, store-page motion, trailers, explainers) made by having a model write code.

**Source.** Florence (@flxrnc), *Opus 5.5 Motion Lab: Make Claude Animate Like a Studio*, an X
Article: <https://x.com/flxrnc/status/2105311836190978392>. It is a lab notebook of three
animations, each with its exact prompt, every follow-up and the sound prompt. Sections 1 to 8
summarise it in our words, with short quotes. Section 9 is what building its Experiment 2 here
added (`animation/principles-loop/`). The article is the authority; where this page and it
differ, it wins.

## 1. The idea: the model writes code that paints pixels

A model like Opus 5.5 does not generate video. It writes a program, usually one HTML file,
that draws frames. A headless browser freezes the program at each frame, saves PNGs, and
ffmpeg makes the MP4 or GIF. Three things follow, and all of them help:

1. **Every frame is reproducible.** Each pixel is a pure function of `t`, so frame 84 renders
   the same every time.
2. **Edits are cheap.** Change one number, re-render. No re-rolling.
3. **The model can check its own work.** It reads stills and contact sheets well, and is good
   at spotting what changed between two images.

## 2. The render contract (paste under any motion prompt)

The article's contract, line by line. Each line closes off one way a render goes wrong:

- One self-contained HTML file, only the libraries the prompt names, **pinned to a version**.
- No network requests except fonts and those pinned libraries.
- Every frame is a pure function of time `t` in seconds. If JavaScript drives motion, expose
  `window.renderAt(t)` that draws exactly that frame.
- Animate with CSS keyframes, the Web Animations API, SVG, Canvas 2D or WebGL.
- No `Date.now`, no `setTimeout` or `setInterval`, no unseeded `Math.random`.
- Loops: render frames 0 to N-1 only, and frame N-1 must flow into frame 0.

A clock or timer makes frame 84 differ between runs. Unseeded randomness makes shapes jitter.
Rendering frame N of a loop shows frame 0 twice: the hiccup at the seam. **When a fix works,
add it to the contract.** The contract is the lab's memory.

## 3. Direct, don't describe: the prompt template

The article's controlled test made the same earbud product shot twice. A 27-word prompt of
adjectives ("cool", "premium", "modern") came back with every default look: dark navy space, a
glowing ring, bloom, particles, a spinning turntable, a made-up tagline. A 448-word directed
prompt came back as a studio film. **"Adjectives are where the default look lives. Every
adjective you replace with a number is a decision you take back from the model."**

Fill every line before sending:

| Line | What goes in it |
|---|---|
| GOAL | What the viewer should feel or do, in one sentence. Write it first. |
| OUTPUT | One HTML file (or Remotion, HyperFrames), the engine and its version, W x H |
| TIME | Seconds x fps = total frames; loop or not; BPM if there is music. Every other number hangs off the frame count. |
| LOOK | Palette in hex, one accent, typeface + weight + size + tracking; materials as numbers |
| MOTION | Easing as cubic-bezier, springs as damping ratio, durations in frames |
| SHOTS | Frame ranges, **one hero move per shot**, and how each shot hands off (default to a cut on the beat) |
| BANNED | The defaults you never want to see, by name |
| QA | Stills at named frames, a contact sheet, fix, then the full render |

For 3D add MODEL (dimensions, units, the guardrail that keeps a character recognisable, e.g.
"keeps its pixel proportions exactly") and CAMERA (lens, path, easing; "never parked").

**What the translation looks like** (the earbud test): "premium" became materials (satin ceramic
at roughness 0.38 with clearcoat 0.35, chrome at roughness 0.05). "Cool" became a studio: key,
fill and rim with exact colours and strengths. "Modern" became a camera: 30° FOV, an orbit from
34° to 10°, one push-in on ease-out-expo. "Animation" became beats and springs: 120 BPM, a
3-frame anticipation, a lid spring at damping 0.6.

**The ban list to start from:** purple or blue gradients, glow, lens flares; decorative floating
particles; everything fading in at once; fade-and-slide-up on every element; centred-everything
layouts; text that moves while it is being read. After every first render, name the defaults
the model used anyway and add them. A vague "avoid a generic AI look" only swaps one default for
another.

**Hierarchy.** One hero move per shot. Secondary moves travel 50 to 70% as far and start 100 to
200 ms later. Ambient motion stays under 5% of the hero's travel, on a slow sine, and never stops.

## 4. The numbers (cheat sheet)

**Easing** (cubic-bezier, from Andrey Sitnik's Easings reference):

| Name | cubic-bezier | For |
|---|---|---|
| ease-out-expo | 0.16, 1, 0.3, 1 | text and logo reveals |
| ease-out-quint | 0.22, 1, 0.36, 1 | premium entrances |
| ease-in-out-quart | 0.76, 0, 0.24, 1 | moves and camera pushes |
| ease-in-expo | 0.7, 0, 0.84, 0 | fast exits |
| ease-out-back | 0.34, 1.56, 0.64, 1 | a playful pop with overshoot |

Enter with ease-out, exit with ease-in and make exits 40 to 50% shorter, cross the screen with
ease-in-out. Linear only for rotation, progress bars and a loop's phase; linear on a move looks
like a render. Cameras get the softest curves, objects the snappier ones.

**Springs** are one number across every library: the damping ratio, `d / (2 * sqrt(k * m))`.
1.0 never bounces; 0.7 to 0.85 feels premium; 0.4 to 0.6 playful; under 0.3 a cartoon.
Remotion's default spring is 0.5, react-spring's 1.0. Position and size may bounce; opacity and
colour never do. Write springs as closed-form functions of `t` so any frame renders on its own:

```js
// zeta: damping ratio, f: speed in Hz; progress 0 to 1 at time t
function spring(t, zeta = 0.7, f = 2) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f;
  if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
}
```

Keep every number in one tokens file (easings, durations, stagger) and tell the model "use only
these tokens, no inline numbers".

**Durations and stagger.** UI feedback 100 to 200 ms; UI moves 200 to 500 ms; hero reveals 600
to 900 ms; letters 1 frame apart, words 60 to 120 ms, list items 40 to 80 ms. Start the next
element when the last is 30 to 50% done. For video, say it in frames (at 24 fps, 400 ms is 10
frames).

**Beat grid.** Frames per beat = fps x 60 / BPM. Compute each beat from time and round each one;
adding a rounded count drifts (2 frames off after 32 beats at 128 BPM and 30 fps). Cut on the
beat, change the layout on the bar.

**Holds and readability.** Text holds at least 0.3 s per word plus 0.5 s. A slow 2% push keeps a
hold alive. Text keeps 4.5:1 contrast on every frame; never flash more than 3 times a second
(WCAG).

**Exaggeration.** Push key poses 10 to 30% further than feels right: the feed shrinks everything.

## 5. The five principles, written as numbers (from Experiment 2)

| Principle | What it does | Written in the prompt as |
|---|---|---|
| Anticipation | Winds up before the move | 11-frame crouch (1.2x0.75) |
| Squash and stretch | Weight and speed | stretch 0.85x1.28 at takeoff, squash 1.25x0.7 on landing |
| Overlapping action | Limbs start later than the body | arms lag 4 frames, legs 6 |
| Follow-through | Parts keep moving after the body stops | arms settle at 2.2 Hz, damping 0.22 |
| Arcs | Natural paths | a flip along a dotted arc, 3.5 high |
| Slow in, slow out | Speeds up and settles softly | spring back at damping 0.55 |
| Timing | Frame count sets weight | 25 frames of air per hop, 18 frames of crouch before the flip |

Pin labels to frames and they become a test: a move that runs late shows as a label lighting
before its move. While iterating, ask for a playhead and frame labels (or a frame counter and a
pause key), and switch them off for the final render.

## 6. The lab loop: render, look, fix

The first render is a draft. Render stills, look, write notes **with frame numbers**, fix, and
re-render only what changed. Two to four rounds is normal; the article's pieces took 4 to 15
creative follow-ups each.

- **Freeze any frame by URL** (`anim.html?t=2.5` calls `renderAt(2.5)` and pauses CSS/WAAPI
  animations at that time) so the model can screenshot and read it.
- **Contact sheet:** every 12th frame tiled 4 x 3, read like a storyboard:
  `ffmpeg -framerate 24 -i out/frames/%04d.png -vf "select='not(mod(n\,12))',scale=400:-1,tile=4x3" -frames:v 1 out/contact.png`
- **Onion skin** (frames stacked at low opacity): spacing should tighten near the keys.
  **Speed graph** (position per frame): straight lines are linear, corners are dead stops.
- **Follow-ups that work** point at frames, not feelings. One or two per round. Examples:
  "Render stills at frames 0, 24, 48, 72 and 96, describe each as a viewer would, does it match
  the shot list?", "Make a contact sheet; mark every frame where two things move at once, then
  fix the hierarchy", "Review this like a senior motion designer: 10 notes by impact, each with
  a frame number and the code change; apply the top 5", "It is too busy: remove 30% of the
  motion".
- **Translate feelings before sending.** "Make it pop" means scale 1.0 to 1.08 to 1.0 over 6
  frames, peaking on the beat. "Premium" means ease-out-quint entrances, springs at 0.8, no
  overshoot on text. "It drags" means shorten each hold by one beat. "Busy" means one hero at a
  time, others 150 ms later at 60% travel. "Looks like AI" means name the defaults and ban them.
- **When a fix does not hold:** render the frames either side (83 and 85), list every
  difference, fix only the line that causes it, render both again.
- **Audit numerically.** Experiment 2 was also checked by reading the live scene on all 480
  frames against the prompt's numbers: 71 checks, 6 failed first time, all fixed before the
  final render.
- **Count and publish your follow-ups.** Receipts convince; "one prompt" invites suspicion.

## 7. The last mile: sound, loops, export

**Sound.** The picture must work muted first, since the feed autoplays silent. Synthesise sound
in code (Web Audio API, no samples) from the frame numbers. **Each hit lands 1 frame after its
picture**: light beats sound. The model cannot listen, so it checks by measuring:

- The waveform's **first peak** on frame + 1, to the sample. Build tonal hits in cosine phase
  with short (0.5 to 1 ms) attacks; avoid waveshapers that delay the peak.
- **Hits 3 to 6 dB over the bed** (K-weighted, first 60 ms), measured as hit stem minus bed stem.
- Most energy in the **phone band (about 150 Hz to 6 kHz)**. A sub-heavy mix reads -14 LUFS but
  plays as nothing on a phone, so move bass up an octave and keep hits under 8 kHz, mono-safe.
- **-14 LUFS, -1 dBTP**, and keep the limiter light (under about 1.5 to 4 dB) by not stacking
  every partial's crest on the same sample. Remove DC.
- **AAC raises true peak** (one case: -1.3 dBTP in the WAV became -0.4 in the MP4). Limit the WAV
  to about -2.2 dBTP if the decoded MP4 must stay under -1. AAC also pads the start (about 16 ms),
  so for a single-loop MP4 add a 2 ms raised-cosine fade to the first and last samples. Keep the
  seamless WAV as the master. Check sync by decoding the finished MP4.

**Loops.** Render frames 0 to N-1, never N. Drive every loop from `phase = frame / N` with whole
cycles: a square that turns exactly 90° per loop, a wave of exactly 2 cycles, noise sampled along
a circle. Make frame 0 a finished composition, since it shows while a GIF loads. Check the seam by
playing three copies end to end: `ffmpeg -stream_loop 2 -i out/anim.mp4 -c copy out/loop_check.mp4`.

**Export for X.**

| | GIF (X Articles, inline loops) | Video (posts) |
|---|---|---|
| Size | 15 MB | 140 s without Premium |
| Frame size | up to 1280 x 1080 | 1920 x 1080 for 16:9 |
| Frames, speed | at most 350 frames | up to 60 fps |
| Format | one palette for the clip, loop forever | H.264 High, yuv420p, AAC |
| Lab default | 1200 px wide, 24 fps | CRF 18, `+faststart` |

GIF delays are stored in hundredths of a second: at 24 fps, use five frames at 40 ms then one at
50 ms, or the loop runs 4% fast. Pick the canvas first: 1920 x 1080, 1080 x 1080, 1080 x 1350 or
1080 x 1920 (X takes 1:3 to 3:1).

## 8. Engines and set-up

- **Plain HTML and CSS:** one idea under 10 s, 2D type, shapes and UI. Zero installs.
- **Three.js:** anything 3D. Drive time from the frame number, never the clock; give the camera
  numbers (FOV 35 to 50° is a good start). Pin the version and know its traps: in r160,
  `TextGeometry` reads `height` for extrusion depth, and a `depth` parameter is overwritten.
- **Remotion:** video as React components, frame-exact, with Agent Skills for Claude Code.
  Licence: free for individuals and companies of up to 3 people; larger companies need one.
- **HyperFrames (HeyGen):** HTML, CSS and GSAP timelines in, MP4 out; Apache 2.0.
- **GSAP:** the web's timeline library, now free including its plugins.
- **Motion (Framer Motion):** live React interfaces; no video renderer.

Put the engine and its numbers in the OUTPUT line ("a Remotion composition, 1920 x 1080, 30 fps,
450 frames"). Set-up: Node, ffmpeg and Playwright's Chromium, plus a ~20-line `render.mjs` that
calls `renderAt(i / fps)`, pauses `document.getAnimations()` at that time and screenshots each
frame. Showcase renders add a real GPU and motion blur blended from subframes in linear light (a
180° shutter). Effort: start at medium; raise it only when a from-scratch piece misses twice.

## 9. What building Experiment 2 here added

`animation/principles-loop/` is that prompt built in a cloud session without a GPU. What it
taught, beyond the article:

- **Precompute physics into periodic tables.** Spring-driven limbs were simulated over two loops
  at load and the second loop kept, so `renderAt(t)` stays a pure lookup and the seam matches.
- **Measure colour targets with the grade off.** Render raw linear light, sample the surface,
  set per-channel gains, repeat when the fill depends on the grade. Composite labels after grain
  and vignette, and keep bloom off emissive faces, so a hex in the prompt is the hex in the frame.
- **A colour target can collide with "not washed out".** Pinning the face to D97757 made every
  white surface lit like it pure white. The fix was the light's shape (a frontal key and a gobo
  holding it to the stage), not the grade.
- **Project, don't eyeball, layout rules.** "Keep every prop out of the label block" was checked
  by projecting each prop on all 480 frames. At 45% tracking a lamp centred over the slab drifted
  into the labels; moving the lamp kept both rules.
- **A light's own stand must not cast that light's shadow.**
- **Render audio as three loops and keep the middle**, so tails wrap the seam; measure loudness
  and true peak round the loop. Solo each stem and compare levels: the first mix let bass and
  kick carry the loudness and buried the character sounds.
- **Things that bit:** `Color.add(Vector3)` gives NaN silently and blacks out the frame;
  `ShaderPass` clones texture uniforms; `Math.max(...samples)` overflows the stack; a sandbox
  may block a CDN, so cache pinned libraries (npm has the same files as jsDelivr).
