# Animation principles loop

An 8-second loop, 1080 x 1080 at 60 fps, of a miniature studio. A floating white slab carries
a timeline. The pixel Claude mascot, built of 0.1 voxels, hops along it to show five principles
of animation: anticipation, squash and stretch, overlapping action, follow-through and arcs. The
score is synthesised in the page with the Web Audio API.

Made 2026-10-12 from the spec the founder sent, its four rounds of revisions and its sound
prompt. They are Experiment 2 of Florence's (@flxrnc) X Article *Opus 5.5 Motion Lab*, which
`docs/animation-prompting-best-practices.md` summarises. Each is quoted below with where it lives
in the code. It has nothing to do with the game. `principles-loop-contact.jpg` is a contact
sheet: every 40th frame.

| File | What it is |
|---|---|
| `index.html` | The loop: one page, three.js 0.160.0 from jsDelivr through an import map, Geist Mono from Google Fonts |
| `render.mjs` | Renders the page in headless Chromium: 480 frames, the score as a WAV, both muxed into the MP4 |
| `principles-loop.mp4` | The render: H.264 High at CRF 20 (4.1 MB), AAC 320 kb/s, 8.000 s, 480 frames |
| `principles-loop.wav` | The score: 48 kHz, stereo, 24-bit, -14 LUFS, -2.0 dBTP, loops without a seam |

## Watching it

Serve this folder (`python -m http.server 8123`) and open `index.html`. It plays on its own;
click to start the sound, and the picture then follows the audio clock. `?frame=384` holds one
frame. The page needs a connection: it loads three.js and the typeface.

## Rendering it

```bash
node animation/principles-loop/render.mjs              # all 480 frames, the score, the MP4
node animation/principles-loop/render.mjs --frames=0,105,384   # stills into .cache/stills/
node animation/principles-loop/render.mjs --probe=60,450       # colours at the mascot's face and diamond 3
node animation/principles-loop/render.mjs --audio              # the score alone, with ffmpeg's loudness reading
node animation/principles-loop/render.mjs --mux                # the MP4 again from frames already rendered
```

It needs Node 18+, Playwright with Chromium, ffmpeg, curl and tar. On a machine without a GPU
(Chromium's software renderer) a frame takes about 3.3 s, so the whole loop takes about half an
hour. `--workers=N` opens N pages, but they share one GPU process. External files are fetched
once into `.cache/` (not kept in git) and served from there, so renders repeat exactly. If
jsDelivr cannot be reached, three.js 0.160.0 comes from the npm registry instead: the same
files.

`window.renderAt(t)` draws the frame at `t` seconds from `t` alone, and every random number is
seeded. So any frame can be rendered on its own, in any order, by any number of workers. The
script checks that frame 480 comes out byte for byte the same as frame 0.

## The timeline, in frames

| Frame | Picture | Sound (one frame later) |
|---|---|---|
| 6, 24, 42 | Key (3200 K), rim (7500 K), top spot (5000 K) click on, each with a 3-frame flicker; the eyes glance at each | Click; pad voices A3 E4, G5, C5 follow each light's flicker |
| 45 | Playhead crosses diamond 1 | Shaker 8ths begin |
| 60 | | Kick and bass begin: F D Bb F by bar |
| 69, 129, 189, 249 | 11-frame crouch to 1.2 x 0.75 (69 checks 01 ANTICIPATION) | Creak and an inhale riser |
| 80, 140, 200, 260 | Takeoff, stretch 0.85 x 1.28 (140 checks 02, 200 checks 03 as the limbs trail) | Upward swish |
| 105, 165, 225, 285 | Landing on diamonds 2 to 5: squash 1.25 x 0.7, the diamond lights FF6A2B, cells ripple 0.08, 12 sparks (285 checks 04 as the arms settle) | Rubber squash, spark tings |
| 303 to 318 | The dotted arc draws in from above the mascot's head to diamond 1 (303 checks 05 ARCS) | A tick each frame |
| 312 | 18-frame deep crouch | Creak and riser |
| 330 to 384 | A 360° flip along the arc, 3.5 high; the playhead rewinds under it | Whoosh; bass holds C; kick and shaker rest 330 to 420 |
| 384 | Lands on diamond 1, which lights; 4% punch-in | The biggest squash; bass to F |
| 432 | Blink | Blip |
| 468 | Lights, diamonds, labels and playhead snap off | Clunk |

The playhead's x is `(frame - 165) / 30`, so it crosses each diamond on its landing frame. The
ruler is marked in the same frames, so its numbers over the diamonds are 45, 105, 165, 225 and
285.

## What was asked, and where it is

**The spec.** Set, hero, lights, hops, flip, labels, end, camera and post as written. Where the
spec left a number open, the choice is in the code next to the spec's numbers. The hop height
is 1.15, the body springs back at 3.2 Hz, and the arc's dots are 0.075 cubes, 30 of them.

**1. Washed out and cramped.**
- *Grade so the lit front face reads D97757 and lit diamonds read FF6A2B.* `GRADE` is a white
  balance measured in `?calib` mode (see Grading). Lit diamond tops are unlit material in the
  colour that grades to FF6A2B (`graded()`). Bloom is kept off emissive faces so it cannot tint
  them.
- *Drop the fill so lights-off sits near 50%.* `LIGHT.fill`. Frame 0 measures 45% mean
  luminance. The fill is the grade's white, so lights-off reads grey, not orange.
- *Key 28° from the front right, cool rim at the back left edging the side we see.* `keyLight`
  is 35° right of the camera's axis and 28° up. A gobo (`keyGobo`) holds it to the slab and the
  air above it, so the floor in front stays dark. `rimLight` comes from 122° round to the back
  left, 8° up, aimed along the mascot's path, and lights its left side and top edges.
- *Wide shot at 44 units, whole slab and all three stands in frame.* Checked by projection
  on every wide-shot frame. The nearest point to an edge is the boom's tail, 12 px from the
  right edge during the punch-in.
- *A soft shadow under the slab.* A blurred contact shadow on the floor, and the key's soft
  (VSM) shadow.
- *Sparks 0.075 to 0.12, ruler numbers bigger.* Sparks are seeded in that range. The numbers
  are 0.43 units tall on a ruler whose face is sloped toward the camera.

**2. Frame check fixes.**
- *Keep every prop out of the label block: track the hops at 45%, hang the top spot at 5.8 on a
  boom from the back right corner, above the flip.* The camera follows a smoothed copy of the
  mascot's x at 45% during the push-in. The lamp hangs at y 5.8 and x 1.6, above the flip's
  rising side. At x 0, the right-hand tracking carried it into the labels. The rim strip was
  lowered for the same reason. Lamp, boom, mast, strip, softbox, mascot and arc were projected
  on all 480 frames, and none enters the label block.
- *Light each lit diamond with a soft glow from its face.* A point light above each lit diamond,
  plus bloom.
- *The playhead light at the front edge of the track, its line under the diamonds.* The light
  rides a bead at the front edge. The line runs below the diamonds' tops and rides the ripple.
- *The dotted arc starts above the mascot's head.* `arcPoint(0)` is 0.2 above the top of the
  standing mascot on diamond 5.
- *Every tripod foot on the slab.* Feet are within the slab's 12 x 6 at the corners, and clear
  of the ruler.
- *Arms: a bigger, slower settle (2.2 Hz, damping 0.22).* `simulateLimbs`. The arms swing about
  50° past rest after a landing and ring for about a second.

**3. The rim strip's panel turns toward the camera,** so its click reads.

**4. The top spot: a 34° pool at 45 cd, with a glowing lens rim.** A SpotLight with a 17°
half-angle at 45 candela, and an emissive ring at the lens.

**Sound.** Everything is synthesised in `scoreLoop`: 120 BPM, 4 bars, F major. The score is
rendered as three loops and the middle one kept, so tails wrap round the seam. The landing
squashes are pitched by their squash. Each glides from `note x sx/sy` down to `note x sy`, on
C4 D4 F4 G4, and F3 for the flip.

It was then checked the way the source article checks its scores (docs/animation-prompting-best-practices.md §7),
by measuring stems, not by listening:

- **Each hit's first peak lands on frame + 1.** Hits are scheduled a few ms early by their rise
  time (the `lead` in `at(f, leadMs)`). Measured on the isolated stems, clicks, landings, pings
  and the blip peak 0 to 2.5 ms after frame + 1, and takeoffs within 3 ms.
- **Hits sit 3 to 6 dB over the bed**, K-weighted over their first 60 ms. Landings measure 3.9 to
  6.2 dB (6.2 is the flip's), takeoffs 4.2 to 6.6, pings 4.5 to 5.3, the blip 3.1. The quieter
  ones share a frame with another hit: the ping at 69 rides on the crouch's creak, and the
  takeoff at 330 rides under the flip's whoosh.
- **-14 LUFS, and under -1 dBTP in the MP4.** `master()` measures loudness (BS.1770-4) and true
  peak (4x oversampled) round the loop, then limits with look-ahead. AAC lifted the true peak by
  about 0.5 dB, from -1.3 in the WAV to -0.9 in the MP4. So the WAV is limited to -2.0 dBTP, and
  the decoded MP4 reads -13.9 LUFS and -1.8 dBTP (-1.4 looped three times). The limiter takes
  up to 5.8 dB off the noise swishes' peaks.
- **The MP4's copy of the score** fades in and out over 2 ms (raised cosine), because AAC pads
  the start of the track and a looping player would otherwise step at the seam. Decoded, it lines
  up with the WAV to the sample. The WAV stays the seamless master.

## Grading

The grade is a per-channel gain that puts the lit front face on D97757. To measure it, render
with `?calib` (no grade, grain, vignette or labels: raw linear light). Read the median colour of
a 9 x 9 patch on the front face below the eyes (`--probe`), at frames 60, 125, 185, 245, 305
and 450. Set `GRADE.wb` to the target over the mean. The fill depends on the grade, so repeat
until it settles, which takes two or three passes. Last measured:

| | Front face | Diamond 3, lit |
|---|---|---|
| Target | D97757 (217, 119, 87) | FF6A2B (255, 106, 43) |
| Frame 60 / 450, nothing glowing nearby | (216, 117, 90) / (220, 117, 90) | n/a / (254, 106, 43) |
| Frames 125 to 305, sparks and a fresh diamond beside it | (227 to 233, 118 to 120, 84 to 86) | (253 to 255, 105 to 111, 42 to 48) |

Lights off (frame 0): 45% mean luminance.

## Things that bit, for whoever changes it next

- `Color.add(Vector3)` gives NaN without an error, and a NaN light turns the whole frame black.
- `ShaderPass` clones its uniforms, textures included. Assign live textures after making it.
- `Math.max(...array)` overflows the stack at 384,000 samples. Use a loop.
- A distant spot falls off across the slab, about 15% between diamonds 1 and 5. The key has no
  falloff (decay 0); the gobo and cone shape it instead.
- A light's own stand must not cast that light's shadow: the softbox shadowed the mascot on
  diamond 5.
