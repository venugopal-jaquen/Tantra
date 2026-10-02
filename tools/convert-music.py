"""Founder-picked music -> game/assets/music/{hub,combat,boss}.mp3

The game streams one track per mood (see MUSIC in game/loot-chase-v0.1.html). This turns
the files as downloaded into what it plays:

  * leading and trailing silence trimmed, so a loop restarts on sound rather than on air
  * every track brought to the same loudness, so one volume setting suits all three
    (the levels were set by measurement - the founder's ear is the final judge)
  * re-encoded to MP3 at about 120 kbps (variable): every browser plays it, and three
    tracks stay around 6 MB rather than 15

Usage
    1. Download the tracks with the site's own Download button into
       game/assets/incoming/music/ (keep the names the site gives them).
    2. Point PICKS below at them - any unique part of each file name will do.
    3. pip install soundfile numpy
       python tools/convert-music.py

A mood left as None is skipped; the game falls back as MUSIC describes.
Record every track in game/assets/CREDITS.md - title, artist, source URL, licence.
"""
import pathlib, sys
import numpy as np, soundfile as sf

REPO = pathlib.Path(__file__).resolve().parent.parent
SRC = REPO / "game/assets/incoming/music"
DST = REPO / "game/assets/music"

PICKS = {
    "hub":    "sitar-and-tanpura",     # Sitar and Tanpura - Indian style BGM, ShidenBeatsMusic
    "combat": "rockot-indian",         # Indian, Rockot
    "boss":   None,                    # not chosen yet - the first pick was Content ID registered
}

TARGET_RMS_DB = -20.0     # loudness every track is brought to
PEAK_CEILING_DB = -1.0    # ...unless that would clip, in which case the peak wins
SILENCE_DB = -50.0        # quieter than this at either end counts as silence
MP3_LEVEL = 0.5           # libsndfile VBR quality: about 120 kbps on dense music, less on sparse


def db(x):
    return 20 * np.log10(max(float(x), 1e-9))


def convert(mood, needle):
    matches = sorted(p for p in SRC.glob("*") if needle.lower() in p.name.lower() and p.suffix.lower() in (".mp3", ".wav", ".ogg", ".flac"))
    if not matches:
        print(f"{mood:7s} no file in {SRC.relative_to(REPO)} matches '{needle}' - skipped")
        return False
    src = matches[0]
    x, sr = sf.read(src, always_2d=True, dtype="float32")
    mono = np.abs(x).max(axis=1)
    live = np.where(mono > 10 ** (SILENCE_DB / 20))[0]
    if not len(live):
        print(f"{mood:7s} {src.name} is silent - skipped")
        return False
    start = max(0, live[0] - int(sr * 0.01))
    end = min(len(x), live[-1] + int(sr * 0.05))
    y = x[start:end].copy()
    fade_in, fade_out = int(sr * 0.01), int(sr * 0.03)
    y[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
    y[-fade_out:] *= np.linspace(1, 0, fade_out)[:, None]

    rms = np.sqrt((y ** 2).mean())
    gain = 10 ** ((TARGET_RMS_DB - db(rms)) / 20)
    gain = min(gain, 10 ** (PEAK_CEILING_DB / 20) / max(np.abs(y).max(), 1e-9))
    y *= gain

    DST.mkdir(parents=True, exist_ok=True)
    out = DST / f"{mood}.mp3"
    sf.write(out, y, sr, format="MP3", subtype="MPEG_LAYER_III", compression_level=MP3_LEVEL)
    secs = len(y) / sr
    size = out.stat().st_size
    print(f"{mood:7s} <- {src.name}\n"
          f"        {secs // 60:.0f}:{secs % 60:04.1f}  trimmed {start / sr:.2f}s + {(len(x) - end) / sr:.2f}s  "
          f"loudness {db(rms):.1f} -> {db(np.sqrt((y ** 2).mean())):.1f} dB  "
          f"{size / 1024:.0f} KB (~{size * 8 / secs / 1000:.0f} kbps)")
    return True


if __name__ == "__main__":
    if not SRC.exists():
        sys.exit(f"Nothing to convert: {SRC.relative_to(REPO)} does not exist. Download the tracks there first.")
    done = [mood for mood, needle in PICKS.items() if needle and convert(mood, needle)]
    skipped = [mood for mood, needle in PICKS.items() if not needle]
    print(f"\nconverted: {', '.join(done) or 'none'}" + (f"   not picked yet: {', '.join(skipped)}" if skipped else ""))
