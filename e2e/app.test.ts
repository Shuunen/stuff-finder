import { expect, type Page, test } from '@playwright/test'

async function stubPrint(page: Page) {
  await page.addInitScript(() => {
    globalThis.print = () => undefined
  })
}

async function clickSpeedDialAction(page: Page, name: string) {
  await page.evaluate(actionName => {
    const el = document.querySelector(`[data-testid="speed-dial-action-${actionName}"]`)
    if (el instanceof HTMLElement) el.click()
  }, name)
}

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
          tx.addEventListener('complete', () => {
            db.close()
            resolve()
          })
          tx.addEventListener('error', () => {
            db.close()
            reject(new Error('IDB transaction failed'))
          })
        })
        request.addEventListener('error', () => reject(new Error('IDB open failed')))
      }),
    dbItems,
  )
}

test.beforeEach(async ({ page }) => {
  await page.route('https://cloud.appwrite.io/**', route => route.abort())
  // waitUntil:'commit' establishes the app origin without letting React initialize and read stale IDB data
  await page.goto('/', { waitUntil: 'commit' })
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('stuff-finder')
        request.addEventListener('success', () => resolve())
        request.addEventListener('error', () => reject(new Error('IDB delete failed')))
      }),
  )
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
  await expect(page.locator('[data-page="item-edit"] input[id="name"]')).toHaveValue('MacBook Pro')
})

test('navigating to a nonexistent item id shows not-found message', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/nonexistent-id')
  await expect(page.locator('[data-testid="item-not-found"]')).toBeVisible()
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

test('scan page renders', async ({ page }) => {
  await page.goto('/scan')
  await expect(page.locator('[data-page="scan"]')).toBeVisible()
})

test('print page renders for an existing item', async ({ page }) => {
  await stubPrint(page)
  await seedDatabase(page)
  await page.goto('/item/print/item-001')
  await expect(page.locator('[data-page="item-print"]')).toBeVisible()
  await expect(page.locator('[data-page="item-print"]')).toContainText('MacBook Pro')
})

test('print page size toggle buttons are visible', async ({ page }) => {
  await stubPrint(page)
  await seedDatabase(page)
  await page.goto('/item/print/item-001')
  await expect(page.locator('[data-page="item-print"] [aria-label="Size"]')).toBeVisible()
})

test('print page highlight switch is visible', async ({ page }) => {
  await stubPrint(page)
  await seedDatabase(page)
  await page.goto('/item/print/item-001')
  await expect(page.locator('[data-testid="highlight-switch"]')).toBeVisible()
})

test('print label button on item details navigates to print page', async ({ page }) => {
  await stubPrint(page)
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await page.locator('[data-testid="app-button-print-label"]').click()
  await expect(page).toHaveURL(/\/item\/print\/item-001/u)
  await expect(page.locator('[data-page="item-print"]')).toBeVisible()
})

test('item details shows price pill for items with a price', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await expect(page.locator('[data-testid="app-pill-price"]')).toContainText('1500')
})

test('item details shows barcode pill for items with a barcode', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await expect(page.locator('[data-testid="app-pill-barcode"]')).toContainText('1234567890')
})

test('item details shows reference pill for items with a reference', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await expect(page.locator('[data-testid="app-pill-reference"]')).toContainText('MBP-M3-2023')
})

test('item details shows print status pill', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await expect(page.locator('[data-testid="app-pill-print-status"]')).toContainText('not printed')
})

test('item details shows printed status for already-printed items', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-002')
  await expect(page.locator('[data-testid="app-pill-print-status"]')).toContainText('printed')
})

test('more button opens action menu with edit, clone, and delete options', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await page.locator('[data-testid="app-button-more"]').click()
  await expect(page.locator('[data-testid="menu-item-edit"]')).toBeVisible()
  await expect(page.locator('[data-testid="menu-item-clone"]')).toBeVisible()
  await expect(page.locator('[data-testid="menu-item-delete"]')).toBeVisible()
})

test('more menu edit option navigates to item edit page', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await page.locator('[data-testid="app-button-more"]').click()
  await page.locator('[data-testid="menu-item-edit"]').click()
  await expect(page).toHaveURL(/\/item\/edit\/item-001/u)
  await expect(page.locator('[data-page="item-edit"]')).toBeVisible()
})

test('more menu delete option shows confirmation dialog', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await page.locator('[data-testid="app-button-more"]').click()
  await page.locator('[data-testid="menu-item-delete"]').click()
  await expect(page.locator('[role="dialog"]')).toBeVisible()
  await expect(page.locator('[role="dialog"]')).toContainText('Delete item')
})

test('confirm button in delete dialog deletes the item and navigates away', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await page.route('https://cloud.appwrite.io/**', route => (route.request().method() === 'DELETE' ? route.fulfill({ body: '', status: 204 }) : route.abort()))
  await page.locator('[data-testid="app-button-more"]').click()
  await page.locator('[data-testid="menu-item-delete"]').click()
  await page.locator('[data-testid="app-button-delete"]').click()
  await expect(page.locator('[data-page="item-details"]')).not.toBeVisible()
})

test('cancel button in delete dialog closes the dialog', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await page.locator('[data-testid="app-button-more"]').click()
  await page.locator('[data-testid="menu-item-delete"]').click()
  await expect(page.locator('[role="dialog"]')).toBeVisible()
  await page.locator('[data-testid="app-button-cancel"]').click()
  await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  await expect(page.locator('[data-page="item-details"]')).toBeVisible()
})

test('quick-search with multiple matches navigates to the search page', async ({ page }) => {
  await seedDatabase(page, [
    { ...SAMPLE_ITEMS[0], $id: 'item-001', name: 'Blue Widget' },
    { ...SAMPLE_ITEMS[1], $id: 'item-002', name: 'Blue Gadget' },
    { ...SAMPLE_ITEMS[2], $id: 'item-003', name: 'Red Thing' },
  ])
  await page.goto('/')
  const searchInput = page.locator('[data-testid="home"] [data-testid="app-pill-quick-search"] input')
  await searchInput.fill('Blue')
  await searchInput.press('Enter')
  await expect(page).toHaveURL(/\/search\/Blue/u)
  await expect(page.locator('[data-page="search"]')).toBeVisible()
})

test('clicking a search result navigates to item details', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/search/Apple')
  await expect(page.locator('[data-page="search"]')).toBeVisible()
  await page.locator('[data-component="item-list"] a').first().click()
  await expect(page.locator('[data-page="item-details"]')).toBeVisible()
})

test('speed dial is visible on non-home pages', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/metrics')
  await expect(page.locator('[data-component="speed-dial"]')).toBeVisible()
})

test('speed dial opens when clicking the actions button', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/metrics')
  await page.locator('[aria-label="Actions"]').click()
  await expect(page.locator('[data-component="speed-dial-backdrop"]')).toBeVisible()
})

test('speed dial navigates to settings when settings action is clicked', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/metrics')
  await page.locator('[aria-label="Actions"]').click()
  // MUI SpeedDial keeps action buttons at CSS scale(0) in the DOM even when open;
  // dispatch the click directly to bypass Playwright's geometry checks
  await clickSpeedDialAction(page, 'settings')
  await expect(page).toHaveURL(/\/settings/u)
  await expect(page.locator('[data-page="settings"]')).toBeVisible()
})

test('speed dial navigates to add item when add action is clicked', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/metrics')
  await page.locator('[aria-label="Actions"]').click()
  // MUI SpeedDial keeps action buttons at CSS scale(0) in the DOM even when open;
  // dispatch the click directly to bypass Playwright's geometry checks
  await clickSpeedDialAction(page, 'add')
  await expect(page).toHaveURL(/\/item\/add/u)
  await expect(page.locator('[data-page="item-add"]')).toBeVisible()
})

test('item add page shows the search term when navigated from a failed search', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/item/add/widget')
  await expect(page.locator('[data-page="item-add"]')).toBeVisible()
  await expect(page.locator('[data-page="item-add"]')).toContainText('widget')
})

test('more menu clone option navigates to item add page and pre-fills the form', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-write', 'clipboard-read'])
  await seedDatabase(page)
  await page.goto('/item/details/item-001')
  await page.locator('[data-testid="app-button-more"]').click()
  await page.locator('[data-testid="menu-item-clone"]').click()
  await expect(page).toHaveURL(/\/item\/add/u)
  await expect(page.locator('[data-page="item-add"]')).toBeVisible()
  await page.locator('[data-page="item-add"] input').first().click()
  await expect(page.locator('[data-page="item-add"] input[id="name"]')).toHaveValue('MacBook Pro')
})

test('speed dial navigates home when home action is clicked', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/metrics')
  await page.locator('[aria-label="Actions"]').click()
  await clickSpeedDialAction(page, 'home')
  await expect(page.locator('[data-testid="home"]')).toBeVisible()
})

test('speed dial navigates to metrics when metrics action is clicked', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/settings')
  await page.locator('[aria-label="Actions"]').click()
  await clickSpeedDialAction(page, 'metrics')
  await expect(page).toHaveURL(/\/metrics/u)
  await expect(page.locator('[data-page="metrics"]')).toBeVisible()
})

test('speed dial navigates to scan when scan action is clicked', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/metrics')
  await page.locator('[aria-label="Actions"]').click()
  await clickSpeedDialAction(page, 'scan')
  await expect(page).toHaveURL(/\/scan/u)
  await expect(page.locator('[data-page="scan"]')).toBeVisible()
})

test('speed dial reload action is present in the DOM when speed dial is open', async ({ page }) => {
  await seedDatabase(page)
  await page.goto('/metrics')
  await page.locator('[aria-label="Actions"]').click()
  await expect(page.locator('[data-testid="speed-dial-action-reload"]')).toBeAttached()
})

test('highlight switch toggles checked state when clicked', async ({ page }) => {
  await stubPrint(page)
  await seedDatabase(page)
  await page.goto('/item/print/item-001')
  const switchInput = page.locator('[data-testid="highlight-switch"] input[type="checkbox"]')
  await expect(switchInput).not.toBeChecked()
  await switchInput.click({ force: true })
  await expect(switchInput).toBeChecked()
})
