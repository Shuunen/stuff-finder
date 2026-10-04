import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'
bass = json.load(open(DATA / 'bass.json'))
form = json.load(open(DATA / 'form-frames.json'))
cards = json.load(open(DATA / 'cards.json'))
OUT = ROOT / 'composition' / 'index.html'

# ---------------------------------------------------------------- timing
O = 36.33  # outro start
TOTAL = round(O + 5.35, 2)
SC = {1: (0, 3.18), 2: (3.18, 6.34), 3: (6.34, 10.55), 5: (10.55, 12.13), 6: (12.13, 20.02),
      7: (20.02, 26.86), 8: (26.86, 31.59), 9: (31.59, 36.33), 10: (36.33, TOTAL)}
SCIDS = sorted(SC)
XF = 0.3

audio = []
_n = [0]
def sfx(src, start, dur, vol, track):
    _n[0] += 1
    audio.append(f'<audio id="sfx-{_n[0]}" data-start="{start:.2f}" data-duration="{dur}" data-track-index="{track}" data-volume="{vol}" src="{src}"></audio>')

KEYS = ['assets/sfx/keyboard/keypress-003.wav', 'assets/sfx/keyboard/keypress-011.wav', 'assets/sfx/keyboard/keypress-019.wav']
CLICK = 'assets/sfx/interface/click_003.ogg'
DROP1 = 'assets/sfx/interface/drop_001.ogg'
DROP2 = 'assets/sfx/interface/drop_002.ogg'
IMPACT = 'assets/sfx/impact/impactSoft_medium_001.ogg'
CARD = 'assets/sfx/casino/card-place-1.ogg'

# ---------------------------------------------------------------- scene 1 hook
hook = "Where the heck did I put my battery tester?"
H0, HSTEP = 0.3, 0.04
s1 = []
for w in hook.split(' '):
    s1.append('<span class="word">' + ''.join(f'<span class="ch h1c">{html.escape(c)}</span>' for c in w) + '</span>')
s1_text = ' '.join(s1)
for k in range(0, len(hook), 3):
    sfx(KEYS[(k // 3) % 3], H0 + k * HSTEP, 0.1, 0.3, 11)

# ---------------------------------------------------------------- scene 2 home
q = "battery"
Q0, QS, CLICK_T = 4.30, 0.10, 4.12
sfx(CLICK, CLICK_T, 0.2, 0.7, 12)
for k in range(len(q)):
    if k % 2 == 0:
        sfx(KEYS[k % 3], Q0 + k * QS, 0.19, 0.3, 11)
sfx(IMPACT, 3.14, 0.4, 0.5, 13)
q_html = ''.join(f'<span class="ch qc">{c}</span>' for c in q)

# ---------------------------------------------------------------- scene 3 results (real masonry)
SHOW = [0, 4, 8, 11, 1, 9, 5, 12]
order = [c for i in SHOW for c in cards if c['i'] == i]
R0, RSTEP = 6.62, 0.15
sfx(DROP1, 6.34, 0.3, 0.5, 13)
card_html = ''
card_tw = ''
for k, c in enumerate(order):
    t = R0 + k * RSTEP
    card_html += f'<img class="rc" id="rc{c["i"]}" src="assets/img/card-{c["i"]}.png" style="left:{c["x"]:.0f}px; top:{c["y"]:.0f}px; width:{c["width"]:.0f}px; height:{c["height"]:.0f}px;" alt="" />\n'
    card_tw += f'tl.fromTo("#rc{c["i"]}", {{ y: 40, opacity: 0, scale: 0.94 }}, {{ y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.4)" }}, {t:.2f}); // beat-grid\n'
    if k % 2 == 0:
        sfx(CARD, t - 0.04, 0.3, 0.4, 14)
RING_T = 8.96  # strong cue
sfx(IMPACT, RING_T - 0.03, 0.4, 0.6, 13)
sfx(CLICK, RING_T + 0.2, 0.2, 0.5, 12)
first = [c for c in cards if c['i'] == 0][0]
RING_C = (first['bx'] + first['bw'] / 2 + 10, first['by'] + first['bh'] / 2 - 6)

# ---------------------------------------------------------------- scene 5 title
sfx(IMPACT, SC[5][0] + 0.08, 0.4, 0.5, 13)

# ---------------------------------------------------------------- scene 6 step 1
T6 = SC[6][0]
VS = round(T6 + 0.55, 2)
FS = 1.5  # speed-up baked into the mp4
VDUR = round(form['total'] / FS, 2)
WX, WY = 320, 250           # window outer left/top
CX0, CY0 = WX + 4, WY + 4 + 40  # content origin
K6 = 1280 / 1100
OX6, OY6 = -420 * K6, 360 - 545 * K6
def p6(x, y):  # source px -> composition coords, cursor tip offset
    return (CX0 + x * K6 + OX6 - 11, CY0 + y * K6 + OY6 - 5)
cur6 = ''
cur_list = form['cursor']
for idx, c in enumerate(cur_list):
    tc = VS + c['t'] / FS
    x, y = p6(c['x'], c['y'])
    if idx == 0:
        cur6 += f'tl.fromTo("#cursor6", {{ x: 1500, y: 900, opacity: 0 }}, {{ x: {x:.0f}, y: {y:.0f}, opacity: 1, duration: 0.5, ease: "power2.inOut" }}, {tc-0.55:.2f});\n'
    else:
        prev = VS + cur_list[idx-1]['t'] / FS
        st = max(tc - 0.3, prev + 0.14)
        cur6 += f'tl.to("#cursor6", {{ x: {x:.0f}, y: {y:.0f}, duration: {tc-st:.2f}, ease: "power2.inOut" }}, {st:.2f});\n'
    cur6 += f'tl.to("#cursor6", {{ scale: 0.85, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "0 0" }}, {tc:.2f});\n'
    sfx(CLICK, tc, 0.2, 0.55, 12)
create_t = VS + cur_list[-1]['t'] / FS
# typing ticks (name, price, details, reference)
for ci in range(4):
    L = cur_list[ci]['len']
    tc = VS + cur_list[ci]['t'] / FS + 0.18 / FS
    stepv = cur_list[ci]['step'] / FS
    for k in range(0, L, 3):
        sfx(KEYS[k % 3], tc + k * stepv, 0.09, 0.28, 11)
DET_T = create_t + 0.3
sfx(IMPACT, DET_T, 0.4, 0.5, 13)
sfx(DROP1, T6 + 0.06, 0.3, 0.4, 14)
cur6 += f'tl.to("#cursor6", {{ opacity: 0, duration: 0.25 }}, {DET_T+0.1:.2f});\n'

# ---------------------------------------------------------------- scene 7 step 2
S7 = SC[7][0]
P = dict(wx=70, wy=250)
K7 = 1060 / 800
CX7, CY7 = P['wx'] + 4, P['wy'] + 4 + 40
OX7, OY7 = -560 * K7, 298 - 545 * K7
def p7(x, y):
    return (CX7 + x * K7 + OX7 - 11, CY7 + y * K7 + OY7 - 5)
btn7 = p7(1063, 677)
lab7 = (CX7 + 834 * K7 + OX7, CY7 + 559 * K7 + OY7, 155 * K7, 74 * K7)  # print-label preview rect
PRINT_T = round(S7 + 1.6, 2)
sfx(DROP1, S7 + 0.1, 0.3, 0.4, 14)
sfx(CLICK, PRINT_T, 0.2, 0.7, 12)
sfx('assets/sfx/casino/card-shuffle.ogg', PRINT_T + 0.35, 1.9, 0.5, 13)
STICK_T = round(S7 + 4.35, 2)
sfx(IMPACT, STICK_T + 0.4, 0.4, 0.6, 14)
sfx(CARD, STICK_T - 0.1, 0.4, 0.5, 13)
sfx('assets/sfx/interface/drop_002.ogg', S7 + 0.55, 0.3, 0.4, 12)

# ---------------------------------------------------------------- scene 8a devices
S8A = SC[8][0]
for dt in (0.45, 1.0, 1.5):
    sfx(CARD, S8A + dt - 0.05, 0.4, 0.5, 14)
sfx(DROP1, S8A + 0.05, 0.3, 0.4, 12)

# ---------------------------------------------------------------- scene 8b scan
S8B = SC[9][0]
BEEP_T = 36.34
sfx(DROP1, S8B + 0.05, 0.3, 0.4, 12)
sfx(CARD, S8B + 0.35, 0.4, 0.5, 14)
sfx(IMPACT, S8B + 0.7, 0.4, 0.5, 13)
audio.append(f'<audio id="sfx-beep" data-start="{BEEP_T-0.03:.2f}" data-duration="1.07" data-track-index="15" data-volume="0.55" src="assets/sfx/barcode-scan-beep-09.mp3"></audio>')
sfx(IMPACT, BEEP_T + 0.55, 0.4, 0.5, 13)

# ---------------------------------------------------------------- outro
sfx(DROP1, O + 0.18, 0.3, 0.4, 13)
sfx(DROP2, O + 0.74, 0.3, 0.4, 14)
sfx(IMPACT, O + 3.12, 0.4, 0.55, 13)
sfx('assets/sfx/impact/impactBell_heavy_000.ogg', O + 3.58, 1.5, 0.35, 14)

music = ('<audio id="bg-music" data-start="0" data-duration="%s" data-track-index="10" data-volume="0.3" '
         'data-automation=\'{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0},{"t":1.2,"v":1},{"t":%s,"v":1},{"t":%s,"v":0}]}]}\' '
         'src="assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3"></audio>') % (TOTAL, round(TOTAL - 2.3, 2), TOTAL)

# ---------------------------------------------------------------- svg bits
MAG = '<svg width="34" height="34" viewBox="0 0 24 24"><path fill="#1e2a3b" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/></svg>'
MIC = '<svg width="34" height="34" viewBox="0 0 24 24"><path fill="#1e2a3b" d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72z"/></svg>'
GEAR = '<svg width="30" height="30" viewBox="0 0 24 24"><path fill="#1e2a3b" d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54A.48.48 0 0 0 13.92 2h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.47a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2"/></svg>'
CURSOR = '<svg id="{id}" width="54" height="54" viewBox="0 0 24 24" style="position:absolute; left:0; top:0; z-index:9;"><path d="M5 2l14 10-6 1.5L16 21l-3 1-3-7.5L5 19z" fill="#1e2a3b" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
def qr(size):
    s = open(DATA / 'qr.svg').read()
    return s.replace('width="21" height="21"', f'width="{size}" height="{size}" viewBox="0 0 21 21" shape-rendering="crispEdges" style="flex:none;"')
def label(w, h, qs, idp, *_):
    gap = int(w * 0.04)
    avail = w - qs - 3 * gap
    f1 = int(avail / 11.6); f2 = int(f1 * 0.8); f3 = int(f1 * 1.7)
    return (f'<div id="{idp}" style="width:{w}px; height:{h}px; background:#fff; border-radius:8px; box-shadow:0 12px 26px rgba(30,42,59,0.35); display:flex; align-items:center; gap:{gap}px; padding:0 {gap}px; box-sizing:border-box;">'
            f'{qr(qs)}<div style="flex:1; text-align:right; color:#1e2a3b; white-space:nowrap;"><div style="font-size:{f1}px; line-height:1.15;">Digital Battery Tester</div>'
            f'<div style="font-size:{f2}px; color:#2f3a4a; margin-top:4px;">Battery Checker BT-168D</div><div style="font-size:{f3}px; font-weight:800; margin-top:8px;">A·1</div></div></div>')
def win(idp, left, top, cw, ch, inner):
    return (f'<div id="{idp}" style="position:absolute; left:{left}px; top:{top}px; width:{cw+8}px; height:{ch+48}px; box-sizing:border-box; background:#fff; border:4px solid var(--navy); border-radius:22px; box-shadow:10px 10px 0 var(--navy); overflow:hidden;">'
            f'<div style="height:40px; background:#f3ead7; border-bottom:4px solid var(--navy); display:flex; align-items:center; gap:10px; padding:0 16px;"><i style="width:14px; height:14px; border-radius:50%; background:#e04a2b; display:block;"></i><i style="width:14px; height:14px; border-radius:50%; background:#ffd27a; display:block;"></i><i style="width:14px; height:14px; border-radius:50%; background:#b7e5c0; display:block;"></i></div>'
            f'<div style="position:relative; width:{cw}px; height:{ch}px;">{inner}</div></div>')
def title(idp, txt, top, size):
    return f'<div id="{idp}" style="position:absolute; left:0; right:0; top:{top}px; text-align:center; font-weight:800; font-size:{size}px; line-height:1.05; letter-spacing:-2px; white-space:nowrap;">{txt}</div>'
def phone(idp, left, top, sw, sh, inner):
    return (f'<div id="{idp}" style="position:absolute; left:{left}px; top:{top}px; width:{sw+28}px; height:{sh+28}px; box-sizing:border-box; background:#1e2a3b; border-radius:{int(sw*0.15)}px; padding:14px; box-shadow:10px 10px 0 rgba(30,42,59,0.35);">'
            f'<div style="position:relative; width:{sw}px; height:{sh}px; border-radius:{int(sw*0.11)}px; overflow:hidden; background:#fff;">{inner}</div></div>')

# ---------------------------------------------------------------- layouts for scene 8a
D_W = 920; D_H = int(D_W * 1080 / 1920)
T_W = 400; T_H = int(T_W * 1770 / 1230)
P_W = 250; P_H = int(P_W * 1688 / 780)
BOT = 905
d_left, d_top = 70, BOT - (D_H + 48)
t_left, t_top = 1048, BOT - (T_H + 28)
p_left, p_top = 1520, BOT - (P_H + 28)

# ---------------------------------------------------------------- phone scan layout (8b)
PS_W, PS_H = 310, 671
ph_left, ph_top = 1060, 180
# wordmark/outro html
OUT_TAPE = '<div class="tape" data-layout-allow-overflow id="{id}" style="top:{top}px; left:{left}px; transform:rotate(-4deg);"></div>'

bass_js = json.dumps(bass, separators=(',', ':'))
sc_tag = lambda i: f'id="scene{i}" class="clip" data-start="{SC[i][0]}" data-duration="{(SC[i][1]-SC[i][0]+(XF if i < 10 else 0)):.2f}"'

doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1920, height=1080" />
<title>Stuff Finder Brag</title>
<script src="assets/gsap.min.js"></script>
<style>
@font-face {{ font-family: "Bricolage Grotesque"; font-weight: 400; src: url("assets/fonts/bricolage-400.ttf") format("truetype"); }}
@font-face {{ font-family: "Bricolage Grotesque"; font-weight: 800; src: url("assets/fonts/bricolage-800.ttf") format("truetype"); }}
@font-face {{ font-family: "JetBrains Mono"; font-weight: 700; src: url("assets/fonts/jbmono-700.ttf") format("truetype"); }}
:root {{ --navy:#1e2a3b; --slate:#4a5666; --red:#e04a2b; --amber:#ffd27a; --mint:#b7e5c0; --sky:#9fd3e8; --peach:#ffb088; --pink:#f0a8c8; --cream:#fbf7ee; }}
html, body {{ margin:0; padding:0; background:#fbf7ee; }}
body {{ font-family:"Bricolage Grotesque", system-ui, sans-serif; color:var(--navy); }}
#root {{ position:relative; width:100%; height:100%; overflow:hidden; background:linear-gradient(to top right, #fbf7ee 0%, #fbf0d8 60%, #fde9bd 100%); }}
#glow {{ position:absolute; inset:0; background:radial-gradient(ellipse 60% 55% at 50% 48%, rgba(255,210,122,0.75), rgba(255,210,122,0) 70%); opacity:0.35; }}
#dots {{ position:absolute; inset:0; background-image:radial-gradient(rgba(30,42,59,0.10) 2px, transparent 2.5px); background-size:44px 44px; }}
.clip {{ position:absolute; inset:0; }}
.scene {{ position:absolute; inset:0; }}
.word {{ display:inline-block; white-space:nowrap; }}
.ch {{ opacity:0; }}
.pill {{ position:absolute; font-family:"JetBrains Mono", monospace; font-weight:700; font-size:30px; padding:10px 24px; border:3px solid var(--navy); border-radius:40px; box-shadow:5px 5px 0 var(--navy); background:var(--amber); }}
.btn {{ position:absolute; font-weight:800; font-size:28px; letter-spacing:1px; text-transform:uppercase; padding:10px 26px; border:3px solid var(--navy); border-radius:16px; box-shadow:5px 5px 0 var(--navy); background:#fff; display:flex; gap:14px; align-items:center; }}
.tape {{ position:absolute; width:190px; height:66px; background:rgba(255,176,136,0.85); box-shadow:0 2px 6px rgba(30,42,59,0.15); }}
.wordmark {{ position:relative; display:inline-block; font-weight:800; font-size:178px; line-height:1; letter-spacing:-3px; white-space:nowrap; }}
.dot {{ display:inline-block; width:38px; height:38px; border-radius:50%; background:var(--red); border:4px solid var(--navy); margin-left:10px; }}
.bar {{ width:920px; height:104px; border-radius:52px; border:4px solid var(--navy); background:#fff; box-shadow:7px 7px 0 var(--navy); display:flex; align-items:center; padding:0 32px; box-sizing:border-box; gap:22px; }}
.bar .txt {{ flex:1; font-weight:800; font-size:44px; color:var(--navy); white-space:nowrap; }}
.bar .ph {{ position:absolute; left:0; font-weight:400; color:#9aa3ad; }}
.rc {{ position:absolute; display:block; }}
.mono {{ font-family:"JetBrains Mono", monospace; font-weight:700; }}
.cap {{ position:absolute; left:0; right:0; text-align:center; font-size:40px; color:var(--slate); white-space:nowrap; }}
.tag {{ position:absolute; font-family:"JetBrains Mono", monospace; font-weight:700; font-size:26px; padding:6px 20px; border:3px solid var(--navy); border-radius:30px; background:var(--amber); box-shadow:4px 4px 0 var(--navy); }}
.drawer {{ display:inline-flex; align-items:center; gap:12px; background:var(--amber); border:4px solid var(--navy); border-radius:20px; padding:8px 18px 8px 10px; box-shadow:5px 5px 0 var(--navy); }}
.drawer b {{ display:inline-block; width:50px; height:50px; line-height:46px; text-align:center; background:#fff; border:3px solid var(--navy); border-radius:12px; font-size:30px; font-weight:800; }}
.drawer i {{ font-style:normal; font-weight:800; font-size:34px; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="{TOTAL}">
  <div id="glow"></div>
  <div id="dots"></div>

  <!-- 1: the question -->
  <section {sc_tag(1)}>
    <div class="scene" id="s1">
      <div id="hook" style="position:absolute; left:140px; right:140px; top:0; bottom:0; display:flex; align-items:center; justify-content:center; text-align:center; font-weight:800; font-size:128px; line-height:1.1; letter-spacing:-2px;"><div>{s1_text}</div></div>
    </div>
  </section>

  <!-- 2: home -->
  <section {sc_tag(2)}>
    <div class="scene" id="s2">
      <div class="pill" id="s2-pill" style="left:80px; top:64px;">901 things</div>
      <div class="btn" id="s2-btn" style="right:80px; top:60px;">Settings {GEAR}</div>
      <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:44px;">
        <div id="s2-mark" class="wordmark">Stuff Finder<span class="dot" id="s2-dot"></span><div class="tape" data-layout-allow-overflow id="s2-tape" style="top:-46px; left:440px; transform:rotate(-4deg);"></div></div>
        <div class="bar" id="s2-bar">{MAG}<div class="txt" style="position:relative;"><span class="ph" id="s2-ph">label maker, AAA batteries...</span>{q_html}</div>{MIC}</div>
      </div>
      {CURSOR.format(id="cursor")}
    </div>
  </section>

  <!-- 3: results, real masonry -->
  <section {sc_tag(3)}>
    <div class="scene" id="s3">
      <img src="assets/img/results-bg.jpg" style="position:absolute; left:0; top:0; width:1920px; height:1080px;" alt="" />
      {card_html}
      <img src="assets/img/dock.png" style="position:absolute; left:1400px; top:960px; width:520px; height:120px; z-index:3;" alt="" />
      <svg id="s3-ring" width="1920" height="1080" viewBox="0 0 1920 1080" style="position:absolute; left:0; top:0; z-index:5; overflow:visible;"><ellipse id="s3-ring-e" cx="{RING_C[0]:.0f}" cy="{RING_C[1]:.0f}" rx="232" ry="205" transform="rotate(-6 {RING_C[0]:.0f} {RING_C[1]:.0f})" fill="none" stroke="#e04a2b" stroke-width="9" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg>
      <div id="s3-found" class="tag" style="left:430px; top:50px; font-size:38px; background:var(--mint); padding:8px 28px; z-index:6;">Found it !</div>
    </div>
  </section>

  <!-- 5: how does it work -->
  <section {sc_tag(5)}>
    <div class="scene" id="s5">
      <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;">
        <div id="s5-text" class="wordmark" style="font-size:170px;">How does it work ?<div class="tape" data-layout-allow-overflow id="s5-tape" style="top:-48px; left:60px; transform:rotate(-4deg);"></div></div>
      </div>
    </div>
  </section>

  <!-- 6: step 1 -->
  <section {sc_tag(6)}>
    <div class="scene" id="s6">
      {title("s6-title", 'Step 1 : Add the item', 70, 96)}
      {win("s6-win", WX, WY, 1280, 720, '<img id="s6-det" src="assets/img/details.jpg" style="position:absolute; left:0; top:0; width:1280px; height:720px;" alt="" />')}
      {CURSOR.format(id="cursor6")}
    </div>
  </section>
  <div id="s6-vidwrap" style="position:absolute; left:{CX0}px; top:{CY0}px; width:1280px; height:720px; overflow:hidden; opacity:0; z-index:4;">
    <video id="form-vid" src="assets/video/form.mp4" data-start="{VS}" data-duration="{VDUR}" data-track-index="2" muted playsinline style="position:absolute; left:{OX6:.0f}px; top:{OY6:.0f}px; width:{1920*K6:.0f}px; height:{1080*K6:.0f}px; display:block;"></video>
  </div>

  <!-- 7: step 2 -->
  <section {sc_tag(7)}>
    <div class="scene" id="s7">
      {title("s7-title", 'Step 2 <span style="color:var(--slate); font-weight:400;">(optional)</span> : Print the sticky label', 76, 78)}
      {win("s7-win", P["wx"], P["wy"], 1060, 596, f'<img src="assets/img/print.jpg" style="position:absolute; left:{OX7:.0f}px; top:{OY7:.0f}px; width:{1920*K7:.0f}px; height:{1080*K7:.0f}px;" alt="" />')}
      <div id="s7-ring" style="position:absolute; left:{lab7[0]-8:.0f}px; top:{lab7[1]-8:.0f}px; width:{lab7[2]+16:.0f}px; height:{lab7[3]+16:.0f}px; box-sizing:border-box; border:5px solid var(--red); border-radius:12px;"></div>
      {CURSOR.format(id="cursor7")}
      <div id="prn" style="position:absolute; left:1210px; top:290px; width:640px; height:640px;">
        <div id="prn-clip" style="position:absolute; left:90px; top:258px; width:480px; height:360px; overflow:hidden; z-index:1;">
          <div id="prn-label" style="position:absolute; left:20px; top:-210px;">{label(440, 190, 110, "prn-lab")}</div>
        </div>
        <div id="prn-body" style="position:absolute; left:20px; top:0; width:600px; height:270px; box-sizing:border-box; background:var(--pink); border:5px solid var(--navy); border-radius:40px; box-shadow:10px 10px 0 var(--navy); z-index:2;">
          <div style="position:absolute; left:40px; top:36px; width:520px; height:76px; border:4px solid var(--navy); border-radius:16px; background:#fff3f8; display:flex; align-items:center; justify-content:space-between; padding:0 24px; box-sizing:border-box;">
            <div class="mono" style="font-size:30px; position:relative; width:300px; height:36px;"><span id="prn-t1" style="position:absolute; left:0;">READY</span><span id="prn-t2" style="position:absolute; left:0; opacity:0;">PRINTING...</span><span id="prn-t3" style="position:absolute; left:0; opacity:0;">DONE</span></div>
            <i id="prn-led" style="display:block; width:26px; height:26px; border-radius:50%; background:#ffd27a; border:3px solid var(--navy);"></i>
          </div>
          <div class="mono" style="position:absolute; left:42px; top:132px; font-size:22px; color:var(--navy); opacity:0.7;">THERMAL LABEL PRINTER</div>
          <div style="position:absolute; left:100px; top:226px; width:400px; height:18px; background:var(--navy); border-radius:9px;"></div>
        </div>
      </div>
      <div id="s7-item" style="position:absolute; left:300px; top:300px; width:520px; height:500px; box-sizing:border-box; background:#fff; border:4px solid var(--navy); border-radius:28px; box-shadow:10px 10px 0 var(--navy); display:flex; align-items:center; justify-content:center; opacity:0;">
        <img src="assets/img/item.jpg" style="display:block; width:430px; height:403px;" alt="" />
      </div>
      <div id="s7-sticker" style="position:absolute; left:1320px; top:574px; opacity:0;">{label(430, 180, 110, "s7-lab")}</div>
      <div class="cap" id="s7-cap" style="top:940px; color:var(--navy); font-weight:800; font-size:50px;">Then stick the small label on your item.</div>
    </div>
  </section>

  <!-- 8a: any screen -->
  <section {sc_tag(8)}>
    <div class="scene" id="s8">
      {title("s8-title", 'Add it once, find it on any screen', 66, 84)}
      <div class="cap" id="s8-cap" style="top:178px;">Type or speak its name, on desktop, tablet or phone.</div>
      {win("s8-desk", d_left, d_top, D_W, D_H, f'<img src="assets/img/results-full.jpg" style="position:absolute; left:0; top:0; width:{D_W}px; height:{D_H}px;" alt="" />')}
      <div id="s8-tab" style="position:absolute; left:{t_left}px; top:{t_top}px; width:{T_W+28}px; height:{T_H+28}px; box-sizing:border-box; background:#1e2a3b; border-radius:40px; padding:14px; box-shadow:10px 10px 0 rgba(30,42,59,0.35);"><img src="assets/img/tablet-results.jpg" style="display:block; width:{T_W}px; height:{T_H}px; border-radius:26px;" alt="" /></div>
      {phone("s8-ph", p_left, p_top, P_W, P_H, f'<img src="assets/img/phone-results.jpg" style="display:block; width:{P_W}px; height:{P_H}px;" alt="" />')}
      <div class="tag" id="s8-l1" style="left:{d_left+D_W//2-70}px; top:{BOT+30}px; background:var(--sky);">Desktop</div>
      <div class="tag" id="s8-l2" style="left:{t_left+(T_W+28)//2-50}px; top:{BOT+30}px; background:var(--mint);">Tablet</div>
      <div class="tag" id="s8-l3" style="left:{p_left+(P_W+28)//2-44}px; top:{BOT+30}px; background:var(--pink);">Phone</div>
    </div>
  </section>

  <!-- 8b: scan the sticker -->
  <section {sc_tag(9)}>
    <div class="scene" id="s9">
      {title("s9-title", 'Or scan its sticker', 66, 96)}
      <div id="s9-item" style="position:absolute; left:210px; top:270px; width:520px; height:500px; box-sizing:border-box; background:#fff; border:4px solid var(--navy); border-radius:28px; box-shadow:10px 10px 0 var(--navy); display:flex; align-items:center; justify-content:center;">
        <img src="assets/img/item.jpg" style="display:block; width:430px; height:403px;" alt="" />
        <div id="s9-sticker" style="position:absolute; right:-60px; bottom:-40px;">{label(430, 180, 110, "s9-lab")}</div>
      </div>
      <svg id="s9-arrow" width="420" height="200" viewBox="0 0 420 200" style="position:absolute; left:660px; top:470px;"><path id="s9-arrow-p" d="M400 100 C 320 10, 160 10, 40 110" fill="none" stroke="#e04a2b" stroke-width="7" stroke-dasharray="14 12" stroke-linecap="round"/><path d="M40 110 l22 -2 m-22 2 l12 -20" fill="none" stroke="#e04a2b" stroke-width="7" stroke-linecap="round"/></svg>
      {phone("s9-ph", ph_left, ph_top, PS_W, PS_H, f"""
        <div id="s9-cam" style="position:absolute; inset:0; background:radial-gradient(ellipse at 50% 45%, #4a505b 0%, #2a2f38 70%, #1c2027 100%);">
          <div style="position:absolute; left:20px; top:20px; width:50px; height:50px; border-left:6px solid #fff; border-top:6px solid #fff; border-radius:8px 0 0 0;"></div>
          <div style="position:absolute; right:20px; top:20px; width:50px; height:50px; border-right:6px solid #fff; border-top:6px solid #fff; border-radius:0 8px 0 0;"></div>
          <div style="position:absolute; left:20px; bottom:20px; width:50px; height:50px; border-left:6px solid #fff; border-bottom:6px solid #fff; border-radius:0 0 0 8px;"></div>
          <div style="position:absolute; right:20px; bottom:20px; width:50px; height:50px; border-right:6px solid #fff; border-bottom:6px solid #fff; border-radius:0 0 8px 0;"></div>
          <div id="s9-camlab" style="position:absolute; left:16px; top:250px; transform:rotate(-3deg);">{label(290, 140, 84, "s9-camlab-i")}</div>
          <div id="s9-found" style="position:absolute; left:2px; top:238px; width:306px; height:162px; box-sizing:border-box; border:5px solid var(--navy); border-radius:12px; background:rgba(183,229,192,0.45); transform:rotate(-3deg);"></div>
          <div id="s9-line" style="position:absolute; left:0; right:0; top:0; height:7px; background:var(--red); box-shadow:0 0 18px 5px rgba(224,74,43,0.65);"></div>
        </div>
        <img id="s9-pdet" src="assets/img/phone-details.jpg" style="position:absolute; left:0; top:0; width:{PS_W}px; height:{PS_H}px; opacity:0;" alt="" />""")}
      <div class="cap" id="s9-cap" style="top:972px;">Scan the label on any item with your phone: its details pop up.</div>
    </div>
  </section>

  <!-- 9: outro -->
  <section {sc_tag(10)}>
    <div class="scene" id="s10">
      <div id="s10-text" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; font-weight:800; font-size:108px; line-height:1.12; letter-spacing:-2px;">
        <div id="l1">Sorting things is pointless</div>
        <div id="l2">if you can’t <span id="find" style="background:var(--amber); padding:0 14px; border-radius:12px;">find</span> them afterwards.</div>
      </div>
      <div id="s10-logo" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:26px;">
        <div id="s10-mark" class="wordmark" style="font-size:210px;">Stuff Finder<span class="dot" id="s10-dot" style="width:46px; height:46px;"></span><div class="tape" data-layout-allow-overflow id="s10-tape" style="top:-54px; left:500px; transform:rotate(-4deg);"></div></div>
        <div id="s10-url" style="font-family:'JetBrains Mono', monospace; font-weight:700; font-size:40px; color:var(--slate);">stuff-finder.netlify.app</div>
      </div>
    </div>
  </section>

  {music}
  {chr(10).join('  ' + a for a in audio)}
</div>
<script>
const BASS = {bass_js};
const tl = gsap.timeline({{ paused: true }});
const SC = {json.dumps([[i, SC[i][0], SC[i][1]] for i in SCIDS])};
for (let i = 0; i < SC.length; i++) {{
  const id = "#s" + SC[i][0];
  if (i > 0) tl.fromTo(id, {{ opacity: 0 }}, {{ opacity: 1, duration: {XF}, ease: "none" }}, SC[i][1]);
  if (i < SC.length - 1) tl.to(id, {{ opacity: 0, duration: {XF}, ease: "none" }}, SC[i][2]);
}}
const pop = (sel, t, extra) => tl.fromTo(sel, Object.assign({{ y: 40, opacity: 0 }}, extra && extra.from), Object.assign({{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, extra && extra.to), t);

// --- 1: typed hook
document.querySelectorAll(".h1c").forEach((el, i) => tl.set(el, {{ opacity: 1 }}, {H0} + i * {HSTEP}));
tl.fromTo("#hook", {{ scale: 1.04 }}, {{ scale: 1, duration: 3, ease: "power1.out" }}, 0);

// --- 2: home
tl.fromTo("#s2-mark", {{ y: 40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }}, 3.18); // beat-locked: 3.18s
tl.fromTo("#s2-dot", {{ x: -60, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.6, ease: "bounce.out" }}, 3.45);
tl.fromTo("#s2-tape", {{ opacity: 0, y: -30 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }}, 3.4);
tl.fromTo("#s2-pill", {{ y: -40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.6)" }}, 3.3);
tl.fromTo("#s2-btn", {{ y: -40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.6)" }}, 3.4);
tl.fromTo("#s2-bar", {{ y: 50, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, 3.6);
tl.fromTo("#cursor", {{ x: 1450, y: 930, opacity: 0 }}, {{ x: 1040, y: 690, opacity: 1, duration: 0.6, ease: "power2.inOut" }}, 3.5);
tl.to("#cursor", {{ scale: 0.85, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "0 0" }}, {CLICK_T});
tl.to("#s2-ph", {{ opacity: 0, duration: 0.08 }}, {CLICK_T + 0.05});
tl.to("#s2-bar", {{ boxShadow: "7px 7px 0 #e04a2b", duration: 0.15 }}, {CLICK_T});
document.querySelectorAll(".qc").forEach((el, i) => tl.set(el, {{ opacity: 1 }}, {Q0} + i * {QS}));
tl.to("#cursor", {{ opacity: 0, duration: 0.3 }}, 5.3);

// --- 3: real masonry results (8 cards, quick), then circle the found item
{card_tw}
tl.to("#s3-ring-e", {{ strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }}, {RING_T}); // beat-locked: 8.96s
tl.fromTo("#s3-found", {{ scale: 0.4, opacity: 0, rotation: -12 }}, {{ scale: 1, opacity: 1, rotation: -3, duration: 0.45, ease: "back.out(2.2)" }}, {RING_T + 0.4});
tl.to("#rc0", {{ scale: 1.03, duration: 0.2, yoyo: true, repeat: 1 }}, {RING_T + 0.55});

// --- 5: how does it work
tl.fromTo("#s5-text", {{ y: 50, opacity: 0, scale: 0.94 }}, {{ y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.5)" }}, {SC[5][0] + 0.08});
tl.fromTo("#s5-tape", {{ opacity: 0, y: -30 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }}, {SC[5][0] + 0.4});

// --- 6: step 1
pop("#s6-title", {T6 + 0.06});
tl.fromTo("#s6-win", {{ y: 80, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }}, {T6 + 0.16});
tl.fromTo("#s6-vidwrap", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.2 }}, {VS - 0.05});
{cur6}tl.fromTo("#s6-det", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, {DET_T:.2f});
tl.to("#s6-vidwrap", {{ opacity: 0, duration: 0.3 }}, {DET_T:.2f});
tl.to("#s6-win", {{ scale: 1.02, duration: 0.15, yoyo: true, repeat: 1 }}, {DET_T:.2f});

// --- 7: step 2
pop("#s7-title", {S7 + 0.1});
tl.fromTo("#s7-win", {{ y: 80, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }}, {S7 + 0.25});
tl.fromTo("#prn", {{ x: 120, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.55, ease: "power3.out" }}, {S7 + 0.55});
tl.fromTo("#s7-ring", {{ opacity: 0, scale: 1.3 }}, {{ opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }}, {S7 + 0.5:.2f});
tl.fromTo("#cursor7", {{ x: 900, y: 880, opacity: 0 }}, {{ x: {btn7[0]:.0f}, y: {btn7[1]:.0f}, opacity: 1, duration: 0.8, ease: "power2.inOut" }}, {S7 + 0.62:.2f});
tl.to("#cursor7", {{ scale: 0.85, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "0 0" }}, {PRINT_T});
tl.to("#cursor7", {{ opacity: 0, duration: 0.25 }}, {PRINT_T + 0.35});
tl.set("#prn-t1", {{ opacity: 0 }}, {PRINT_T + 0.3});
tl.set("#prn-t2", {{ opacity: 1 }}, {PRINT_T + 0.3});
tl.to("#prn-led", {{ backgroundColor: "#e04a2b", duration: 0.1 }}, {PRINT_T + 0.3});
tl.to("#prn-body", {{ x: 2, duration: 0.05, yoyo: true, repeat: 17, ease: "none" }}, {PRINT_T + 0.35});
tl.fromTo("#prn-label", {{ y: 0 }}, {{ y: 214, duration: 1.8, ease: "steps(14)" }}, {PRINT_T + 0.35});
tl.set("#prn-t2", {{ opacity: 0 }}, {PRINT_T + 2.2});
tl.set("#prn-t3", {{ opacity: 1 }}, {PRINT_T + 2.2});
tl.to("#prn-led", {{ backgroundColor: "#b7e5c0", duration: 0.1 }}, {PRINT_T + 2.2});
tl.to("#prn-label", {{ y: 236, rotation: -3, duration: 0.3, ease: "back.out(2)" }}, {PRINT_T + 2.2});
// label leaves the printer and sticks on the item
tl.to("#s7-win", {{ opacity: 0, x: -120, duration: 0.4, ease: "power2.in" }}, {STICK_T - 0.45});
tl.fromTo("#s7-item", {{ y: 60, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, {STICK_T - 0.4});
tl.set("#prn-label", {{ opacity: 0 }}, {STICK_T});
tl.set("#s7-sticker", {{ opacity: 1, rotation: -3 }}, {STICK_T});
tl.to("#s7-sticker", {{ x: -870, y: 86, rotation: -5, scale: 1.0, duration: 0.55, ease: "power3.inOut" }}, {STICK_T});
tl.to("#s7-sticker", {{ scale: 1.1, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }}, {STICK_T + 0.55});
pop("#s7-cap", {STICK_T + 0.6});
tl.to("#s7-ring", {{ opacity: 0, duration: 0.3 }}, {PRINT_T + 0.2});

// --- 8a: any screen
pop("#s8-title", {S8A + 0.05});
pop("#s8-cap", {S8A + 0.25});
tl.fromTo("#s8-desk", {{ y: 80, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.3)" }}, {S8A + 0.45});
tl.fromTo("#s8-tab", {{ y: 80, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.3)" }}, {S8A + 1.0});
tl.fromTo("#s8-ph", {{ y: 80, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.3)" }}, {S8A + 1.5});
tl.fromTo("#s8-l1", {{ opacity: 0, y: 14 }}, {{ opacity: 1, y: 0, duration: 0.3 }}, {S8A + 0.9});
tl.fromTo("#s8-l2", {{ opacity: 0, y: 14 }}, {{ opacity: 1, y: 0, duration: 0.3 }}, {S8A + 1.45});
tl.fromTo("#s8-l3", {{ opacity: 0, y: 14 }}, {{ opacity: 1, y: 0, duration: 0.3 }}, {S8A + 1.95});

// --- 8b: scan the sticker
pop("#s9-title", {S8B + 0.05});
tl.fromTo("#s9-item", {{ y: 70, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }}, {S8B + 0.3});
tl.fromTo("#s9-sticker", {{ scale: 1.8, opacity: 0, rotation: 10 }}, {{ scale: 1, opacity: 1, rotation: -5, duration: 0.4, ease: "back.out(1.6)" }}, {S8B + 0.7});
tl.fromTo("#s9-ph", {{ x: 160, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }}, {S8B + 0.9});
tl.fromTo("#s9-arrow", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.3 }}, {S8B + 1.3});
pop("#s9-cap", {S8B + 1.2});
tl.fromTo("#s9-line", {{ y: 0, opacity: 0 }}, {{ y: 660, opacity: 1, duration: 0.8, ease: "power1.inOut" }}, {BEEP_T - 0.85});
tl.to("#s9-line", {{ opacity: 0, duration: 0.12 }}, {BEEP_T});
tl.fromTo("#s9-found", {{ opacity: 0, scale: 1.12 }}, {{ opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }}, {BEEP_T}); // beat-locked
tl.fromTo("#s9-pdet", {{ y: 70, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, {BEEP_T + 0.55});
tl.to("#s9-arrow", {{ opacity: 0, duration: 0.3 }}, {BEEP_T + 0.4});

// --- 10: outro
tl.fromTo("#l1", {{ y: 50, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, {O + 0.21});
tl.fromTo("#l2", {{ y: 50, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, {O + 0.76});
tl.fromTo("#find", {{ backgroundColor: "rgba(255,210,122,0)" }}, {{ backgroundColor: "rgba(255,210,122,1)", duration: 0.4 }}, {O + 1.56});
tl.to("#s10-text", {{ opacity: 0, y: -40, duration: 0.33, ease: "power2.in" }}, {O + 2.81});
tl.fromTo("#s10-logo", {{ opacity: 0 }}, {{ opacity: 0, duration: 0.01 }}, {O});
tl.set("#s10-logo", {{ opacity: 1 }}, {O + 3.14});
tl.fromTo("#s10-mark", {{ scale: 0.85, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.6)" }}, {O + 3.14});
tl.fromTo("#s10-tape", {{ opacity: 0, y: -30 }}, {{ opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }}, {O + 3.36});
tl.fromTo("#s10-dot", {{ y: -420, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.7, ease: "bounce.out" }}, {O + 3.51});
tl.fromTo("#s10-url", {{ y: 24, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }}, {O + 3.76});

// --- subtle audio-reactive warmth
for (let f = 0; f < BASS.length; f++) {{
  tl.set("#glow", {{ opacity: 0.3 + 0.35 * BASS[f] }}, f / 30);
}}
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
open(OUT, 'w').write(doc)
print('ok', len(doc), 'total', TOTAL, 'create_t', create_t, 'vdur', VDUR)
