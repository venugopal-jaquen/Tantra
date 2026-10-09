"""
Turns the film/ folder that tools/store-shots.mjs saved into a GIF for the store page.

    python tools/make-gif.py <film-dir> <out.gif> [--width 240] [--fps 10] [--colours 128]
                                                  [--start 0] [--seconds 5]

itch.io takes images up to 3 MB, and a GIF of a moving camera is heavy, so the picture is
small, the colours few and the film short. The size is printed: if it is over, lower one
of the three. One palette is shared by every frame, which keeps the colours from
shimmering and the file smaller. Look at the result before using it: too few colours
shows first as blotches on the floor. Needs Pillow.
"""
import argparse, json, os
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("film"); ap.add_argument("out")
ap.add_argument("--width", type=int, default=240)
ap.add_argument("--fps", type=float, default=10)
ap.add_argument("--colours", type=int, default=128)
ap.add_argument("--start", type=float, default=0)
ap.add_argument("--seconds", type=float, default=5)
a = ap.parse_args()

frames = json.load(open(os.path.join(a.film, "frames.json")))
step = 1000 / a.fps
# The film was taken at whatever rate the browser drew; take the frame nearest each tick.
picked, t = [], a.start * 1000
end = min(frames[-1]["ms"], (a.start + a.seconds) * 1000)
while t <= end:
    picked.append(min(frames, key=lambda f: abs(f["ms"] - t)))
    t += step
first = Image.open(os.path.join(a.film, picked[0]["name"]))
size = (a.width, round(a.width * first.height / first.width))
images = [Image.open(os.path.join(a.film, f["name"])).convert("RGB").resize(size, Image.LANCZOS) for f in picked]

# One palette for the whole film, taken from frames spread across it.
sample = images[::max(1, len(images) // 12)]
strip = Image.new("RGB", (size[0] * len(sample), size[1]))
for i, im in enumerate(sample):
    strip.paste(im, (i * size[0], 0))
# Octree, not median cut: median cut spends every colour on the floor, which fills the
# picture, and the green of the enemies comes out brown.
palette = strip.quantize(a.colours, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
out = [im.quantize(palette=palette, dither=Image.Dither.NONE) for im in images]
out[0].save(a.out, save_all=True, append_images=out[1:], duration=round(step / 10) * 10, loop=0, optimize=True, disposal=1)
print(f"{a.out}: {len(out)} frames, {size[0]}x{size[1]}, {a.colours} colours, {os.path.getsize(a.out) / 1e6:.2f} MB")
