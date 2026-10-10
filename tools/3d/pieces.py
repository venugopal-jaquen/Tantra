# Simple pieces added to a model, run by render_char.py --pieces NAME. Everything is made in
# the model's own space and pinned to a bone, so it moves with the animation.
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

def turban():
    # A wound cloth: a broad wrap, a smaller turn of it sitting higher, a knot at the front, a tail behind.
    solid("turban", "sphere", SAFFRON, (0, 0.03, 1.99), (0.6, 0.61, 0.3))
    solid("turban_top", "sphere", DEEP, (0.0, 0.05, 2.2), (0.42, 0.43, 0.24))
    solid("turban_knot", "sphere", GOLD, (0.0, -0.52, 2.02), (0.11, 0.09, 0.13))
    solid("turban_tail", "sphere", SAFFRON, (0.3, 0.5, 1.6), (0.12, 0.08, 0.36), rot=(8, 0, -10))

def horns():
    # Two horns, swept outward. No band or ring round the head: nothing that could read as a halo.
    for side in (-1, 1):
        solid("horn" + str(side), "cone", HORN, (side * 0.38, 0.02, 2.2), (0.17, 0.17, 0.74), rot=(0, side * 34, 0), seg=10)

{"turban": turban, "horns": horns}[PIECES]()
