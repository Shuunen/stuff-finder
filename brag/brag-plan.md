# Brag Plan: Stuff Finder

## What is this app?
A personal inventory PWA where you search (text, voice, QR/barcode scan) for the 901 things you own and find out which drawer they're in.

## The angle
Everyone owns a drawer of doom. The video is the deadpan relief of a question everyone has asked: "Where the heck did I put my label maker?" — answered in under 20 seconds. Uses the app's own tagline, real result cards with real drawer badges, and the QR-label scan.

## Hook (first 2-3 seconds)
The question types out on the cream background, big, in Bricolage Grotesque: "Where the heck did I put my batteries?" (adapted from the app's tagline). Relatable, no logo yet.

## Key moments (the middle)
- Home screen lands: "Stuff Finder●" wordmark with the peach tape, "901 things" pill, rounded search bar; cursor types "battery".
- Results grid: "Looking for “battery”" taped-label title, "15 results found" pill, cards pop in one by one (Digital Battery Tester, Lii-600, Batteries TG5, Piles diverses, Batterie externe, Chargeur de batterie), each with its drawer badge (A drawer 01, F drawer 02, R drawer 03...).
- Scan: camera card "Scan a QR Code or a barcode to search for it 👀" on a label "Manette Xbox sans-fils noire A3"; beep; the item is found.

## Outro / punchline
The real description lands one line at a time: "Sorting things is pointless if you can't find them afterwards." Then "Stuff Finder●" with the red dot bouncing in, and "stuff-finder.netlify.app".

## User flow worth showing
Type "battery" → grid of matching items each with its drawer → scan a QR label on a physical item → item found. (entry → key action → result)

## Tone
- Preset: default
- Creative direction: deadpan-relatable "the drawer of doom" — warm, dry, postable
- Interpretation: calm confident pacing, clean crossfades/slides, humor comes from the tagline and the ultra-specific items (Xbox sticks, "Piles diverses"), never from shouting.

## Format: landscape — 1920x1080
## Duration: 41.7s

## Visual identity (from the project)
- Background: #fbf7ee (cream) with gradient to rgba(255,210,122,0.3) amber, subtle maze/triangle line pattern
- Accent: #e04a2b (red, the dot), pastels #ffd27a amber, #b7e5c0 mint, #9fd3e8 sky, #f0a8c8 pink, #ffb088 peach, #e8d8f8 violet
- Text: #1e2a3b (navy black), secondary #4a5666
- Display font: Bricolage Grotesque (400-800)
- Body font: JetBrains Mono for pills/labels
- Strongest visual element: neo-brutalist cards with thick navy border and hard offset shadow, tilted drawer badges, peach tape strip

## Share copy (draft)
Sorting things is pointless if you can't find them afterwards, so I built Stuff Finder: 901 things, one search bar, zero "where did I put it".

## Audio direction
- Role: warm sparse bed with motion-matched accents
- Music: light, warm, playful bed (ukulele/soft electronic mood)
- Music treatment: starts at 0s low, gentle fade-in, ducks slightly under the beep, fade-out over last 2s
- Music cue guidance: cues to be detected at composition time; target one strong cue for the home reveal (~3s) and beat-grid windows for the card-by-card results reveal (scene 3)
- Audio-reactive treatment: none
- SFX posture: moderate, motion-matched
- Audio-coupled moments: typed hook (soft key ticks), cards popping in one by one, barcode scan beep (the app ships its own beep), final dot bounce
- Restraint rule: no risers or hits that fight the deadpan; nothing louder than the music bed except the scan beep

## Storyboard

### Scene 1 — The question — 3s
Cream background. "Where the heck did I put my label maker?" types out; holds settled ~1.2s.
Sequential/interaction: yes — typed character by character
Audio intent: quiet, curious
Audio-coupled idea: subtle key ticks on typing
Music: warm bed fades in
Transition mood: soft → Scene 2

### Scene 2 — The home screen — 3.5s
Real home UI: "901 things" pill, Settings button, "Stuff Finder●" wordmark with tape, search bar. Cursor clicks the bar and types "battery" (text holds ~0.8s).
Sequential/interaction: yes — simulated click + typing
Audio intent: click into place, satisfying
Audio-coupled idea: click, then key ticks
Transition mood: clean slide → Scene 3

### Scene 3 — The results — 5s
Title tape "Looking for “battery”", pill "15 results found". Six cards pop in one by one with drawer badges (A drawer 01, F drawer 02, R drawer 03...). Final card set holds ~1s.
Sequential/interaction: yes — cards arrive one by one on the beat grid (accent reveals, not readable text, so ~0.4s spacing ok; full grid held after)
Audio intent: rhythmic, tactile
Audio-coupled idea: card pop per arrival
Transition mood: clean wipe → Scene 4

### Scene 4 — The item (replaces the QR scan scene) — 4.7s
Cursor clicks the "Digital Battery Tester" card; its real details screen lands with the "A drawer 01" badge slamming in as the payoff. (Original scan scene description below is superseded.)

### (superseded) Scene 4 — The scan
"SCAN" outline heading, white card "Scan a QR Code or a barcode to search for it 👀" containing the label "Manette Xbox sans-fils noire A3" with QR. A scan line sweeps, beep, label gets a mint "found" highlight and an "A · drawer 03" badge slaps on.
Sequential/interaction: yes — scan sweep, beep, badge stamp
Audio intent: the payoff
Audio-coupled idea: the app's beep sound on the scan
Transition mood: soft crossfade → Scene 5

### Scene 5 — The punchline — 4s
"Sorting things is pointless if you can't find them afterwards." (holds ~3s over two lines), then "Stuff Finder●" with the red dot bouncing in, and the URL.
Sequential/interaction: none
Audio intent: warm resolve
Audio-coupled idea: soft dot-bounce accent
Music: fade out
Transition mood: end

**Music mood for this video:** warm upbeat, light
**Audio summary:** quiet typed hook, tactile clicks and card pops through the flow, one scan beep as the payoff, warm fade-out.

## Revision log
- Story unified on batteries: hook, search "battery", click first result, item details (drawer 01), then QR scan of the battery tester's label (drawer 01), then punchline. Total 41.7s.
- v3: hook is "battery tester"; results are the real masonry (captured from the running app with the real items); added "How does it work ?" with Step 1 (add form), Step 2 (print + thermal printer), a three-screen slide and a phone-scan slide. Total 41.7s.
- v4: results shows 8 cards quickly and circles the found item right on the results page (details page dropped); add form pastes a photo URL and the image replaces the eye; Step 2 ends with the label sticking onto the item ("Then stick the small label on your item."). Total 41.7s.
