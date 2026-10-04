import fs from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
// resolves @playwright/test from the repo root
const require = createRequire(new URL('../../../package.json', import.meta.url))
export const { chromium } = require('@playwright/test')
// local, git-ignored working folder : dump/ (items + photos), shots/, form/
export const SP = fileURLToPath(new URL('../../.local/', import.meta.url))
export const items = JSON.parse(fs.readFileSync(SP + 'dump/items.txt', 'utf8'))
const imgList = JSON.parse(fs.readFileSync(SP + 'dump/imgs.txt', 'utf8'))
const fileMap = {}
for (const i of imgList) { const m = /files\/([^/]+)\//u.exec(i.src); if (m) fileMap[m[1]] = SP + 'dump/imgs/' + i.i + '.bin' }
export async function open(viewport, opts = {}) {
  const browser = await chromium.launch({ channel: 'chromium-headless-shell' })
  const context = await browser.newContext({ viewport, deviceScaleFactor: opts.dsf ?? 1, isMobile: opts.isMobile, hasTouch: opts.hasTouch })
  const page = await context.newPage()
  await page.route('https://cloud.appwrite.io/**', route => {
    const url = route.request().url()
    const m = /files\/([^/]+)\//u.exec(url)
    if (m && fileMap[m[1]]) return route.fulfill({ body: fs.readFileSync(fileMap[m[1]]), contentType: 'image/jpeg', headers: { 'access-control-allow-origin': '*' } })
    return route.abort()
  })
  await page.goto('http://localhost:4200/', { waitUntil: 'commit' })
  await page.evaluate(() => new Promise((res, rej) => { const r = indexedDB.deleteDatabase('stuff-finder'); r.onsuccess = () => res(); r.onerror = () => rej(new Error('del')) }))
  await page.evaluate(itemsToSeed => new Promise((resolve, reject) => {
    const request = indexedDB.open('stuff-finder', 1)
    request.onupgradeneeded = e => { const db = e.target.result; db.createObjectStore('items', { keyPath: '$id' }); db.createObjectStore('meta', { keyPath: 'key' }) }
    request.onsuccess = e => { const db = e.target.result; const tx = db.transaction(['items', 'meta'], 'readwrite'); for (const i of itemsToSeed) tx.objectStore('items').put(i); tx.objectStore('meta').put({ key: 'credentials', value: { bucketId: 'test', collectionId: 'test', databaseId: 'test', wrap: '' } }); tx.objectStore('meta').put({ key: 'itemsTimestamp', value: Date.now() }); tx.oncomplete = () => { db.close(); resolve() }; tx.onerror = () => reject(new Error('tx')) }
  }), opts.exclude ? items.filter(i => !opts.exclude(i)) : items)
  return { browser, context, page }
}
