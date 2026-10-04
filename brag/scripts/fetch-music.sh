#!/usr/bin/env bash
# The music is not committed (license to double check). Copies it from the /brag skill into the composition.
set -euo pipefail
cd "$(dirname "$0")/.."
SKILL="${BRAG_SKILL_DIR:-$HOME/.claude/plugins/cache/brag/brag/0.2.2/skills/brag}"
mkdir -p composition/assets/music
cp "$SKILL/assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3" composition/assets/music/
echo "music copied"
