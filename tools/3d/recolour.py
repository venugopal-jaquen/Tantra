"""
Recolours a swatch texture: the atlas is 8 columns by 4 rows of gradient swatches, and a
model's parts each point at a few of them (uvcells.py says which).

  python recolour.py in.png out.png "col,row=H,S,V; col,row=H,S,V; ..."

H is the new hue in degrees, S the new saturation (0..1), V a multiplier on the swatch's
own brightness, so its gradient (the shading) is kept.
"""
import sys, colorsys
from PIL import Image
src, dst, spec = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert("RGBA"); px = im.load()
cw, ch = im.width // 8, im.height // 4
for part in [p.strip() for p in spec.split(";") if p.strip()]:
    cell, hsv = part.split("=")
    col, row = [int(v) for v in cell.split(",")]
    H, S, V = [float(v) for v in hsv.split(",")]
    for y in range(row * ch, (row + 1) * ch):
        for x in range(col * cw, (col + 1) * cw):
            r, g, b, a = px[x, y]
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            r2, g2, b2 = colorsys.hsv_to_rgb((H % 360) / 360, S, min(1.0, v * V))
            px[x, y] = (round(r2 * 255), round(g2 * 255), round(b2 * 255), a)
im.save(dst); print("recoloured", dst)
