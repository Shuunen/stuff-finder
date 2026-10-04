#!/usr/bin/env bash
# Regenerates data/bass.json (bass envelope of the music, drives the background glow) and data/qr.svg (qr of the sticker).
# Needs : the music (./scripts/fetch-music.sh), ffmpeg, python3 + numpy, and uv (or pip install segno)
set -euo pipefail
cd "$(dirname "$0")/.."
MUSIC=composition/assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3
EXTRACT="${BRAG_EXTRACT_AUDIO:-$HOME/.claude/skills/hyperframes-creative/scripts/extract-audio-data.py}"
python3 "$EXTRACT" "$MUSIC" --fps 30 --bands 8 -o .local/audio-data.json
python3 - <<'PY'
import json
d = json.load(open('.local/audio-data.json'))
json.dump([round(f['bands'][0], 2) for f in d['frames'][:1340]], open('data/bass.json', 'w'), separators=(',', ':'))
PY
uv run --with segno python - <<'PY'
import segno
segno.make('BT-168D', error='m', micro=False).save('data/qr.svg', kind='svg', scale=1, border=0, dark='#000', xmldecl=False, svgns=True, nl=False)
PY
echo "data regenerated"
