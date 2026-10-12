# Best practices: prompting for code-rendered animation loops

Saved 2026-10-12 at the founder's request, as standing guidance for making short animated loops
(promo clips, store-page motion, explainers) with an AI model writing the code.

**Source.** The founder asked for "the information and instructions in this link" to be saved:
<https://x.com/flxrnc/status/2105311836190978392>. The cloud session could not open it: the
network policy blocks x.com and its mirrors. **Nothing below is taken from that post.** It is
drawn from the prompt the founder sent with the link, which reads as the post's example: a 3D
animation-principles loop, four rounds of revisions and a sound prompt. It also draws on what
building that prompt taught (`animation/principles-loop/`). When the post can be read (allow
x.com in the environment's network settings, or paste its text), fold in what it says and mark
it as from the post.

## 1. Fix the output before describing the picture

The prompt opens with the contract, and every later choice hangs off it:

- **One file, pinned dependencies.** "One HTML file, three.js 0.160.0 via jsDelivr importmap,
  Geist Mono from Google Fonts." An exact version means the same code renders the same way
  next month.
- **Exact format.** "1080x1080, 8 s at 60 fps (480 frames), frame 480 equals frame 0." Size,
  length, rate, frame count, and that it loops.
- **A pure render function.** "`window.renderAt(t)` draws any frame from `t` alone; seeded
  random only." This one line makes the whole thing testable. Any frame can be rendered alone,
  in any order, by several workers. A frame can be checked, and a loop proven seamless (frame
  480 is byte for byte frame 0). Nothing may carry state from one call to the next.
  Simulations (springs, physics) are computed in full at load into tables, which are then
  looked up.

## 2. Say it in frames and numbers, not adjectives

- **Every event gets a frame.** Landings "on frames 105, 165, 225 and 285". Labels turn "on
  their exact frame: 69, 140, 200, 285, 303". Lights at "0.1 s, 0.4 s, 0.7 s", which is frames
  6, 24, 42. A frame number can be checked; "after a beat" cannot.
- **Make the timings agree.** The playhead "moves at constant speed and crosses each diamond on
  its landing frame". That one sentence fixes its speed (2 units per 60 frames), and it only
  works because the diamonds are evenly spaced. Check that the numbers fit together before
  sending.
- **Each principle as a measurement.** Anticipation is "an 11-frame crouch (1.2x0.75)".
  Squash and stretch are "0.85x1.28 at takeoff ... 1.25x0.7 on landing". Overlapping action is
  "arms lag 4 frames, legs 6". Follow-through is "spring back at damping 0.55". Arcs are "a
  360° flip along the arc, 3.5 high".
- **Colours as hex, materials as numbers.** "D97757 body ... roughness 0.45, clearcoat 0.3."
  "& in D97757". Lights as colour temperatures: 3200 K, 7500 K, 5000 K.
- **Light with behaviour.** Each light gets a role, a temperature, an on-time and how it comes
  on ("a 3-frame flicker"). Name one reaction to each light ("the mascot's eyes glance at it").
- **Camera with numbers.** FOV, elevation, orbit range over the loop, push-in percentage, what
  it tracks, and a punch-in on the climax.
- **Post with amounts.** "2% grain, 10% vignette", bloom only on emissives, depth of field
  focused on the hero.
- **The story in acts with clock times.** Lights 0 to 1 s, hops 1 to 5 s, flip 5 to 6.4 s, hold
  and blink, snap off at frame 468 so the cut back to frame 0 is clean.

## 3. Revise in numbered rounds of measurable fixes

Each round names what is wrong in a few words, then gives fixes that can be checked:

1. "The render is washed out and cramped." Then: "Grade so the lit front face reads D97757 and
   lit diamonds read FF6A2B; drop the fill so lights-off sits near 50% ... Pull the wide shot
   back to 44 units so the whole floating slab and all three stands are in frame."
2. "Frame check fixes." Then: "Keep every prop out of the label block ... keep every tripod
   foot on the slab ... (2.2 Hz, damping 0.22)."
3. and 4. One problem each: "so its click reads".

What makes these work:

- **A target colour, not "make it pop".** "Reads D97757" can be measured: render with the
  grade off, sample the surface, solve the per-channel gain.
- **Name screen regions and contact points.** "The label block", "every tripod foot on the
  slab", "above the mascot's head". These can be checked by projecting points on every frame.
- **Give the reason with the fix.** "So its click reads" tells the builder what to look for
  when judging the fix.
- **Keep earlier rounds in force.** A later fix must not undo one before it. Re-check every
  round's targets after each change.

## 4. The sound prompt

- **Synthesised in code**, "no samples, no downloads". It cannot go missing and has no licence
  question (compare `claude-working-notes.md`, *vet-assets-before-shortlisting*).
- **Music that fits the loop exactly.** "120 BPM, 4 bars" is 8 s, the loop's length. A key, F
  major, and roots by bar.
- **Sound on the picture's frames.** Every cue is listed by frame and "each hit lands 1 frame
  after its visual event". Sound a frame behind the picture reads as caused by it.
- **The bed follows the picture.** "Pad voices ... each following its light's flicker." The
  music turns the lights' clicks into chords.
- **Delivery numbers.** "48 kHz stereo WAV, about -14 LUFS, peak -1 dBTP, seamless loop, mux
  into the MP4." To make the loop seamless, render three loops and keep the middle one (tails
  wrap round). Measure loudness and true peak round the loop, not over a cut file.

## 5. Building and checking it (what the build taught)

- **Render through the pure function.** Use headless Chromium, `renderAt(i / 60)` for
  `i = 0 ... 479`, and read the canvas. Compare frame 480 with frame 0.
- **Check by measuring, not by eye alone.** Sample the face and diamond colours. Take the
  lights-off mean luminance. Project props against the label block on all 480 frames. Run
  ffmpeg's `ebur128` on the WAV, alone and looped three times.
- **Keep UI colours exact.** Composite the labels after grain and vignette, and keep bloom off
  emissive faces, so a hex in the prompt is the hex in the frame.
- **A colour target can conflict with other asks.** Pinning the face to D97757 made every white
  surface lit like it pure white ("washed out"). The fix was the light's shape: a more frontal
  key so the face catches more than the slab, and a gobo so the floor stays dark. The grade
  stayed as asked.
- **Watch for things that end up in one another's way.** At 45% tracking, a lamp centred
  over the slab drifted into the label block. Moving the lamp kept both asks.
