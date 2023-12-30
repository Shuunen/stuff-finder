/* eslint-disable max-lines */
import Fuse, { type IFuseOptions } from 'fuse.js'
import { clone, debounce, emit, fillTemplate, on, sanitize, sleep } from 'shuutils'
import './components'
import { delays, emptyCommonLists, type CommonLists } from './constants'
import './services/item-search.service'
import './services/sound.service'
import './services/speech.service'
import './services/url.service'
import { ItemField, type AirtableRecord, type AirtableResponse, type AppActionEvent, type AppCloneItemEvent, type AppCredentials, type AppFormDataValue, type AppFormEditItemSaveEvent, type AppFormFieldChangeEvent, type AppFormSettingsErrorEvent, type AppFormSettingsReadyEvent, type AppFormSettingsSaveEvent, type AppFormSettingsSetEvent, type AppImgLoadingErrorEvent, type AppLoaderToggleEvent, type AppModalAddItemCloseEvent, type AppModalEditItemCloseEvent, type AppModalSearchResultsCloseEvent, type AppModalSettingsCloseEvent, type AppScanCodeStartEvent, type AppSettingsTriggerAnimateEvent, type AppSpeechStartEvent, type AppStatusEvent, type FormEditFormData, type FormIdErrorEvent, type Item, type ItemPhoto, type ItemsReadyEvent, type SearchOrigin, type SearchResultsEvent, type SearchRetryEvent, type SearchStartEvent } from './types'
import { find, get, patch, post, valuesToOptions } from './utils/browser.utils'
import { airtableRecordToItem, getCommonListsFromItems } from './utils/item.utils'
import { logger } from './utils/logger.utils'
import { getObjectOrSelf } from './utils/objects.utils'
import { state } from './utils/state.utils'
import { storage } from './utils/storage.utils'
import { coolAscii } from './utils/strings.utils'

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
    this.setListeners()
    this.checkExistingSettings()
  }

  private setListeners () {
    on<AppFormSettingsSaveEvent>('app-form--settings--save', this.onSettingsSave.bind(this))
    on<AppFormEditItemSaveEvent>('app-form--edit-item--save', this.onEditItem.bind(this))
    on<SearchStartEvent>('search-start', this.onSearchStart.bind(this))
    on<SearchRetryEvent>('search-retry', this.onSearchRetry.bind(this))
    on<AppImgLoadingErrorEvent>('app--img-loading-error', this.onImgLoadingError.bind(this))
    on<AppCloneItemEvent>('app-clone-item', this.onCloneItem.bind(this))
    on<AppFormFieldChangeEvent>('app-form--edit-item--reference--change', this.onIdentifierChange.bind(this))
    on<AppFormFieldChangeEvent>('app-form--edit-item--barcode--change', this.onIdentifierChange.bind(this))
    document.addEventListener('click', this.onDocumentClick.bind(this))
  }

  private checkExistingSettings () {
    const settings = storage.get<AppCredentials>('app-settings', state.credentials)
    if (!settings.base) { this.settingsActionRequired(true); return }
    void this.onSettingsSave(settings)
    on<AppFormSettingsReadyEvent>('app-form--settings--ready', () => emit<AppFormSettingsSetEvent>('app-form--settings--set', settings))
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
    this.readCommonLists()
    if (!this.hasCommonListsLoaded) throw new Error('common lists not loaded')
    // https://fusejs.io/
    const options: IFuseOptions<Item> = {
      distance: 200, // see the tip at https://fusejs.io/concepts/scoring-theory.html#scoring-theory
      getFn: (object: Item, path: string[] | string) => {
        const value = Fuse.config.getFn(object, path)
        if (Array.isArray(value)) return value.map((element: string) => sanitize(element))
        if (typeof value === 'string') return sanitize(value)
        return value
      },
      ignoreLocation: true, // eslint-disable-line @typescript-eslint/naming-convention
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
      threshold: 0.35, // 0 is perfect match
    }
    this.fuse = new Fuse(this.items, options)
    storage.set('items', this.items)
    if (this.items.length > 0) emit<ItemsReadyEvent>('items-ready')
  }

  private parseApiRecords (records: AirtableRecord[]) {
    this.items = records.map(record => airtableRecordToItem(record))
    logger.showLog(`${this.items.length} item(s) loaded ${coolAscii()}`)
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
    const data: SearchResultsEvent = { input, isReference: Boolean(result), results, title, willScrollTop }
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
    logger.info('clicked :', { action, payload })
    emit<AppActionEvent>(action, getObjectOrSelf(payload) ?? target)
  }

  private saveCommonLists (lists: CommonLists) {
    logger.info('saving common lists :', lists)
    storage.set('lists', lists)
  }

  private fillEditItemTemplate (lists: CommonLists) {
    const template = find.one('template#edit-item')
    const data: Record<keyof typeof lists, string> = {
      boxes: valuesToOptions(lists.boxes),
      categories: valuesToOptions(lists.categories),
      drawers: valuesToOptions(lists.drawers),
      locations: valuesToOptions(lists.locations),
      statuses: valuesToOptions(lists.statuses),
    }
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = fillTemplate(template.innerHTML, data)
  }

  private readCommonLists () {
    if (this.hasCommonListsLoaded) return
    let lists = storage.get<typeof emptyCommonLists>('lists', emptyCommonLists)
    if (lists.boxes.length <= 1) {
      lists = getCommonListsFromItems(this.items)
      this.saveCommonLists(lists)
    }
    logger.info('common lists found', lists)
    this.fillEditItemTemplate(lists)
    this.hasCommonListsLoaded = true
  }

  private closeModals () {
    emit<AppModalEditItemCloseEvent>('app-modal--edit-item--close')
    emit<AppModalAddItemCloseEvent>('app-modal--add-item--close')
    emit<AppModalSearchResultsCloseEvent>('app-modal--search-results--close')
  }

  private async onIdentifierChange (value: AppFormDataValue) {
    logger.info('onIdentifierChange', value)
    const id = String(value).trim()
    if (id.length === 0) return
    const existing = this.items.find(item => (item.reference === id || item.barcode === id))
    if (!existing) {
      logger.debug('good, no existing item found with this barcode/reference')
      return
    }
    logger.error('existing item found with this barcode/reference')
    await sleep(delays.large)
    emit<FormIdErrorEvent>('app-form--edit-item--error', `Identifier "${id}" already exists, please choose another one`)
  }

  // eslint-disable-next-line max-statements
  private async onCloneItem (id: string) {
    logger.info('onCloneItem', id)
    emit<AppModalEditItemCloseEvent>('app-modal--edit-item--close')
    const item = this.items.find(one => one.id === id)
    if (!item) throw new Error('no item found')
    logger.info('cloning item', item)
    await sleep(delays.large)
    emit('edit-item', { ...item, 'barcode': '', 'id': '', 'ref-printed': false, 'reference': '' })
    const modal = find.one('.app-modal--edit-item')
    find.one<HTMLHeadingElement>('.app-header', modal).textContent = 'Add item (clone)'
    find.one<HTMLElement>('[data-action="app-clone-item"]', modal).style.display = 'none'
    find.one<HTMLButtonElement>('.app-save', modal).textContent = 'Add'
    logger.info('modal', modal)
  }

  private async onImgLoadingErrorSync () {
    logger.info('search result image loading error, clearing cached items...')
    storage.clear('items')
    await this.loadItems()
    logger.info('redo last search')
    this.searchItems(this.lastSearch)
    this.isLoading(false)
  }

  private async onSettingsSave (settings: AppCredentials) {
    this.apiUrl = `https://api.airtable.com/v0/${settings.base}/${settings.table}?view=${settings.view}`
    state.credentials = settings
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
    let { offset, records } = response
    if (!records[0] || records.length === 0) {
      this.isLoading(false)
      logger.showError('airtable fetch returned no records')
      return false
    }
    const remote = airtableRecordToItem(records[0])
    if (cachedItems.some(item => item.id === remote.id && item[ItemField.UpdatedOn] === remote[ItemField.UpdatedOn])) {
      this.items = cachedItems
      logger.showLog('no updates from Airtable, cache seems up to date')
      this.initFuse()
      return true
    }
    while ((offset?.length ?? 0) > 0) {
      // eslint-disable-next-line no-await-in-loop
      response = await this.fetchApi(offset)
      // eslint-disable-next-line unicorn/consistent-destructuring
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
    const item = airtableRecordToItem(response)
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
