import fs from 'node:fs'
import { open, SP } from './common.mjs'
const { browser, page } = await open({ width: 1920, height: 1080 }, { exclude: i => i.reference === 'BT-168D' || i.$id === 'bt-168d' })
fs.rmSync(SP + 'form', { recursive: true, force: true })
fs.mkdirSync(SP + 'form', { recursive: true })
import fs2 from 'node:fs'
await page.route('https://example.com/**', route => route.fulfill({ body: fs2.readFileSync(SP + 'dump/imgs/0.bin'), contentType: 'image/jpeg' }))
await page.goto('http://localhost:4200/item/add')
await page.waitForSelector('#name')
await page.waitForTimeout(2500)
await page.addStyleTag({ content: 'html{cursor:none}' })
const frames = []
const cursor = []
let t = 0
async function snap(dur) {
  await page.evaluate(() => {
    for (const e of document.querySelectorAll('p, span, div')) if (e.children.length === 0 && /is required|already exists/u.test(e.textContent ?? '')) e.style.visibility = 'hidden'
    for (const l of document.querySelectorAll('label')) { l.style.setProperty('color', l.matches('.Mui-focused') ? '#1976d2' : 'rgba(0,0,0,0.6)', 'important') }
    for (const u of document.querySelectorAll('.MuiInput-root')) u.style.setProperty('--x', '1')
  })
  const f = `form/f${String(frames.length).padStart(4, '0')}.png`
  await page.screenshot({ path: SP + f, caret: 'initial' })
  frames.push({ f, dur })
  t += dur
}
async function center(sel) { const b = await page.locator(sel).boundingBox(); return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) } }
async function field(sel, text, step = 0.045, after = 0.28) {
  const c = await center(sel)
  cursor.push({ t: +t.toFixed(2), x: c.x, y: c.y, click: true, len: text.length, step })
  await page.click(sel)
  await snap(0.18)
  for (const ch of text) { await page.keyboard.type(ch); await snap(step) }
  await snap(after)
}
await snap(0.6)
await field('#name', 'Digital Battery Tester')
await field('#reference', 'BT-168D', 0.045, 0.2)
await field('#details', 'Battery Checker BT-168D')
await field('#price', '3', 0.1, 0.2)
{
  const c = await center('#photo')
  cursor.push({ t: +t.toFixed(2), x: c.x, y: c.y, click: true, paste: true })
  await page.click('#photo')
  await snap(0.35)
  await page.fill('#photo', 'https://example.com/battery-tester.jpg')
  await page.waitForTimeout(900)
  await snap(0.9)
}
// box select
for (const [name, opt] of [['box', 'A (apple)'], ['drawer', '1']]) {
  const c = await center(`#${name}`)
  cursor.push({ t: +t.toFixed(2), x: c.x, y: c.y, click: true })
  await page.click(`#${name}`)
  await snap(0.3)
  const o = page.getByRole('option', { name: opt, exact: true }).first()
  const ob = await o.boundingBox()
  console.log(name, opt, ob)
  if (ob) { cursor.push({ t: +t.toFixed(2), x: Math.round(ob.x + ob.width / 2), y: Math.round(ob.y + ob.height / 2), click: true }); await snap(0.25); await o.click(); await snap(0.4) }
}
const create = await center('[data-testid="app-button-submit"]')
cursor.push({ t: +t.toFixed(2), x: create.x, y: create.y, click: true, create: true })
await snap(0.5)
await snap(0.4)
fs.writeFileSync(SP + 'form/frames.json', JSON.stringify({ frames, cursor, total: t }, null, 1))
// concat file
fs.writeFileSync(SP + 'form/list.txt', frames.map(f => `file '${f.f.replace('form/', '')}'\nduration ${f.dur}`).join('\n') + `\nfile '${frames.at(-1).f.replace('form/', '')}'\n`)
console.log('frames', frames.length, 'total', t.toFixed(2), JSON.stringify(cursor))
await browser.close()
