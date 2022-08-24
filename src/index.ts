import Fuse from 'fuse.js'
import { emit, fillTemplate, on, pickOne, storage } from 'shuutils'
import './assets/styles.min.css'
import './components'
import './services'
import { patch, post, showError, showLog, valuesToOptions } from './utils'

class App {
  apiUrl = ''
  lastSearchOrigin: SearchOrigin = 'default'
  items: Item[] = []
  fuse!: Fuse<Item>
  commonListsLoaded = false

  constructor () {
    console.log('app start')
    storage.prefix = '@shuunen/stuff-finder_'
    on<AppFormSettingsSaveEvent>('app-form--settings--save', settings => this.onSettingsSave(settings))
    on<AppFormEditItemSaveEvent>('app-form--edit-item--save', item => this.onEditItem(item))
    on('get-barcodes-to-print', () => this.getBarcodesToPrint())
    on<SearchStartEvent>('search-start', event => this.onSearchStart(event))
    on('search-retry', () => this.onSearchRetry())
    this.checkExistingSettings()
    this.showTitle()
    this.handleActions()
  }

  async checkExistingSettings (): Promise<void> {
    const settings = await storage.get<AppSettings>('app-settings')
    if (!settings) return this.settingsActionRequired(true)
    this.onSettingsSave(settings)
    on('app-form--settings--ready', () => emit<AppFormSettingsSetEvent>('app-form--settings--set', settings))
  }

  coolAscii (): string | undefined {
    return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', '\\(-ㅂ-)/', 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
  }

  showTitle (): void {
    emit<AppPrompterTypeEvent>('app-prompter--type', ['Stuff Finder', 1000, `Stuff Finder\n${this.coolAscii()}`])
  }

  async onSettingsSave (settings: AppSettings): Promise<void> {
    this.apiUrl = `https://api.airtable.com/v0/${settings.base}/${settings.table}?api_key=${settings.key}&view=${settings.view}`
    const itemsLoaded = await this.loadItems()
    if (!itemsLoaded) return this.settingsActionRequired(true, 'failed to use api settings')
    this.settingsActionRequired(false)
    emit('app-modal--settings--close')
    if (this.items.length > 0) emit('items-ready')
    storage.set('app-settings', settings)
  }

  settingsActionRequired (actionRequired: boolean, errorMessage = ''): void {
    emit<AppSettingsTriggerAnimateEvent>('app-settings-trigger--animate', actionRequired)
    emit<AppFormSettingsErrorEvent>('app-form--settings--error', errorMessage)
    emit<AppStatusEvent>('app-status', actionRequired ? 'settings-required' : 'ready')
    this.isLoading(false)
  }

  isLoading (active: boolean): void {
    console.log('isLoading active ?', active)
    emit<AppLoaderToggleEvent>('app-loader--toggle', active)
  }

  async loadItems (): Promise<boolean> {
    this.isLoading(true)
    const cachedItems: Item[] = (await storage.get('items')) || []
    let response = await this.fetchApi()
    if (!response || response.error) {
      this.isLoading(false)
      return false
    }
    let records = response.records
    if (records.length === 0) return true
    if (cachedItems.some(item => (item.id === records[0].id && item['updated-on'] === records[0].fields['updated-on']))) {
      this.items = cachedItems
      console.log(`${this.items.length} item(s) cached ` + this.coolAscii())
      await this.initFuse()
      return true
    }
    let offset = response.offset
    while (offset) {
      response = await this.fetchApi(offset)
      offset = response.offset
      records = [...records, ...response.records]
    }
    await this.parseApiRecords(records)
    return true
  }

  async getBarcodesToPrint (): Promise<void> {
    this.isLoading(true)
    const barcodes = this.items.filter(index => index['ref-printed'] === false && index.status === 'acheté')
    emit<BarcodesToPrintEvent>('barcodes-to-print', barcodes)
  }

  async fetchApi (offset?: string): Promise<AirtableResponse> {
    const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
    const url = this.apiUrl + (offset ? `&offset=${offset}` : '') + sortByUpdatedFirst
    if (!url.startsWith('https://api.airtable.com/v0/')) throw new Error('invalid api url')
    return fetch(url).then(response => response.json())
  }

  async parseApiRecords (records: AirtableRecord[]): Promise<void> {
    // this.showLog('parsing api records :', records )
    const boxes: string[] = []
    const locations: string[] = []
    const statuses = ['vendu', 'donné', 'renvoyé', 'défectueux', 'jeté']
    const categories: string[] = []
    const drawers = ['', '1', '2', '3', '4', '5', '6', '7']
    records.forEach(record => {
      const location = (record.fields.location && record.fields.location !== 'N/A') ? record.fields.location : ''
      const box = record.fields.box || ''
      const status = record.fields.status || 'acheté'
      const category = record.fields.category || ''
      if (location.length > 0 && !locations.includes(location)) locations.push(location)
      if (box.length > 0 && !boxes.includes(box)) boxes.push(box)
      if (category.length > 0 && !categories.includes(category)) categories.push(category)
      if (!statuses.includes(status)) statuses.push(status)
    })
    this.saveCommonLists({ boxes, locations, statuses, categories, drawers })
    this.items = records.map(record => ({
      'id': record.id,
      'name': '',
      'category': '',
      'brand': '',
      'details': '',
      'box': '',
      'updated-on': '',
      'drawer': '',
      'location': '',
      'reference': '',
      'barcode': '',
      'ref-printed': false,
      'status': 'acheté',
      ...record.fields,
    }))
    showLog(`${this.items.length} item(s) loaded ` + this.coolAscii())
    return this.initFuse()
  }

  async initFuse (): Promise<void> {
    if (!await this.readCommonLists()) return
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
    storage.set('items', this.items)
  }

  onSearchStart (event: SearchStartEvent): void {
    const input = event.str.trim()
    this.lastSearchOrigin = event.origin
    const result = this.items.find(item => (item.reference === input || item.barcode === input))
    const results = result ? [result] : this.fuse.search(input).map(item => item.item)
    const title = `${results.length === 0 ? 'No result found' : (results.length === 1 ? 'One result found' : `Found ${results.length} results`)} for “${input}”`
    const data: SearchResultEvent = { title, results, byReference: Boolean(result), input, scrollTop: event.scrollTop }
    emit<SearchResultEvent>('search-results', data)
  }

  onSearchRetry (): boolean | void {
    console.log('retry and this.lastSearchOrigin', this.lastSearchOrigin)
    if (this.lastSearchOrigin === 'type') return document.querySelector<HTMLInputElement>('#input-type')?.focus()
    if (this.lastSearchOrigin === 'scan') return emit('app-scan-code--start')
    if (this.lastSearchOrigin === 'speech') return emit('app-speech--start')
    showError('un-handled search retry case')
  }

  airtableRecordToItem (record: AirtableRecord): Item {
    return {
      id: record.id,
      ...record.fields,
    }
  }

  async onEditItem (data: Item): Promise<boolean> {
    this.isLoading(true)
    const response = await this.pushItemRemotely(data)
    console.log('onEditItem response', response)
    this.isLoading(false)
    if (response.error) showError(response.error.message)
    else {
      const item = this.airtableRecordToItem(response)
      await this.pushItemLocally(item)
    }
    if (data.id) return emit('app-modal--edit-item--close')
    emit('app-modal--add-item--close')
    emit('app-modal--search-results--close')
    document.location.search = ''
  }

  async pushItemRemotely (item: Item): Promise<AirtableRecord> {
    const fieldsToUpdate: (keyof Item)[] = ['name', 'brand', 'price', 'photo', 'category', 'details', 'box', 'drawer', 'location', 'reference', 'barcode', 'ref-printed']
    const fields: Partial<Record<keyof Item, unknown>> = {}
    const data = { fields }
    fieldsToUpdate.forEach(field => {
      if (item[field] && field === 'photo') data.fields[field] = [{ url: item[field] }]
      else if (['name', 'brand', 'details', 'reference', 'barcode'].includes(field)) data.fields[field] = item[field]
      else if (item[field] || typeof item[field] === 'boolean') data.fields[field] = item[field]
    })
    if (item.id) {
      const existing = this.items.find(existing => existing.id === item.id)
      if (!existing) throw new Error('existing item not found locally')
      Object.keys(data.fields).forEach((field: keyof Item) => {
        const samePhoto = field === 'photo' && existing.photo && existing.photo[0].url === (data.fields.photo as ItemPhoto[])[0].url
        const sameValue = existing[field] === data.fields[field]
        if (samePhoto || sameValue) delete data.fields[field]
      })
    }
    if (Object.keys(data.fields).length === 0) throw new Error('nothing to post or patch... ?')
    if (!item.id) return post(this.apiUrl, data)
    const url = this.apiUrl.replace('?', `/${item.id}?`)
    return patch(url, data)
  }

  async pushItemLocally (itemTouched: Item): Promise<void> {
    console.log('pushing item locally', itemTouched)
    const index = this.items.findIndex(item => item.id === itemTouched.id)
    if (index >= 0) this.items[index] = itemTouched // update existing item
    else if (itemTouched.id) this.items.push(itemTouched) // new item with id
    else showError('cannot add item without id')
    this.initFuse()
  }

  handleActions (): void {
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement)) return
      const { target } = event
      if (!target || !target.dataset) return
      let { action, payload } = target.dataset
      if (!action) return
      action = action.trim()
      console.log('action clicked :', action)
      if (payload && payload[0] === '{') payload = JSON.parse(payload)
      if (payload) console.log('payload :', payload)
      event.stopPropagation()
      emit(action, payload ?? target)
    })
  }

  saveCommonLists (lists: CommonLists): void {
    console.log('saving common lists :', lists)
    Object.keys(lists).forEach((name: keyof CommonLists) => {
      lists[name] = ['', 'N/A', ...lists[name].sort(Intl.Collator().compare)]
    })
    storage.set('lists', lists)
  }

  async readCommonLists (): Promise<boolean> {
    if (this.commonListsLoaded) return true
    const lists = await storage.get<CommonLists>('lists')
    if (!lists) {
      console.error('no lists found, clearing cached items to fetch fresh data and set lists')
      await storage.clear('items')
      this.items = []
      showError('please restart the app to set lists')
      return false
    }
    console.log('common lists found', lists)
    const template = document.querySelector('template#edit-item')
    if (!template) throw new Error('no edit-item template found')
    const data: Record<keyof CommonLists, string> = {
      boxes: valuesToOptions(lists.boxes),
      locations: valuesToOptions(lists.locations),
      statuses: valuesToOptions(lists.statuses),
      drawers: valuesToOptions(lists.drawers),
      categories: valuesToOptions(lists.categories),
    }
    template.innerHTML = fillTemplate(template.innerHTML, data)
    this.commonListsLoaded = true
    return true
  }
}

new App()
