import fs from 'node:fs'
import { open, SP } from './cap-common.mjs'
{
  const { browser, page } = await open({ width: 1920, height: 1080 })
  await page.goto('http://localhost:4200/item/details/bt-168d')
  await page.waitForTimeout(3000)
  const badge = page.locator('[data-testid="app-pill-visual"]')
  const bb = await badge.boundingBox()
  const pad = 30
  const clip = { x: bb.x - pad, y: bb.y - pad, width: bb.width + 2 * pad, height: bb.height + 2 * pad }
  await badge.evaluate(e => { e.style.visibility = 'hidden' })
  await page.screenshot({ path: SP + 'shots/details-nobadge.png' })
  await page.addStyleTag({ content: 'html,body{background:transparent!important}' })
  await page.addStyleTag({ content: 'body *{visibility:hidden}' })
  await badge.evaluate(e => { e.style.visibility = 'visible'; e.querySelectorAll('*').forEach(c => { c.style.visibility = 'visible' }) })
  await page.screenshot({ path: SP + 'shots/badge.png', clip, omitBackground: true })
  fs.writeFileSync(SP + 'shots/badge.json', JSON.stringify(clip))
  console.log('badge', JSON.stringify(clip))
  await browser.close()
}
{
  const { browser, page } = await open({ width: 820, height: 1180 }, { dsf: 1.5 })
  await page.goto('http://localhost:4200/search/battery')
  await page.waitForTimeout(3500)
  await page.screenshot({ path: SP + 'shots/tablet-results.png' })
  await browser.close()
}
{
  const { browser, page } = await open({ width: 390, height: 844 }, { dsf: 2, isMobile: true, hasTouch: true })
  for (const [n, u] of [['phone-results', '/search/battery'], ['phone-details', '/item/details/bt-168d'], ['phone-home', '/']]) {
    await page.goto('http://localhost:4200' + u)
    await page.waitForTimeout(3500)
    await page.screenshot({ path: SP + `shots/${n}.png` })
  }
  await browser.close()
}
