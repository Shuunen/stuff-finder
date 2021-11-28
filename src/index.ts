import Fuse from 'fuse.js'
import { emit, on, pickOne, sleep, storage } from 'shuutils'
import './components'
import { JSON_HEADERS, SEARCH_ORIGIN } from './constants.js'
import './services/index.js'

const key = '@shuunen/stuff-finder_'

class App {
  apiUrl = ''
  lastSearchOrigin = ''
  items: Item[] = []
  fuse!: Fuse<Item>

  constructor () {
    console.log('app start')
    on('app-form--settings--save', settings => this.onSettingsSave(settings))
    on('app-update--item', item => this.onUpdateItem(item))
    on('get-barcodes-to-print', () => this.getBarcodesToPrint())
    on('search-start', data => this.onSearchStart(data))
    on('search-retry', () => this.onSearchRetry())
    on('fade-in', element => this.fadeIn(element))
    on('fade-out', element => this.fadeOut(element))
    on('fade-out-destroy', element => this.fadeOut(element, true))
    this.checkExistingSettings()
    this.showTitle()
    this.handleActions()
  }

  async checkExistingSettings () {
    const settings = await storage.get(key + 'app-settings') as AppSettings
    if (!settings) return this.settingsActionRequired(true)
    this.onSettingsSave(settings)
    on('app-form--settings--ready', () => emit('app-form--settings--set', settings))
  }

  coolAscii () {
    return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', '\\(-ㅂ-)/', 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
  }

  showTitle () {
    emit('app-prompter--type', ['Stuff Finder', 1000, `Stuff Finder\n${this.coolAscii()}`])
  }

  async onSettingsSave (settings: AppSettings) {
    this.apiUrl = `https://api.airtable.com/v0/${settings.base}/${settings.table}?api_key=${settings.key}&view=${settings.view}`
    const itemsLoaded = await this.loadItems()
    if (!itemsLoaded) return this.settingsActionRequired(true, 'failed to use api settings')
    this.settingsActionRequired(false)
    emit('app-modal--settings--close')
    if (this.items.length > 0) emit('items-ready')
    storage.set(key + 'app-settings', settings)
  }

  settingsActionRequired (actionRequired: boolean, errorMessage = '') {
    emit('app-settings-trigger--animate', actionRequired)
    emit('app-form--settings--error', errorMessage)
    emit('app-status', actionRequired ? 'settings-required' : 'ready')
    this.isLoading(false)
  }

  isLoading (active: boolean) {
    console.log('isLoading active ?', active)
    emit('app-loader--toggle', active)
  }

  async loadItems () {
    this.isLoading(true)
    const cachedItems: Item[] = (await storage.get(key + 'items')) || []
    let response = await this.fetchApi()
    if (!response || response.error) {
      this.isLoading(false)
      return false
    }
    let records = response.records
    if (cachedItems.some(item => (item.id === records[0].id && item['updated-on'] === records[0].fields['updated-on']))) {
      this.items = cachedItems
      console.log(`${this.items.length} item(s) cached ` + this.coolAscii())
      this.initFuse()
      return true
    }
    let offset = response.offset
    while (offset) {
      response = await this.fetchApi(offset)
      offset = response.offset
      records = [...records, ...response.records]
    }
    this.parseApiRecords(records)
    return true
  }

  async getBarcodesToPrint () {
    this.isLoading(true)
    const barcodes = this.items.filter(index => index['ref-printed'] === false && index.status === 'acheté')
    emit('barcodes-to-print', barcodes)
  }

  async fetchApi (offset?: string) {
    const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
    const url = this.apiUrl + (offset ? `&offset=${offset}` : '') + sortByUpdatedFirst
    return fetch(url).then(response => response.json())
  }

  parseApiRecords (records: AirtableRecord[]) {
    // this.showLog('parsing api records :', records )
    let boxes: string[] = []
    let locations: string[] = []
    let statuses: string[] = []
    records.forEach(record => {
      const location = (record.fields.location && record.fields.location !== 'N/A') ? record.fields.location : ''
      const box = record.fields.box || ''
      const status = record.fields.status || 'acheté'
      if (location.length > 0 && !locations.includes(location)) locations.push(location)
      if (box.length > 0 && !boxes.includes(box)) boxes.push(box)
      if (!statuses.includes(status)) statuses.push(status)
    })
    locations = ['', 'N/A', ...locations.sort()]
    boxes = ['', ...boxes.sort()]
    statuses = ['', ...statuses.sort()]
    this.items = records.map(record => ({
      'id': record.id,
      'name': '',
      'category': '',
      'brand': '',
      'details': '',
      'box': '',
      'updated-on': '',
      'boxes': boxes,
      'drawer': '',
      'location': '',
      'locations': locations,
      'reference': '',
      'barcode': '',
      'ref-printed': false,
      'status': 'acheté',
      'statuses': statuses,
      ...record.fields,
    }))
    this.showLog(`${this.items.length} item(s) loaded ` + this.coolAscii())
    this.initFuse()
  }

  initFuse () {
    // https://fusejs.io/
    const options = {
      distance: 200, // see the tip at https://fusejs.io/concepts/scoring-theory.html#scoring-theory
      threshold: 0.35, // 0 is perfect match
      keys: [{
        name: 'name',
        weight: 4,
      }, {
        name: 'brand',
        weight: 2,
      }, {
        name: 'details',
        weight: 4,
      }, {
        name: 'category',
        weight: 1,
      }], // this is not generic ^^"
    }
    this.fuse = new Fuse(this.items, options)
    storage.set(key + 'items', this.items)
  }

  onSearchStart ({ str, origin }: { str: string, origin: string }) {
    str = str.trim()
    this.lastSearchOrigin = origin
    const result = this.items.find(item => (item.reference === str || item.barcode === str))
    const results = result ? [result] : this.fuse.search(str).map(item => item.item)
    const title = `Results for “${str}”`
    emit('search-results', { title, results, byReference: Boolean(result) })
  }

  onSearchRetry () {
    console.log('retry and this.lastSearchOrigin', this.lastSearchOrigin)
    if (this.lastSearchOrigin === SEARCH_ORIGIN.type) return document.querySelector<HTMLInputElement>('#input-type')?.focus()
    if (this.lastSearchOrigin === SEARCH_ORIGIN.scan) return emit('app-scan-code--start')
    if (this.lastSearchOrigin === SEARCH_ORIGIN.speech) return emit('app-speech--start')
    this.showError('un-handled search retry case')
  }

  async fadeIn (element: HTMLElement) {
    if (!element.classList.contains('hide')) return console.warn('please add "hide" class before mounting dom element and then call fade-in')
    await sleep(10)
    element.style.opacity = '1'
  }

  async fadeOut (element: HTMLElement, destroy = false) {
    element.classList.add('hide')
    await sleep(350)
    element.classList.remove('hide')
    element.classList.add('hidden')
    if (!destroy) return
    await sleep(350)
    element.remove()
  }

  showLog (message: string, data = '') {
    console.log(message, data)
    emit('app-toaster--show', { type: 'info', message })
  }

  showError (message: string) {
    console.error(message)
    emit('app-toaster--show', { type: 'error', message })
  }

  async onUpdateItem (item: Item) {
    if (!item.id) return this.showError('cannot update an item without his id')
    this.isLoading(true)
    await this.updateItemRemotely(item)
    await this.updateItemLocally(item)
    this.isLoading(false)
  }

  async updateItemRemotely (item: Item) {
    const fieldsToUpdate = ['name', 'brand', 'details', 'box', 'drawer', 'location', 'reference', 'barcode', 'ref-printed'] as (keyof Item)[]
    const data = { fields: {} as Record<keyof Item, unknown> }
    fieldsToUpdate.forEach(field => {
      if (item[field] || typeof item[field] === 'boolean') data.fields[field] = item[field]
    })
    if (Object.keys(data.fields).length === 0) return this.showError('cannot update an item without data')
    const url = this.apiUrl.replace('?', `/${item.id}?`)
    return this.patch(url, data)
  }

  async updateItemLocally (itemToUpdate: Item) {
    const index = this.items.findIndex(item => item.id === itemToUpdate.id)
    if (index < 0) return this.showError('failed to find local item')
    Object.assign(this.items[index], itemToUpdate)
    this.initFuse()
  }

  async patch (url: string, data: Record<string, unknown>) {
    const options = { headers: JSON_HEADERS, method: 'patch', body: JSON.stringify(data) }
    return fetch(url, options).then(response => response.json()).catch(error => this.showError(error.message))
  }

  handleActions () {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (!target || !target.dataset) return
      const { action } = target.dataset
      if (!action) return
      console.log('action clicked :', action)
      event.stopPropagation()
      emit(action, target)
    })
  }
}

new App()
