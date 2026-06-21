import { expect, type Page, test } from '@playwright/test'

type Item = {
  $createdAt: string
  $id: string
  barcode: string
  box: string
  brand: string
  details: string
  drawer: number
  isPrinted: boolean
  name: string
  photos: string[]
  price: number
  reference: string
  status: string
}

const SAMPLE_ITEMS: Item[] = [
  {
    $createdAt: '2025-01-01T00:00:00.000Z',
    $id: 'item-001',
    barcode: '1234567890',
    box: 'A (apple)',
    brand: 'Apple',
    details: 'MacBook Pro with M3 chip',
    drawer: 2,
    isPrinted: false,
    name: 'MacBook Pro',
    photos: [],
    price: 1500,
    reference: 'MBP-M3-2023',
    status: 'bought',
  },
  {
    $createdAt: '2025-01-02T00:00:00.000Z',
    $id: 'item-002',
    barcode: '',
    box: 'H (hardware)',
    brand: 'Sony',
    details: 'Noise cancelling headphones',
    drawer: 2,
    isPrinted: true,
    name: 'WH-1000XM4',
    photos: [],
    price: 300,
    reference: 'WH1000XM4',
    status: 'bought',
  },
  {
    $createdAt: '2025-01-03T00:00:00.000Z',
    $id: 'item-003',
    barcode: '',
    box: 'Bureau',
    brand: '',
    details: '',
    drawer: 2,
    isPrinted: false,
    name: 'label maker',
    photos: [],
    price: 0,
    reference: 'LABEL-001',
    status: 'bought',
  },
]

async function seedDatabase(page: Page, dbItems: Item[] = SAMPLE_ITEMS) {
  await page.evaluate(
    itemsToSeed =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('stuff-finder', 1)
        request.addEventListener('upgradeneeded', event => {
          const db = (event.target as IDBOpenDBRequest).result
          if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: '$id' })
          if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' })
        })
        request.addEventListener('success', event => {
          const db = (event.target as IDBOpenDBRequest).result
          const tx = db.transaction(['items', 'meta'], 'readwrite')
          tx.objectStore('items').clear()
          tx.objectStore('meta').clear()
          for (const item of itemsToSeed) tx.objectStore('items').put(item)
          tx.objectStore('meta').put({ key: 'credentials', value: { bucketId: 'test', collectionId: 'test', databaseId: 'test', wrap: '' } })
          tx.objectStore('meta').put({ key: 'itemsTimestamp', value: Date.now() })
          tx.addEventListener('complete', () => resolve())
          tx.addEventListener('error', () => reject(new Error('IDB transaction failed')))
        })
        request.addEventListener('error', () => reject(new Error('IDB open failed')))
      }),
    dbItems,
  )
}

test.beforeEach(async ({ page }) => {
  await page.route('https://cloud.appwrite.io/**', route => route.abort())
  await page.goto('/')
  await page.evaluate(() => indexedDB.deleteDatabase('stuff-finder'))
})

test('page loads without uncaught errors', async ({ page }) => {
  const pageErrors: Error[] = []
  page.on('pageerror', err => pageErrors.push(err))
  await seedDatabase(page)
  await page.goto('/')
  expect(pageErrors).toHaveLength(0)
})

test('page title is correct', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/')
  await expect(page).toHaveTitle(/Stuff Finder/u)
})

test('root element mounts and renders content', async ({ page }) => {
  await expect(page.locator('#app')).toBeAttached()
  await expect(page.locator('#app')).not.toBeEmpty()
})

test('quick-search is disabled when no credentials are set', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-testid="home"] [data-testid="app-pill-quick-search"] input')).toBeDisabled()
})

test('settings page renders credential form', async ({ page }) => {
  await page.goto('/settings')
  await expect(page.locator('[data-page="settings"]')).toBeVisible()
  await expect(page.locator('[data-testid="app-card-page-card"]')).toBeVisible()
})

test('home page shows correct item count', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/')
  await expect(page.locator('[data-testid="home"]')).toBeVisible()
  await expect(page.locator('[data-testid="app-pill-item-count"]')).toContainText('3 things')
})

test('home page shows quick-search input when ready', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/')
  await expect(page.locator('[data-testid="home"] [data-testid="app-pill-quick-search"] input')).toBeVisible()
})

test('settings button navigates to settings page', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/')
  await page.locator('[data-testid="app-button-settings"]').click()
  await expect(page).toHaveURL(/\/settings/u)
  await expect(page.locator('[data-page="settings"]')).toBeVisible()
})

test('quick-search with a single match navigates directly to item details', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/')
  const searchInput = page.locator('[data-testid="home"] [data-testid="app-pill-quick-search"] input')
  await searchInput.fill('label')
  await searchInput.press('Enter')
  await expect(page).toHaveURL(/\/item\/details\/item-003/u)
  await expect(page.locator('[data-page="item-details"]')).toBeVisible()
})

test('search page shows results for a matching term', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/search/macbook')
  await expect(page.locator('[data-page="search"]')).toBeVisible()
  await expect(page.locator('[data-testid="app-pill-search-results"]')).toContainText('results found')
})

test('search page shows empty state when no items match', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/search/zzznomatch999')
  await expect(page.locator('[data-page="search"]')).toBeVisible()
  await expect(page.locator('[data-page="search"]')).toContainText('Nothing found')
})

test('empty search result shows add button that navigates to item add page', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/search/zzznomatch999')
  await page.locator('[data-testid="app-button-next"]').click()
  await expect(page).toHaveURL(/\/item\/add/u)
  await expect(page.locator('[data-page="item-add"]')).toBeVisible()
})

test('item add page renders form', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/add')
  await expect(page.locator('[data-page="item-add"]')).toBeVisible()
})

test('item details page shows item metadata and action buttons', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await expect(page.locator('[data-page="item-details"]')).toBeVisible()
  await expect(page.locator('[data-testid="item-detail-meta"]')).toBeVisible()
  await expect(page.locator('[data-testid="item-detail-actions"]')).toBeVisible()
})

test('edit button on item details navigates to edit form', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await page.locator('[data-testid="app-button-edit"]').click()
  await expect(page).toHaveURL(/\/item\/edit\/item-001/u)
  await expect(page.locator('[data-page="item-edit"]')).toBeVisible()
})

test('item edit form is pre-filled with existing item data', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/edit/item-001')
  await expect(page.locator('[data-page="item-edit"]')).toBeVisible()
  await expect(page.locator('[data-page="item-edit"] input').first()).toHaveValue('MacBook Pro')
})

test('navigating to a nonexistent item id shows not-found message', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/nonexistent-id')
  await expect(page.locator('body')).toContainText('not found')
})

test('metrics page renders', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/metrics')
  await expect(page.locator('[data-page="metrics"]')).toBeVisible()
})

test('kitchen-sink page renders', async ({ page }) => {
  await page.goto('/kitchen-sink')
  await expect(page.locator('[data-page="kitchen-sink"]')).toBeVisible()
})

test('navigating to an unknown route shows the error page', async ({ page }) => {
  await page.goto('/this-page-does-not-exist')
  await expect(page.locator('[data-page="error"]')).toBeVisible()
})
