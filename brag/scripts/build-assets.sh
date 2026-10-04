#!/usr/bin/env bash
# Turns the raw captures in .local/ into the assets used by composition/index.html
# (the result is committed, so you only need this when you want to refresh the screenshots)
set -euo pipefail
cd "$(dirname "$0")/.."
A=composition/assets
S=.local/shots
mkdir -p $A/img $A/video
for f in details print tablet-results phone-results phone-details results-full; do convert $S/$f.png -quality 90 $A/img/$f.jpg; done
convert $S/results-bg-nodock.png -quality 92 $A/img/results-bg.jpg
cp $S/dock-all.png $A/img/dock.png
for i in 0 1 4 5 8 9 11 12; do cp $S/card-$i.png $A/img/card-$i.png; done
convert $S/details.png -crop 470x440+725+165 +repage -quality 92 $A/img/item.jpg
cp $S/cards.json data/cards.json
cp .local/form/frames.json data/form-frames.json
# form recording : frames -> mp4 (sped up 1.5x, keep in sync with FS in scripts/gen.py)
(cd .local/form && ffmpeg -y -loglevel error -f concat -safe 0 -i list.txt -vf "fps=30,format=yuv420p,setpts=PTS/1.5" -c:v libx264 -crf 17 -preset medium -an form.mp4)
cp .local/form/form.mp4 $A/video/form.mp4
echo "assets built"
