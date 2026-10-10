"""Which swatches of the texture each part of a model uses: blender -b --python uvcells.py -- model.glb"""
import bpy, sys
from mathutils import Vector
glb = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=glb)
arm = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
out = {}
for o in bpy.context.scene.objects:
    if o.type != "MESH" or o.name == "Icosphere": continue
    cells = {}
    uv = o.data.uv_layers.active.data
    for poly in o.data.polygons:
        us = [uv[i].uv for i in poly.loop_indices]
        u = sum(x[0] for x in us) / len(us); v = sum(x[1] for x in us) / len(us)
        c = (int(u * 8) % 8, int((1 - v) * 4) % 4)
        cells[c] = cells.get(c, 0) + poly.area
    tot = sum(cells.values()) or 1
    out[o.name] = sorted(((c, round(100 * a / tot)) for c, a in cells.items()), key=lambda x: -x[1])
    lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
    for c in o.bound_box:
        lo = Vector(map(min, lo, c)); hi = Vector(map(max, hi, c))
    print("PART", o.name, "cells(col,row):%", out[o.name], "box", tuple(round(x, 2) for x in lo), tuple(round(x, 2) for x in hi))
hb = arm.data.bones.get("head")
print("HEADBONE", tuple(round(x, 2) for x in hb.head_local), tuple(round(x, 2) for x in hb.tail_local), round(hb.length, 2))
print("BONES", [b.name for b in arm.data.bones])
