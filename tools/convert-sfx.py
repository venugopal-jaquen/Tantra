"""Kenney CC0 .ogg -> game/assets/sfx/*.wav.

Usage: download impact-sounds, interface-sounds and rpg-audio from kenney.nl into
game/assets/incoming/, unzip each into incoming/extracted/audio/<zip name>/, then
    pip install soundfile numpy
    python tools/convert-sfx.py
Swap a sound by editing MAP below and re-running.


WAV because older iOS Safari cannot decode Ogg Vorbis, and every browser plays PCM WAV.
Each file is: mixed to mono, leading silence trimmed (knifeSlice had 235ms of dead air -
a hit sound that late reads as input lag), tail trimmed below -50 dB with a 15 ms fade,
and peak-normalised to -1 dBFS so the per-sound volumes in the game code are the only
loudness control."""
import os
import numpy as np, soundfile as sf

import pathlib
REPO = pathlib.Path(__file__).resolve().parent.parent
SRC = REPO / "game/assets/incoming/extracted/audio"
DST = REPO / "game/assets/sfx"
os.makedirs(DST, exist_ok=True)

# game file name -> (pack, kenney file)
MAP = {
    "ui-click":      ("kenney_interface-sounds", "select_002"),
    "ui-confirm":    ("kenney_interface-sounds", "confirmation_001"),
    "ui-error":      ("kenney_interface-sounds", "error_001"),
    "ui-open":       ("kenney_interface-sounds", "open_002"),
    "ui-close":      ("kenney_interface-sounds", "close_002"),
    "ui-page":       ("kenney_rpg-audio",        "bookFlip3"),
    "satchel":       ("kenney_rpg-audio",        "cloth2"),
    "equip":         ("kenney_rpg-audio",        "metalLatch"),
    "hit-blade":     ("kenney_rpg-audio",        "knifeSlice2"),
    "hit-axe":       ("kenney_rpg-audio",        "chop"),
    "hit-zap":       ("kenney_interface-sounds", "glitch_002"),
    "hit-blocked":   ("kenney_impact-sounds",    "impactGlass_light_001"),
    "enemy-die-1":   ("kenney_impact-sounds",    "impactSoft_medium_000"),
    "enemy-die-2":   ("kenney_impact-sounds",    "impactSoft_medium_002"),
    "hurt-1":        ("kenney_impact-sounds",    "impactPunch_heavy_001"),
    "hurt-2":        ("kenney_impact-sounds",    "impactPunch_heavy_003"),
    "kavach":        ("kenney_impact-sounds",    "impactMetal_medium_000"),
    "bolt":          ("kenney_rpg-audio",        "drawKnife3"),
    "slam-warn":     ("kenney_interface-sounds", "bong_001"),
    "slam-land":     ("kenney_impact-sounds",    "impactSoft_heavy_003"),
    "shield-break":  ("kenney_impact-sounds",    "impactGlass_heavy_000"),
    "loot-tamra":    ("kenney_impact-sounds",    "impactTin_medium_000"),
    "loot-rajat":    ("kenney_interface-sounds", "glass_001"),
    "loot-swarna":   ("kenney_impact-sounds",    "impactBell_heavy_003"),
    "loot-mystery":  ("kenney_interface-sounds", "maximize_004"),
    "coins":         ("kenney_rpg-audio",        "handleCoins"),
    "wave-clear":    ("kenney_interface-sounds", "confirmation_002"),
    "gate-open":     ("kenney_rpg-audio",        "doorOpen_1"),
    "boss-fall":     ("kenney_impact-sounds",    "impactBell_heavy_001"),
    "descend":       ("kenney_rpg-audio",        "doorOpen_2"),
    "toll":          ("kenney_impact-sounds",    "impactBell_heavy_000"),
    "tejas-ready":   ("kenney_interface-sounds", "glass_004"),
    "tejas-go":      ("kenney_interface-sounds", "maximize_006"),
    "tejas-bell":    ("kenney_impact-sounds",    "impactBell_heavy_002"),
    "thud":          ("kenney_impact-sounds",    "impactWood_heavy_002"),
    "boom":          ("kenney_impact-sounds",    "impactSoft_heavy_001"),
}

total = 0
for name, (pack, src) in MAP.items():
    x, sr = sf.read(f"{SRC}/{pack}/Audio/{src}.ogg", always_2d=True)
    m = x.mean(axis=1)
    peak = np.abs(m).max()
    a = np.abs(m)
    start = max(0, int(np.argmax(a > peak * 10 ** (-40 / 20))) - int(sr * 0.003))
    live = np.where(a > peak * 10 ** (-50 / 20))[0]
    end = min(len(m), live[-1] + int(sr * 0.02)) if len(live) else len(m)
    m = m[start:end].copy()
    fade = min(len(m), int(sr * 0.015))
    m[-fade:] *= np.linspace(1, 0, fade)
    m *= 10 ** (-1 / 20) / max(np.abs(m).max(), 1e-9)
    out = f"{DST}/{name}.wav"
    sf.write(out, m.astype(np.float32), sr, subtype="PCM_16")
    size = os.path.getsize(out); total += size
    print(f"{name:14s} <- {src:24s} trim {start*1000//sr:4d}ms  {len(m)/sr:5.2f}s  {size//1024:4d} KB")
print(f"total {total//1024} KB, {len(MAP)} files")
