import fs from 'node:fs'
import { open, SP } from './cap-common.mjs'
const { browser, page } = await open({ width: 1920, height: 1080 })
await page.goto('http://localhost:4200/search/battery')
await page.waitForSelector('[data-testid="app-card-item-card"]')
await page.waitForTimeout(3500)
await page.screenshot({ path: SP + 'shots/results-full.png' })
const cards = page.locator('[data-testid="app-card-item-card"]')
const n = await cards.count()
await page.addStyleTag({ content: '[data-testid="app-card-item-card"]{visibility:hidden!important}' })
await page.waitForTimeout(300)
await page.screenshot({ path: SP + 'shots/results-bg.png' })
await page.setViewportSize({ width: 1920, height: 2000 })
await page.waitForTimeout(800)
await page.addStyleTag({ content: 'html,body{background:transparent!important}[data-testid="speed-dial-action-home"]{display:none}' })
const boxes = []
for (let i = 0; i < n; i++) boxes.push(await cards.nth(i).boundingBox())
console.log(JSON.stringify(boxes.map(b => [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)])))
const out = []
const pad = { l: 14, r: 24, t: 70, b: 30 }
for (let i = 0; i < n; i++) {
  await cards.nth(i).evaluate(e => { e.style.setProperty('visibility', 'visible', 'important') })
  await page.waitForTimeout(80)
  const b = boxes[i]
  const clip = { x: Math.max(0, b.x - pad.l), y: Math.max(0, b.y - pad.t), width: b.width + pad.l + pad.r, height: b.height + pad.t + pad.b }
  await page.screenshot({ path: SP + `shots/card-${i}.png`, clip, omitBackground: true })
  out.push({ i, ...clip, bx: b.x, by: b.y, bw: b.width, bh: b.height })
  await cards.nth(i).evaluate(e => { e.style.setProperty('visibility', 'hidden', 'important') })
}
fs.writeFileSync(SP + 'shots/cards.json', JSON.stringify(out, null, 1))
await browser.close()
