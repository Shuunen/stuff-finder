# Brag video

Source of the showcase video of the main README ([docs/brag.mp4](../docs/brag.mp4)), made with the `/brag` Claude Code skill + [Hyperframes](https://github.com/heygen-com/hyperframes) (HTML + GSAP rendered to mp4).

## Layout

| Path                      | What                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `brag-plan.md`            | creative plan + storyboard + revision log                                                                        |
| `composition-brief.md`    | brief given to Hyperframes                                                                                       |
| `share-copy.txt`          | caption to post with the video                                                                                   |
| `scripts/gen.py`          | **generates `composition/index.html`** (timing, copy and animations all live here, edit this, not the html)      |
| `composition/`            | the Hyperframes project (`index.html` generated, `assets/` = fonts, sfx, screenshots, form recording)            |
| `data/`                   | small inputs of `gen.py` (bass envelope of the music, card positions, form cursor path, QR)                      |
| `scripts/capture/`        | playwright scripts that screenshot the **real app** (seeded with your real items), see below                     |
| `scripts/build-assets.sh` | converts raw captures into `composition/assets`                                                                  |
| `.local/`, `out/`         | git-ignored : personal inventory dump, raw captures, render output                                               |

## Edit the video (copy, timing, scenes)

```bash
python3 brag/scripts/gen.py                  # rewrites composition/index.html
./brag/scripts/fetch-music.sh                # once, the music is not committed (license to double check)
cd brag/composition
npx hyperframes check                        # lint + layout + contrast
npx hyperframes preview                      # studio
npx hyperframes render --quality looks --output ../out/brag.mp4
```

Then compress for the README (poster baked as first frame so every thumbnail looks good):

```bash
ffmpeg -ss 10 -i brag/out/brag.mp4 -frames:v 1 -vf scale=1280:-2 -q:v 3 docs/brag.jpg
ffmpeg -i brag/out/brag.mp4 -i docs/brag.jpg -filter_complex "[0:v]scale=1280:720[a];[a][1:v]overlay=0:0:enable='eq(n,0)'[v]" -map "[v]" -map 0:a -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart docs/brag.mp4
```

## Refresh the screenshots (only if the app UI changed)

1. start the app (`pnpm dev`, port 4200) and open `/search/battery` in your browser with your data loaded
2. `python3 brag/scripts/capture/dump-receiver.py` then paste `brag/scripts/capture/dump-from-browser.js` in the devtools console
3. `python3 brag/scripts/capture/download-images.py`
4. `node brag/scripts/capture/cap-results.mjs`, `cap-dock.mjs`, `cap-pages.mjs`, `cap-more.mjs`, `cap-form.mjs`
5. `./brag/scripts/build-assets.sh` then `python3 brag/scripts/gen.py`

The video shows the item "Digital Battery Tester" (`bt-168d`) : `cap-form.mjs` excludes it from the seeded data so the add form does not complain that the reference exists.
