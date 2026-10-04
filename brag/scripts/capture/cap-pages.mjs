import { open, SP } from './cap-common.mjs'
const { browser, page } = await open({ width: 1920, height: 1080 })
for (const [name, url] of [['add-empty', '/item/add'], ['details', '/item/details/bt-168d'], ['print', '/item/print/bt-168d'], ['home', '/']]) {
  await page.goto('http://localhost:4200' + url)
  await page.waitForTimeout(3000)
  await page.screenshot({ path: SP + `shots/${name}.png` })
}
const t = await page.evaluate(() => 0)
await page.goto('http://localhost:4200/item/add')
await page.waitForTimeout(1500)
console.log(await page.evaluate(() => [...document.querySelectorAll('input,textarea,select,[role=combobox],button')].map(e => `${e.tagName}|${e.name}|${e.id}|${e.getAttribute('data-testid')}|${e.getAttribute('aria-label')}`).join('\n')))
await browser.close()
