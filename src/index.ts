/* eslint-disable max-lines */
import Fuse from 'fuse.js'
import { clone, debounce, emit, fillTemplate, on, pickOne, sanitize, storage } from 'shuutils'
import './assets/styles.min.css'
import './components/add-item-trigger'
import './components/edit-item'
import './components/form'
import './components/loader'
import './components/modal'
import './components/print-barcodes'
import './components/print-one'
import './components/prompter'
import './components/scan-code'
import './components/search-button'
import './components/search-results'
import './components/settings-trigger'
import './components/toaster'
import { delays, emptyAppSettings, emptyCommonLists, emptyItem } from './constants'
import './services/item-search.service'
import './services/sound.service'
import './services/speech.service'
import './services/url.service'
import { ItemField, ItemStatus, type AirtableRecord, type AirtableResponse, type AppActionEvent, type AppClearCacheEvent, type AppClearCredentialsEvent, type AppFormEditItemSaveEvent, type AppFormSettingsErrorEvent, type AppFormSettingsReadyEvent, type AppFormSettingsSaveEvent, type AppFormSettingsSetEvent, type AppImgLoadingErrorEvent, type AppLoaderToggleEvent, type AppModalAddItemCloseEvent, type AppModalEditItemCloseEvent, type AppModalSearchResultsCloseEvent, type AppModalSettingsCloseEvent, type AppPrompterTypeEvent, type AppScanCodeStartEvent, type AppSettings, type AppSettingsTriggerAnimateEvent, type AppSpeechStartEvent, type AppStatusEvent, type FormEditFormData, type Item, type ItemPhoto, type ItemsReadyEvent, type SearchOrigin, type SearchResultsEvent, type SearchRetryEvent, type SearchStartEvent } from './types'
import { find, get, patch, post, valuesToOptions } from './utils/browser.utils'
import { logger } from './utils/logger.utils'
import { getObjectOrSelf, sortListsEntries } from './utils/objects.utils'
import './utils/print.utils'

class App {

  private apiUrl = ''

  private lastSearch = ''

  private lastSearchOrigin: SearchOrigin = 'default'

  private items: Item[] = []

  private fuse!: Fuse<Item>

  private hasCommonListsLoaded = false

  private readonly onImgLoadingError = debounce(this.onImgLoadingErrorSync.bind(this), delays.medium)

  public constructor () {
    logger.info('app start')
    storage.prefix = '@shuunen/stuff-finder_'
    this.setListeners()
    this.checkExistingSettings()
    this.showTitle()
  }

  private setListeners () {
    on<AppFormSettingsSaveEvent>('app-form--settings--save', this.onSettingsSave.bind(this))
    on<AppFormEditItemSaveEvent>('app-form--edit-item--save', this.onEditItem.bind(this))
    on<SearchStartEvent>('search-start', this.onSearchStart.bind(this))
    on<SearchRetryEvent>('search-retry', this.onSearchRetry.bind(this))
    on<AppClearCacheEvent>('app-clear-cache', this.onClearCache.bind(this))
    on<AppClearCredentialsEvent>('app-clear-credentials', this.onClearCredentials.bind(this))
    on<AppImgLoadingErrorEvent>('app--img-loading-error', this.onImgLoadingError.bind(this))
    document.addEventListener('click', this.onDocumentClick.bind(this))
  }

  private onClearCredentials () {
    logger.info('clearing credentials...')
    storage.clear('app-settings')
  }

  private onClearCache () {
    logger.info('clearing cached items...')
    storage.clear('items')
    document.location.reload()
  }

  private checkExistingSettings () {
    const settings = storage.get<AppSettings>('app-settings', emptyAppSettings)
    if (!settings.base) { this.settingsActionRequired(true); return }
    void this.onSettingsSave(settings)
    on<AppFormSettingsReadyEvent>('app-form--settings--ready', () => emit<AppFormSettingsSetEvent>('app-form--settings--set', settings))
  }

  private coolAscii () {
    return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', '\\(-ㅂ-)/', 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
  }

  private showTitle () {
    emit<AppPrompterTypeEvent>('app-prompter--type', ['Stuff Finder', delays.large, `Stuff Finder\n${this.coolAscii()}`])
  }

  private settingsActionRequired (isActionRequired: boolean, errorMessage = '') {
    emit<AppSettingsTriggerAnimateEvent>('app-settings-trigger--animate', isActionRequired)
    emit<AppFormSettingsErrorEvent>('app-form--settings--error', errorMessage)
    emit<AppStatusEvent>('app-status', isActionRequired ? 'settings-required' : 'ready')
    this.isLoading(false)
  }

  private isLoading (isActive: boolean) {
    logger.info('isLoading active ?', isActive)
    emit<AppLoaderToggleEvent>('app-loader--toggle', isActive)
  }

  private initFuse () {
    if (!this.readCommonLists()) return
    // https://fusejs.io/
    const options: Fuse.IFuseOptions<Item> = {
      distance: 200, // see the tip at https://fusejs.io/concepts/scoring-theory.html#scoring-theory
      threshold: 0.35, // 0 is perfect match
      ignoreLocation: true, // eslint-disable-line @typescript-eslint/naming-convention
      getFn: (object: Item, path: string[] | string) => {
        const value = Fuse.config.getFn(object, path)
        if (Array.isArray(value)) return value.map((element: string) => sanitize(element))
        if (typeof value === 'string') return sanitize(value)
        return value
      },
      keys: [{
        name: ItemField.Name,
        weight: 4,
      }, {
        name: ItemField.Brand,
        weight: 2,
      }, {
        name: ItemField.Details,
        weight: 4,
      }, {
        name: ItemField.Category,
        weight: 1,
      }], // this is not generic ^^"
    }
    this.fuse = new Fuse(this.items, options)
    storage.set('items', this.items)
    if (this.items.length > 0) emit<ItemsReadyEvent>('items-ready')
  }

  private augmentCommonLists (inoutLists: Record<string, string[]>, records: AirtableRecord[]) {
    const lists = clone(inoutLists)
    // eslint-disable-next-line complexity, sonarjs/cognitive-complexity
    records.forEach(record => {
      const location = record.fields.location ?? '' // eslint-disable-line @typescript-eslint/no-shadow
      if (location.length > 0 && lists.locations?.includes(location) === false) lists.locations.push(location)
      const box = record.fields.box ?? ''
      if (box.length > 0 && lists.boxes?.includes(box) === false) lists.boxes.push(box)
      const status = record.fields.status ?? ItemStatus.Acheté
      if (lists.statuses?.includes(status) === false) lists.statuses.push(status)
      const category = record.fields.category ?? ''
      if (category.length > 0 && lists.categories?.includes(category) === false) lists.categories.push(category)
    })
    return lists
  }

  private parseApiRecords (records: AirtableRecord[]) {
    const boxes: string[] = []
    const locations: string[] = []
    const statuses = [ItemStatus.Acheté, ItemStatus.Vendu, ItemStatus.Donné, ItemStatus.Renvoyé, ItemStatus.Défectueux, ItemStatus.Jeté]
    const categories: string[] = []
    const drawers = ['', '1', '2', '3', '4', '5', '6', '7']
    this.augmentCommonLists({ boxes, locations, statuses, categories, drawers }, records)
    this.saveCommonLists({ boxes, locations, statuses, categories, drawers })
    this.items = records.map(record => this.airtableRecordToItem(record))
    logger.showLog(`${this.items.length} item(s) loaded ${this.coolAscii()}`)
    this.initFuse()
  }

  private onSearchStart (event: SearchStartEvent) {
    const input = event.str.trim()
    logger.debug('onSearchStart', input)
    this.lastSearch = input
    this.lastSearchOrigin = event.origin
    this.searchItems(input, event.willScrollTop)
  }

  private searchItems (input: string, willScrollTop = false) {
    const result = this.items.find(item => item.reference === input || item.barcode === input)
    const results = result ? [result] : this.fuse.search(sanitize(input)).map(item => item.item)
    let title = 'No results found'
    if (results.length > 0) title = results.length === 1 ? 'One result found' : `${results.length} results found`
    title += ` for “${input}”`
    const data: SearchResultsEvent = { title, results, isReference: Boolean(result), input, willScrollTop }
    emit<SearchResultsEvent>('search-results', data)
  }

  private onSearchRetry () {
    logger.info('retry and this.lastSearchOrigin', this.lastSearchOrigin)
    if (this.lastSearchOrigin === 'type') {
      find.one<HTMLInputElement>('#input-type').focus()
      return true
    }
    if (this.lastSearchOrigin === 'scan') return emit<AppScanCodeStartEvent>('app-scan-code--start')
    if (this.lastSearchOrigin === 'speech') return emit<AppSpeechStartEvent>('app-speech--start')
    logger.showError('un-handled search retry case')
    return false
  }

  private airtableRecordToItem (record: AirtableRecord) {
    return {
      ...emptyItem,
      ...record.fields,
      id: record.id,
    }
  }

  // eslint-disable-next-line max-statements, complexity, sonarjs/cognitive-complexity
  private getItemFieldsToPush (data: FormEditFormData) {
    const fields: AirtableRecord['fields'] = {}
    if (data.barcode !== undefined && data.barcode.length > 0) fields.barcode = data.barcode
    if (data.box !== undefined && data.box.length > 0) fields.box = data.box
    if (data.brand !== undefined && data.brand.length > 0) fields.brand = data.brand
    if (data.category !== undefined && data.category.length > 0) fields.category = data.category
    if (data.details !== undefined && data.details.length > 0) fields.details = data.details
    if (data.drawer !== undefined && data.drawer.length > 0) fields.drawer = data.drawer
    if (data.location !== undefined && data.location.length > 0) fields.location = data.location
    if (data.name !== undefined && data.name.length > 0) fields.name = data.name
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    if (data.photo !== undefined) fields.photo = [{ url: data.photo } as ItemPhoto] // we don't need the whole object
    if (data.price !== undefined) fields.price = data.price
    if (data.reference !== undefined && data.reference.length > 0) fields.reference = data.reference
    if (data.status !== undefined && data.status.length > 0) fields.status = data.status
    fields[ItemField.ReferencePrinted] = data[ItemField.ReferencePrinted] ?? false
    logger.info('fields before clean', clone(fields))
    if (data.id !== undefined && data.id.length > 0) {
      const existing = this.items.find(existingItem => existingItem.id === data.id)
      if (!existing) throw new Error('existing item not found locally')
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const dataFields = Object.keys(fields) as ItemField[]
      dataFields.forEach((field) => {
        if (field === ItemField.Id) return
        const hasSamePhoto = (field === ItemField.Photo && existing.photo && existing.photo[0]?.url === fields.photo?.[0]?.url) ?? false
        const hasSameValue = existing[field] === fields[field]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        if (hasSamePhoto || hasSameValue) delete fields[field]
      })
      logger.info('fields after clean', clone(fields))
    }
    return fields
  }

  private pushItemLocally (itemTouched: Item) {
    logger.info('pushing item locally', itemTouched)
    const index = this.items.findIndex(item => item.id === itemTouched.id)
    if (index >= 0) this.items[index] = itemTouched // update existing item
    else if (itemTouched.id) this.items.push(itemTouched) // new item with id
    else logger.showError('cannot add item without id')
    this.initFuse()
  }

  private onDocumentClick (event: MouseEvent) {
    if (!(event.target instanceof HTMLElement)) return
    const { target } = event
    let { action, payload } = target.dataset
    if (action === undefined) return
    action = action.trim()
    payload = payload?.trim()
    event.stopPropagation()
    logger.info('action clicked :', action)
    emit<AppActionEvent>(action, getObjectOrSelf(payload) ?? target)
  }

  private saveCommonLists (lists: Record<string, string[]>) {
    const sortedList = sortListsEntries(lists)
    logger.info('saving common lists :', sortedList)
    storage.set('lists', sortedList)
  }

  private readCommonLists () {
    if (this.hasCommonListsLoaded) return true
    const lists = storage.get<typeof emptyCommonLists>('lists', emptyCommonLists)
    logger.info('common lists found', lists)
    const template = find.one('template#edit-item')
    const data: Record<keyof typeof lists, string> = {
      boxes: valuesToOptions(lists.boxes),
      locations: valuesToOptions(lists.locations),
      statuses: valuesToOptions(lists.statuses),
      drawers: valuesToOptions(lists.drawers),
      categories: valuesToOptions(lists.categories),
    }
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = fillTemplate(template.innerHTML, data)
    this.hasCommonListsLoaded = true
    return true
  }

  private closeModals () {
    emit<AppModalEditItemCloseEvent>('app-modal--edit-item--close')
    emit<AppModalAddItemCloseEvent>('app-modal--add-item--close')
    emit<AppModalSearchResultsCloseEvent>('app-modal--search-results--close')
  }

  private async onImgLoadingErrorSync () {
    logger.info('search result image loading error, clearing cached items...')
    storage.clear('items')
    await this.loadItems()
    logger.info('redo last search')
    this.searchItems(this.lastSearch)
    this.isLoading(false)
  }

  private async onSettingsSave (settings: AppSettings) {
    this.apiUrl = `https://api.airtable.com/v0/${settings.base}/${settings.table}?api_key=${settings.key}&view=${settings.view}`
    const areItemsLoaded = await this.loadItems()
    if (!areItemsLoaded) {
      this.settingsActionRequired(true, 'failed to use api settings')
      return
    }
    this.settingsActionRequired(false)
    emit<AppModalSettingsCloseEvent>('app-modal--settings--close')
    storage.set('app-settings', settings)
  }

  // eslint-disable-next-line max-statements
  private async loadItems () {
    this.isLoading(true)
    const cachedItems = storage.get<Item[]>('items', [])
    if (cachedItems.length === 0) logger.showLog('no cached items found')
    else {
      logger.showLog(`using ${cachedItems.length} cached items`)
      this.isLoading(false)
      this.items = cachedItems
      this.initFuse()
    }
    let response = await this.fetchApi()
    if (response.error) {
      this.isLoading(false)
      logger.showError(`airtable fetch failed with error : ${response.error.message}`)
      return false
    }
    let { records, offset } = response
    if (!records[0] || records.length === 0) {
      this.isLoading(false)
      logger.showError('airtable fetch returned no records')
      return false
    }
    const remote = this.airtableRecordToItem(records[0])
    if (cachedItems.some(item => item.id === remote.id && item[ItemField.UpdatedOn] === remote[ItemField.UpdatedOn])) {
      this.items = cachedItems
      logger.showLog('no updates from Airtable, cache seems up to date')
      this.initFuse()
      return true
    }
    while ((offset?.length ?? 0) > 0) {
      // eslint-disable-next-line no-await-in-loop
      response = await this.fetchApi(offset)
      // eslint-disable-next-line prefer-destructuring, unicorn/consistent-destructuring
      offset = response.offset
      // eslint-disable-next-line unicorn/consistent-destructuring
      records = [...records, ...response.records]
    }
    this.parseApiRecords(records)
    return true
  }

  private async fetchApi (offset?: string) {
    const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
    const url = this.apiUrl + (offset === undefined ? '' : `&offset=${offset}`) + sortByUpdatedFirst
    if (!url.startsWith('https://api.airtable.com/v0/')) throw new Error('invalid api url')
    return await get<AirtableResponse>(url, false)
  }

  // eslint-disable-next-line max-statements
  private async onEditItem (data: FormEditFormData) {
    const fields = this.getItemFieldsToPush(data)
    if (Object.keys(fields).length === 0) { logger.showLog('no changes to push'); return false }
    this.isLoading(true)
    const response = await this.pushItemRemotely(fields, data.id)
    logger.info('onEditItem response', response)
    this.isLoading(false)
    if (response.error) { logger.showError(response.error.message); return false }
    const item = this.airtableRecordToItem(response)
    this.pushItemLocally(item)
    this.closeModals()
    document.location.hash = ''
    return true
  }

  private async pushItemRemotely (fields: AirtableRecord['fields'], id?: Item['id']) {
    if (id === undefined) throw new Error('cannot push item remotely without id')
    const data = { fields }
    if (id === '') return await post<AirtableRecord>(this.apiUrl, data)
    const url = this.apiUrl.replace('?', `/${id}?`)
    return await patch<AirtableRecord>(url, data)
  }

}

// eslint-disable-next-line no-new
new App()
