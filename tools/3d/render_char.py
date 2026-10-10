"""
Renders a rigged, animated 3D character into still frames for a 2D sprite sheet.
Run inside Blender, headless:

  blender -b --python render_char.py -- --glb Knight.glb --out frames/hero [options]

  --list              print the objects and animations in the file and stop
  --texture FILE      use this picture in place of the model's own texture (a recolour)
  --hide A,B          hide objects whose names contain any of these (helmet, cape, ...)
  --anims SPEC        name:frames pairs, e.g. Idle:1,Walking_A:8,1H_Melee_Attack_Chop:5
  --size N            frame size in pixels (default 256)
  --elev DEG          camera height above the ground plane, in degrees (default 48)
  --engine NAME       eevee (default) or cycles
  --pieces NAME       a set of simple added pieces from pieces.py beside this file: turban, horns
Each facing is rendered by turning the character, never the light, so every sprite is lit
from the same side of the screen.
"""
import bpy, sys, os, math, argparse
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--glb", required=True); ap.add_argument("--out", default="")
ap.add_argument("--list", action="store_true")
ap.add_argument("--texture"); ap.add_argument("--hide", default="")
ap.add_argument("--anims", default="Idle:1,Walking_A:8")
ap.add_argument("--size", type=int, default=256); ap.add_argument("--elev", type=float, default=48)
ap.add_argument("--engine", default="eevee"); ap.add_argument("--pieces")
ap.add_argument("--zoom", type=float, default=1.75)
a = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a.glb)
scene = bpy.context.scene
arm = next(o for o in scene.objects if o.type == "ARMATURE")
meshes = [o for o in scene.objects if o.type == "MESH"]

if a.list:
    print("OBJECTS:", [(o.name, o.type, o.parent.name if o.parent else None, o.parent_bone, o.hide_render) for o in scene.objects])
    print("ACTIONS:", sorted(x.name for x in bpy.data.actions))
    print("MATERIALS:", [(m.name, [n.image.name for n in m.node_tree.nodes if n.type == "TEX_IMAGE" and n.image]) for m in bpy.data.materials if m.node_tree])
    lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
    print("BOUNDS:", tuple(round(v, 2) for v in lo), tuple(round(v, 2) for v in hi))
    sys.exit(0)

for word in [w for w in a.hide.split(",") if w]:
    for o in scene.objects:
        if word.lower() in o.name.lower():
            o.hide_render = True; o.hide_viewport = True
if a.texture:
    img = bpy.data.images.load(os.path.abspath(a.texture))
    for m in bpy.data.materials:
        if m.node_tree:
            for n in m.node_tree.nodes:
                if n.type == "TEX_IMAGE":
                    n.image = img
if a.pieces:
    extra = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pieces.py")
    exec(compile(open(extra, encoding="utf-8").read(), extra, "exec"), {"bpy": bpy, "arm": arm, "scene": scene, "Vector": Vector, "math": math, "PIECES": a.pieces})

# The swatch textures are tiny gradients: no filtering artefacts wanted, no shine either.
for m in bpy.data.materials:
    if m.node_tree:
        for n in m.node_tree.nodes:
            if n.type == "BSDF_PRINCIPLED":
                n.inputs["Roughness"].default_value = 0.9
                if "Specular IOR Level" in n.inputs: n.inputs["Specular IOR Level"].default_value = 0.1
                n.inputs["Metallic"].default_value = 0.0

# How tall the figure stands, for the camera.
lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
for o in meshes:
    if o.hide_render: continue
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
height = hi.z - lo.z
target = Vector((0, 0, lo.z + height * 0.5))

cam_data = bpy.data.cameras.new("cam"); cam_data.type = "ORTHO"; cam_data.ortho_scale = height * a.zoom
cam = bpy.data.objects.new("cam", cam_data); scene.collection.objects.link(cam); scene.camera = cam
e = math.radians(a.elev); dist = 20
cam.location = target + Vector((0, -dist * math.cos(e), dist * math.sin(e)))
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()

def sun(name, energy, rot, colour):
    d = bpy.data.lights.new(name, "SUN"); d.energy = energy; d.color = colour; d.angle = math.radians(12)
    o = bpy.data.objects.new(name, d); o.rotation_euler = tuple(math.radians(v) for v in rot); scene.collection.objects.link(o)
sun("key", 3.2, (50, 0, -35), (1.0, 0.95, 0.86))        # from above and screen-left, warm
sun("fill", 1.0, (65, 0, 140), (0.75, 0.82, 1.0))       # a cool lift on the far side
world = bpy.data.worlds.new("w"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.62, 0.55, 0.5, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.55

r = scene.render
r.resolution_x = r.resolution_y = a.size; r.resolution_percentage = 100
r.film_transparent = True; r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "None"
if a.engine == "cycles":
    r.engine = "CYCLES"; scene.cycles.samples = 24; scene.cycles.use_denoising = False; scene.cycles.device = "CPU"
else:
    r.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [i.identifier for i in type(r).bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"

# The character is turned under a fixed camera and fixed lights.
pivot = bpy.data.objects.new("pivot", None); scene.collection.objects.link(pivot)
for o in list(scene.objects):
    if o.parent is None and o not in (pivot, cam) and o.type not in ("LIGHT", "CAMERA"):
        o.parent = pivot
FACINGS = {"front": 0, "right": 90, "back": 180, "left": 270}     # degrees the figure is turned, seen from above

ad = arm.animation_data or arm.animation_data_create()
for t in ad.nla_tracks: t.mute = True
for spec in a.anims.split(","):
    name, count = spec.split(":"); count = int(count)
    act = bpy.data.actions.get(name)
    if not act:
        print("NO SUCH ANIMATION:", name); continue
    ad.action = act
    if hasattr(ad, "action_slot") and getattr(act, "slots", None) and ad.action_slot is None:
        ad.action_slot = act.slots[0]
    f0, f1 = act.frame_range
    for facing, deg in FACINGS.items():
        pivot.rotation_euler = (0, 0, math.radians(deg))
        for i in range(count):
            scene.frame_set(int(round(f0 + (f1 - f0) * i / count)) if count > 1 else int(f0))
            r.filepath = os.path.join(os.path.abspath(a.out), f"{name}_{facing}_{i:02d}.png")
            bpy.ops.render.render(write_still=True)
print("RENDERED", a.out)
