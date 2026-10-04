// Screenshots of the real app (seeded with the real items) used by the video :
// results masonry (cards + background + dock), details, print, tablet and phone views.
import fs from 'node:fs'
import { open, SP } from './common.mjs'

const shots = SP + 'shots/'
fs.mkdirSync(shots, { recursive: true })
const base = 'http://localhost:4200'

async function load(page, url) {
  await page.goto(base + url)
  await page.waitForTimeout(3500)
}

// desktop
{
  const { browser, page } = await open({ width: 1920, height: 1080 })
  await load(page, '/item/details/bt-168d')
  await page.screenshot({ path: shots + 'details.png' })
  await load(page, '/item/print/bt-168d')
  await page.screenshot({ path: shots + 'print.png' })

  await load(page, '/search/battery')
  await page.waitForSelector('[data-testid="app-card-item-card"]')
  await page.screenshot({ path: shots + 'results-full.png' })
  // background without the cards and without the dock, the dock is captured apart (transparent) to stay above the cards
  const cards = page.locator('[data-testid="app-card-item-card"]')
  const dockSelector = '[data-testid="app-pill-quick-search"], button[aria-label="Actions"]'
  await page.addStyleTag({ content: '[data-testid="app-card-item-card"]{visibility:hidden!important}' })
  await page.evaluate(selector => document.querySelectorAll(selector).forEach(element => { element.style.visibility = 'hidden' }), dockSelector)
  await page.screenshot({ path: shots + 'results-bg-nodock.png' })
  await page.evaluate(selector => document.querySelectorAll(selector).forEach(element => { element.style.visibility = 'visible' }), dockSelector)
  await page.addStyleTag({ content: 'html,body{background:transparent!important}' })
  await page.screenshot({ path: shots + 'dock-all.png', clip: { x: 1400, y: 960, width: 520, height: 120 }, omitBackground: true })

  // each card alone on a transparent background, taller viewport so the whole masonry is on screen
  const count = await cards.count()
  await page.setViewportSize({ width: 1920, height: 2000 })
  await page.waitForTimeout(800)
  await page.addStyleTag({ content: '[data-testid="speed-dial-action-home"]{display:none}' })
  const boxes = []
  for (let index = 0; index < count; index++) boxes.push(await cards.nth(index).boundingBox())
  const pad = { b: 30, l: 14, r: 24, t: 70 }
  const out = []
  for (let index = 0; index < count; index++) {
    await cards.nth(index).evaluate(element => element.style.setProperty('visibility', 'visible', 'important'))
    await page.waitForTimeout(80)
    const box = boxes[index]
    const clip = { height: box.height + pad.t + pad.b, width: box.width + pad.l + pad.r, x: Math.max(0, box.x - pad.l), y: Math.max(0, box.y - pad.t) }
    await page.screenshot({ clip, omitBackground: true, path: shots + `card-${index}.png` })
    out.push({ i: index, ...clip, bh: box.height, bw: box.width, bx: box.x, by: box.y })
    await cards.nth(index).evaluate(element => element.style.setProperty('visibility', 'hidden', 'important'))
  }
  fs.writeFileSync(shots + 'cards.json', JSON.stringify(out, undefined, 1))
  await browser.close()
}

// tablet
{
  const { browser, page } = await open({ width: 820, height: 1180 }, { dsf: 1.5 })
  await load(page, '/search/battery')
  await page.screenshot({ path: shots + 'tablet-results.png' })
  await browser.close()
}

// phone
{
  const { browser, page } = await open({ width: 390, height: 844 }, { dsf: 2, hasTouch: true, isMobile: true })
  for (const [name, url] of [['phone-results', '/search/battery'], ['phone-details', '/item/details/bt-168d']]) {
    await load(page, url)
    await page.screenshot({ path: shots + `${name}.png` })
  }
  await browser.close()
}
console.log('screens captured in', shots)
