import Fuse from 'fuse.js'
import { copy, emit, fillTemplate, on, pickOne, sanitize, storage } from 'shuutils'
import './assets/styles.min.css'
import './components'
import { EMPTY_APP_SETTINGS, EMPTY_COMMON_LISTS, EMPTY_ITEM } from './constants'
import './services'
import type { AirtableRecord, AirtableResponse, AppActionEvent, AppClearCacheEvent, AppClearCredentialsEvent, AppFormEditItemSaveEvent, AppFormSettingsErrorEvent, AppFormSettingsReadyEvent, AppFormSettingsSaveEvent, AppFormSettingsSetEvent, AppLoaderToggleEvent, AppModalAddItemCloseEvent, AppModalEditItemCloseEvent, AppModalSearchResultsCloseEvent, AppModalSettingsCloseEvent, AppPrompterTypeEvent, AppScanCodeStartEvent, AppSettings, AppSettingsTriggerAnimateEvent, AppSpeechStartEvent, AppStatusEvent, AppToasterShowEvent, CommonLists, FormEditFormData, Item, ItemPhoto, ItemsReadyEvent, SearchOrigin, SearchResultsEvent, SearchRetryEvent, SearchStartEvent } from './types'
import { ItemField, ItemStatus } from './types'
import { find, logger, patch, post, valuesToOptions } from './utils'

class App {

  private apiUrl = ''

  private lastSearchOrigin: SearchOrigin = 'default'

  private items: Item[] = []

  private fuse!: Fuse<Item>

  private commonListsLoaded = false

  public constructor () {
    logger.log('app start')
    storage.prefix = '@shuunen/stuff-finder_'
    on<AppFormSettingsSaveEvent>('app-form--settings--save', this.onSettingsSave.bind(this))
    on<AppFormEditItemSaveEvent>('app-form--edit-item--save', this.onEditItem.bind(this))
    on<SearchStartEvent>('search-start', this.onSearchStart.bind(this))
    on<SearchRetryEvent>('search-retry', this.onSearchRetry.bind(this))
    on<AppClearCacheEvent>('app-clear-cache', this.onClearCache.bind(this))
    on<AppClearCredentialsEvent>('app-clear-credentials', this.onClearCredentials.bind(this))
    this.checkExistingSettings()
    this.showTitle()
    this.handleActions()
  }

  private onClearCredentials (): void {
    logger.log('clearing credentials...')
    storage.clear('app-settings')
  }

  private onClearCache (): void {
    logger.log('clearing cached items...')
    storage.clear('items')
    document.location.reload()
  }

  private checkExistingSettings (): void {
    const settings = storage.get<AppSettings>('app-settings', EMPTY_APP_SETTINGS)
    if (!settings.base) { this.settingsActionRequired(true); return }
    void this.onSettingsSave(settings)
    on<AppFormSettingsReadyEvent>('app-form--settings--ready', () => emit<AppFormSettingsSetEvent>('app-form--settings--set', settings))
  }

  private coolAscii (): string {
    return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', '\\(-ㅂ-)/', 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
  }

  private showTitle (): void {
    emit<AppPrompterTypeEvent>('app-prompter--type', ['Stuff Finder', 300, `Stuff Finder\n${this.coolAscii()}`])
  }

  private async onSettingsSave (settings: AppSettings): Promise<void> {
    this.apiUrl = `https://api.airtable.com/v0/${settings.base}/${settings.table}?api_key=${settings.key}&view=${settings.view}`
    const itemsLoaded = await this.loadItems()
    if (!itemsLoaded) {
      this.settingsActionRequired(true, 'failed to use api settings')
      return
    }
    this.settingsActionRequired(false)
    emit<AppModalSettingsCloseEvent>('app-modal--settings--close')
    if (this.items.length > 0) emit<ItemsReadyEvent>('items-ready')
    storage.set('app-settings', settings)
  }

  private settingsActionRequired (actionRequired: boolean, errorMessage = ''): void {
    emit<AppSettingsTriggerAnimateEvent>('app-settings-trigger--animate', actionRequired)
    emit<AppFormSettingsErrorEvent>('app-form--settings--error', errorMessage)
    emit<AppStatusEvent>('app-status', actionRequired ? 'settings-required' : 'ready')
    this.isLoading(false)
  }

  private isLoading (active: boolean): void {
    logger.log('isLoading active ?', active)
    emit<AppLoaderToggleEvent>('app-loader--toggle', active)
  }

  private async loadItems (): Promise<boolean> {
    this.isLoading(true)
    const cachedItems = storage.get<Item[]>('items', [])
    if (cachedItems.length === 0) logger.showLog('no cached items found')
    let response = await this.fetchApi()
    if (response.error) {
      this.isLoading(false)
      logger.showError(`airtable fetch failed with error : ${response.error.message}`)
      return false
    }
    let records = response.records
    if (!records[0] || records.length === 0) {
      this.isLoading(false)
      logger.showError('airtable fetch returned no records')
      return false
    }
    const remote = this.airtableRecordToItem(records[0])
    if (cachedItems.some(item => item.id === remote.id && item[ItemField.updatedOn] === remote[ItemField.updatedOn])) {
      this.items = cachedItems
      logger.showLog('no updates from Airtable, cache seems up to date')
      this.initFuse()
      return true
    }
    let offset = response.offset
    while ((offset?.length ?? 0) > 0) {
      response = await this.fetchApi(offset)
      offset = response.offset
      records = [...records, ...response.records]
    }
    this.parseApiRecords(records)
    return true
  }

  private async fetchApi (offset?: string): Promise<AirtableResponse> {
    const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
    const url = this.apiUrl + (offset !== undefined ? `&offset=${offset}` : '') + sortByUpdatedFirst
    if (!url.startsWith('https://api.airtable.com/v0/')) throw new Error('invalid api url')
    return fetch(url).then(async response => response.json()) as Promise<AirtableResponse>
  }

  private parseApiRecords (records: AirtableRecord[]): void {
    // this.showLog('parsing api records :', records )
    const boxes: string[] = []
    const locations: string[] = []
    const statuses = [ItemStatus.acheté, ItemStatus.vendu, ItemStatus.donné, ItemStatus.renvoyé, ItemStatus.défectueux, ItemStatus.jeté]
    const categories: string[] = []
    const drawers = ['', '1', '2', '3', '4', '5', '6', '7']
    records.forEach(record => {
      const location = record.fields.location ?? ''
      if (location.length > 0 && !locations.includes(location)) locations.push(location)
      const box = record.fields.box ?? ''
      if (box.length > 0 && !boxes.includes(box)) boxes.push(box)
      const status = record.fields.status ?? ItemStatus.acheté
      if (!statuses.includes(status)) statuses.push(status)
      const category = record.fields.category ?? ''
      if (category.length > 0 && !categories.includes(category)) categories.push(category)
    })
    this.saveCommonLists({ boxes, locations, statuses, categories, drawers })
    this.items = records.map(record => this.airtableRecordToItem(record))
    logger.showLog(`${this.items.length} item(s) loaded ` + this.coolAscii())
    this.initFuse()
  }

  private initFuse (): void {
    if (!this.readCommonLists()) return
    // https://fusejs.io/
    const options: Fuse.IFuseOptions<Item> = {
      distance: 200, // see the tip at https://fusejs.io/concepts/scoring-theory.html#scoring-theory
      threshold: 0.35, // 0 is perfect match
      ignoreLocation: true,
      getFn: (object: Item, path: string[] | string) => {
        const value = Fuse.config.getFn(object, path)
        if (Array.isArray(value)) return value.map((element: string) => sanitize(element))
        if (typeof value === 'string') return sanitize(value)
        return value
      },
      keys: [{
        name: ItemField.name,
        weight: 4,
      }, {
        name: ItemField.brand,
        weight: 2,
      }, {
        name: ItemField.details,
        weight: 4,
      }, {
        name: ItemField.category,
        weight: 1,
      }], // this is not generic ^^"
    }
    this.fuse = new Fuse(this.items, options)
    storage.set('items', this.items)
  }

  private onSearchStart (event: SearchStartEvent): void {
    const input = event.str.trim()
    this.lastSearchOrigin = event.origin
    const result = this.items.find(item => item.reference === input || item.barcode === input)
    const results = result ? [result] : this.fuse.search(sanitize(input)).map(item => item.item)
    let title = 'No results found'
    if (results.length > 0) title = results.length === 1 ? 'One result found' : `${results.length} results found`
    title += ` for “${input}”`
    const data: SearchResultsEvent = { title, results, byReference: Boolean(result), input, scrollTop: Boolean(event.scrollTop) }
    emit<SearchResultsEvent>('search-results', data)
  }

  private onSearchRetry (): boolean {
    logger.log('retry and this.lastSearchOrigin', this.lastSearchOrigin)
    if (this.lastSearchOrigin === 'type') {
      find.one<HTMLInputElement>('#input-type').focus()
      return true
    }
    if (this.lastSearchOrigin === 'scan') return emit<AppScanCodeStartEvent>('app-scan-code--start')
    if (this.lastSearchOrigin === 'speech') return emit<AppSpeechStartEvent>('app-speech--start')
    logger.showError('un-handled search retry case')
    return false
  }

  private airtableRecordToItem (record: AirtableRecord): Item {
    return {
      ...EMPTY_ITEM,
      ...record.fields,
      id: record.id,
    }
  }

  private async onEditItem (data: FormEditFormData): Promise<boolean> {
    const fields = this.getItemFieldsToPush(data)
    if (Object.keys(fields).length === 0) { logger.showLog('no changes to push'); return false }
    this.isLoading(true)
    const response = await this.pushItemRemotely(fields, data.id)
    logger.log('onEditItem response', response)
    this.isLoading(false)
    if (response.error) { logger.showError(response.error.message); return false }
    const item = this.airtableRecordToItem(response)
    this.pushItemLocally(item)
    emit<AppModalEditItemCloseEvent>('app-modal--edit-item--close')
    emit<AppModalAddItemCloseEvent>('app-modal--add-item--close')
    emit<AppModalSearchResultsCloseEvent>('app-modal--search-results--close')
    document.location.search = ''
    return true
  }

  private getItemFieldsToPush (data: FormEditFormData): AirtableRecord['fields'] {
    const fields: AirtableRecord['fields'] = {}
    if (data.barcode.length > 0) fields.barcode = data.barcode
    if (data.box.length > 0) fields.box = data.box
    if (data.brand.length > 0) fields.brand = data.brand
    if (data.category.length > 0) fields.category = data.category
    if (data.details.length > 0) fields.details = data.details
    if (data.drawer.length > 0) fields.drawer = data.drawer
    if (data.location.length > 0) fields.location = data.location
    if (data.name.length > 0) fields.name = data.name
    if (data.photo) fields.photo = [{ url: data.photo } as ItemPhoto] // we don't need the whole object
    if (data.price !== undefined) fields.price = data.price
    if (data.reference.length > 0) fields.reference = data.reference
    if (data.status.length > 0) fields.status = data.status
    fields['ref-printed'] = data['ref-printed']
    logger.log('fields before clean', copy(fields))
    if (data.id) {
      const existing = this.items.find(existingItem => existingItem.id === data.id)
      if (!existing) throw new Error('existing item not found locally')
      const dataFields = Object.keys(fields) as ItemField[]
      dataFields.forEach((field) => {
        if (field === ItemField.id) return
        const samePhoto = (field === ItemField.photo && existing.photo && existing.photo[0]?.url === fields.photo?.[0]?.url) ?? false
        const sameValue = existing[field] === fields[field]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (samePhoto || sameValue) delete fields[field]
      })
      logger.log('fields after clean', copy(fields))
    }
    return fields
  }

  private async pushItemRemotely (fields: AirtableRecord['fields'], id: Item['id']): Promise<AirtableRecord> {
    const data = { fields }
    if (id === '') return post(this.apiUrl, data)
    const url = this.apiUrl.replace('?', `/${id}?`)
    return patch(url, data)
  }

  private pushItemLocally (itemTouched: Item): void {
    logger.log('pushing item locally', itemTouched)
    const index = this.items.findIndex(item => item.id === itemTouched.id)
    if (index >= 0) this.items[index] = itemTouched // update existing item
    else if (itemTouched.id) this.items.push(itemTouched) // new item with id
    else logger.showError('cannot add item without id')
    this.initFuse()
  }

  private handleActions (): void {
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement)) return
      const { target } = event
      let action = target.dataset['action']
      let payload = target.dataset['payload'] as object | string | undefined
      if (action === undefined) return
      action = action.trim()
      logger.log('action clicked :', action)
      if (typeof payload === 'string' && payload.startsWith('{')) payload = JSON.parse(payload) as object
      if (payload !== undefined) logger.log('payload :', payload)
      event.stopPropagation()
      emit<AppActionEvent>(action, payload ?? target)
    })
  }

  private saveCommonLists (lists: CommonLists): void {
    logger.log('saving common lists :', lists)
    const names = Object.keys(lists) as (keyof CommonLists)[]
    names.forEach((name) => {
      lists[name] = ['', ...lists[name].sort((a, b) => Intl.Collator().compare(a, b))]
    })
    storage.set('lists', lists)
  }

  private readCommonLists (): boolean {
    if (this.commonListsLoaded) return true
    const lists = storage.get<CommonLists>('lists', EMPTY_COMMON_LISTS)
    logger.log('common lists found', lists)
    const template = find.one('template#edit-item')
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
