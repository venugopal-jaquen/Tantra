# Simple pieces added to a model, run by render_char.py --pieces NAME[,NAME...]. Everything is
# made in the model's own space (it stands 2.2 tall, faces -Y, head centred near z 1.65) and
# pinned to a bone, so it moves with the animation. Nothing here is a crown, a halo or any
# mark of a revered figure: enemies are antagonists (requirements 2.12).
import bmesh
from mathutils import Matrix

def solid(name, kind, colour, loc, scale=(1, 1, 1), rot=(0, 0, 0), bone="head", smooth=True, seg=14, rings=8, tip=0.0):
    bm = bmesh.new()
    if kind == "sphere": bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1)
    else: bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=1, radius2=tip, depth=1)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = smooth
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*colour, 1)
    me.materials.append(mat)
    b = arm.data.bones[bone]
    ob.parent = arm; ob.parent_type = "BONE"; ob.parent_bone = bone
    ob.matrix_parent_inverse = (b.matrix_local @ Matrix.Translation((0, b.length, 0))).inverted()
    ob.location = loc; ob.scale = scale; ob.rotation_euler = tuple(math.radians(v) for v in rot)
    return ob

SAFFRON, DEEP, GOLD, HORN = (1.0, 0.42, 0.06), (0.86, 0.26, 0.03), (1.0, 0.72, 0.12), (0.93, 0.86, 0.66)
BRONZE, DARK_BRONZE, VIOLET, BUD = (0.85, 0.55, 0.16), (0.42, 0.24, 0.08), (0.22, 0.1, 0.32), (1.0, 0.22, 0.32)

def turban():
    # The hero. A wound cloth: a broad wrap, a smaller turn of it sitting higher, a knot at the front, a tail behind.
    solid("turban", "sphere", SAFFRON, (0, 0.03, 1.99), (0.6, 0.61, 0.3))
    solid("turban_top", "sphere", DEEP, (0.0, 0.05, 2.2), (0.42, 0.43, 0.24))
    solid("turban_knot", "sphere", GOLD, (0.0, -0.52, 2.02), (0.11, 0.09, 0.13))
    solid("turban_tail", "sphere", SAFFRON, (0.3, 0.5, 1.6), (0.12, 0.08, 0.36), rot=(8, 0, -10))

def horns():
    # The Asura. Two horns, swept outward.
    for side in (-1, 1):
        solid("horn" + str(side), "cone", HORN, (side * 0.38, 0.02, 2.2), (0.17, 0.17, 0.74), rot=(0, side * 34, 0), seg=10)

def buffalo():
    # The Brute. Wide horns that run out sideways and turn up, over the hood he already wears.
    for side in (-1, 1):
        solid("bhorn_a" + str(side), "cone", HORN, (side * 0.72, 0.0, 2.2), (0.2, 0.2, 0.62), rot=(0, side * 82, 0), tip=0.55, seg=10)
        solid("bhorn_b" + str(side), "cone", HORN, (side * 1.08, 0.0, 2.46), (0.12, 0.12, 0.56), rot=(0, side * 18, 0), seg=10)

def hexhat():
    # The Hexer. A tall narrow cap that leans back, ringed once, so the figure is the tallest thin thing on the floor.
    solid("cap", "cone", VIOLET, (0, 0.08, 2.5), (0.46, 0.46, 1.1), rot=(-10, 0, 0), seg=12)
    solid("cap_ring", "cone", GOLD, (0, 0.04, 2.08), (0.5, 0.5, 0.1), tip=0.94, seg=14)

def seeds():
    # The Bloodseed. Buds swelling on the shoulders and back: it is already becoming two.
    for side in (-1, 1):
        solid("bud" + str(side), "sphere", BUD, (side * 0.4, 0.06, 1.3), (0.2, 0.2, 0.2), bone="chest", seg=10, rings=6)
    solid("bud_back", "sphere", BUD, (0.0, 0.36, 1.12), (0.26, 0.24, 0.26), bone="chest", seg=10, rings=6)
    solid("bud_head", "sphere", BUD, (0.22, 0.2, 2.14), (0.15, 0.15, 0.15), seg=10, rings=6)

def helm():
    # The Gatekeeper. A domed helm with a spike and a guard for the neck, the face left open.
    solid("dome", "sphere", BRONZE, (0, 0.04, 2.0), (0.6, 0.61, 0.34))
    solid("spike", "cone", GOLD, (0, 0.04, 2.56), (0.07, 0.07, 0.62), seg=8)
    solid("spike_base", "sphere", GOLD, (0, 0.04, 2.3), (0.14, 0.14, 0.1))
    solid("neck", "sphere", DARK_BRONZE, (0, 0.4, 1.62), (0.5, 0.22, 0.42))
    solid("nose", "cone", GOLD, (0, -0.56, 1.8), (0.045, 0.045, 0.42), tip=1.0, seg=6)

def vault():
    # The Hoard Guardian. A shut helm with a slit to see through and two short down-turned horns: a strongbox with legs.
    solid("mask", "sphere", GOLD, (0, 0.0, 1.72), (0.62, 0.6, 0.6))
    solid("slit", "cone", (0.05, 0.02, 0.0), (0, -0.5, 1.78), (0.3, 0.16, 0.07), tip=1.0, seg=8)
    solid("rivet", "sphere", DARK_BRONZE, (0, -0.6, 1.46), (0.09, 0.07, 0.11))
    for side in (-1, 1):
        solid("vhorn" + str(side), "cone", DARK_BRONZE, (side * 0.66, 0.0, 1.9), (0.14, 0.14, 0.5), rot=(0, side * 118, 0), seg=10)

SETS = {"turban": turban, "horns": horns, "buffalo": buffalo, "hexhat": hexhat, "seeds": seeds, "helm": helm, "vault": vault}
for name in [n for n in PIECES.split(",") if n]:
    SETS[name]()
