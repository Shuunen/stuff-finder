import { open, SP } from './cap-common.mjs'
const { browser, page } = await open({ width: 1920, height: 1080 })
await page.goto('http://localhost:4200/search/battery')
await page.waitForSelector('[data-testid="app-card-item-card"]')
await page.waitForTimeout(3500)
const sel = '[data-testid="app-pill-quick-search"], button[aria-label="Actions"]'
await page.addStyleTag({ content: '[data-testid="app-card-item-card"]{visibility:hidden!important}' })
const els = page.locator(sel)
console.log(await els.count())
const boxes = []
for (let i = 0; i < await els.count(); i++) boxes.push(await els.nth(i).boundingBox())
console.log(JSON.stringify(boxes))
await page.evaluate(s => document.querySelectorAll(s).forEach(e => { e.style.visibility = 'hidden' }), sel)
await page.screenshot({ path: SP + 'shots/results-bg-nodock.png' })
await page.evaluate(s => document.querySelectorAll(s).forEach(e => { e.style.visibility = 'visible' }), sel)
await page.addStyleTag({ content: 'html,body{background:transparent!important}' })
await page.screenshot({ path: SP + 'shots/dock-all.png', clip: { x: 1400, y: 960, width: 520, height: 120 }, omitBackground: true })
await browser.close()
