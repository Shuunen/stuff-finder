import { capitalize, clone, div, emit, on, storage } from 'shuutils'
import type { AppForm } from '../components/form'
import { EMPTY_APP_SETTINGS, EMPTY_ITEM, EMPTY_ITEM_SUGGESTIONS } from '../constants'
import type { AppFormData, AppFormEditItemChangeEvent, AppFormEditItemSetEvent, AppFormEditItemSuggestionsEvent, AppLoaderToggleEvent, AppModalAddItemOpenEvent, AppModalPrintOneOpenEvent, AppSearchItemEvent, AppSettings, FormEditFormData, Item, ItemSuggestions, PrintInputData, WrapApiAliExResponse, WrapApiAngboResponse, WrapApiCampoResponse, WrapApiDeyesResponse } from '../types'
import { ItemField, ItemStatus } from '../types'
import { find, get, logger } from '../utils'
import { getAsin, normalizePhotoUrl } from '../utils/url'

class ItemSearch {

  private wrap = ''

  public constructor () {
    on<AppFormEditItemChangeEvent>('app-form--edit-item--change', this.onEditItemFormChange.bind(this))
    on<AppModalAddItemOpenEvent>('app-modal--add-item--open', this.onModalOpen.bind(this))
    on<AppModalPrintOneOpenEvent>('app-modal--print-one--open', this.setPrinted.bind(this))
    on<AppSearchItemEvent>('app-search-item', this.onSearchItem.bind(this))
  }

  private onSearchItem (data: AppFormData): void {
    void this.search(String(data['input']))
  }

  private onEditItemFormChange (data: FormEditFormData): void {
    logger.log('onEditItemFormChange', data)
    const form = find.one<AppForm>(`app-form[data-id="${data.id ?? ''}"]`)
    this.tryToReducePhotoSize(data)
    this.setPrintData(data, form)
    this.onlyRequireReferenceOrBarcode(data, form)
  }

  private tryToReducePhotoSize (data: FormEditFormData): void {
    const url = data.photo
    if (url === undefined || url.length === 0) return
    const finalUrl = normalizePhotoUrl(url)
    if (finalUrl === url) { logger.log('photo url unchanged'); return }
    logger.log('photo url changed', url, finalUrl)
    emit<AppFormEditItemSetEvent>('app-form--edit-item--set', { photo: finalUrl })
  }

  private onlyRequireReferenceOrBarcode (data: FormEditFormData, form: AppForm): void {
    const reference = find.one<HTMLInputElement>('input[name="reference"]', form)
    const barcode = find.oneOrNone<HTMLInputElement>('input[name="barcode"]', form)
    if (!barcode) return
    const barcodeBefore = barcode.required
    barcode.required = !(data.reference !== undefined && data.reference.length > 0 && reference.checkValidity())
    const referenceBefore = reference.required
    reference.required = !(data.barcode !== undefined && data.barcode.length > 0 && barcode.checkValidity())
    if (barcodeBefore === barcode.required && referenceBefore === reference.required) { logger.log('barcode and reference required state unchanged'); return }
    form.validateBecause('reference-or-barcode-required-changed')
  }

  private setPrintData (data: FormEditFormData, form: AppForm): void {
    const printTrigger = find.one<HTMLButtonElement>(`[data-id="${data.id ?? ''}"][data-action="app-modal--print-one--open"]`, form)
    printTrigger.disabled = !data.formValid
    if (!data.formValid) { logger.log('form not valid, not setting print data'); return }
    logger.log('setPrintDataSync for item', data, printTrigger)
    const printInputData: PrintInputData = Object.assign({}, EMPTY_ITEM, { id: data.id, name: data.name, brand: data.brand, details: data.details, reference: data.reference, barcode: data.barcode, box: data.box, drawer: data.drawer, location: data.location })
    printTrigger.dataset['payload'] = JSON.stringify(printInputData)
  }

  private getWrapApiKey (): string {
    if (this.wrap.length > 0) return this.wrap
    const settings = storage.get<AppSettings>('app-settings', EMPTY_APP_SETTINGS)
    this.wrap = !settings.wrap || settings.wrap.length === 0 ? '' : settings.wrap
    if (this.wrap === '') logger.showLog('no wrap api key available in settings stored')
    return this.wrap
  }

  private onModalOpen (element?: HTMLElement): void {
    const str = element ? element.dataset['input'] ?? '' : ''
    if (str.length === 0) logger.log('no search input found')
    const input = find.one<HTMLInputElement>('app-form[name="search-item"] input')
    input.value = str
    this.setupItemForm()
    this.setDefaults()
    void this.search(str)
  }

  private setupItemForm (): void {
    const modal = find.one('.app-modal--add-item')
    find.oneOrNone('app-form[name="edit-item"]', modal)?.remove()
    const template = find.one<HTMLTemplateElement>('template#edit-item')
    const form = div('container', template.innerHTML).firstElementChild as HTMLElement
    form.dataset[ItemField.id] = ''
    find.one<HTMLButtonElement>('[data-action="app-modal--print-one--open"]', form).dataset[ItemField.id] = ''
    form.setAttribute('on-close', 'app-modal--add-item--close')
    const content = find.one('.content', modal)
    content.append(form)
  }

  private setPrinted (data: PrintInputData): void {
    const form = find.one<AppForm>(`app-form[data-id="${data.id ?? ''}"]`)
    find.one<HTMLInputElement>('input[name="ref-printed"]', form).checked = true
    form.validateBecause('ref-printed-changed')
  }

  private setDefaults (): void {
    find.one<HTMLSelectElement>('.app-modal.visible select[name="status"]').value = ItemStatus.acheté
  }

  private async search (str: string): Promise<void> {
    logger.log('search', str)
    emit<AppLoaderToggleEvent>('app-loader--toggle', true)
    const items = storage.get<Item[]>('items', [])
    const result = items.find(item => item.reference === str || item.barcode === str)
    const appError = find.one('app-form[name="search-item"] .app-error')
    appError.textContent = result && str.length > 0 ? 'ITEM ALREADY EXISTS ! You might not want to add it... again.' : ''
    if (str.length > 0) emit<AppFormEditItemSuggestionsEvent>('app-form--edit-item--suggestions', await this.getSuggestions(str))
    emit<AppLoaderToggleEvent>('app-loader--toggle', false)
  }

  private priceParse (price?: number | string): string {
    if (price === undefined) return ''
    if (typeof price === 'string') return Math.round(Number.parseFloat(price)).toString()
    return Math.round(price).toString()
  }

  private async getSuggestions (str: string): Promise<Partial<ItemSuggestions>> {
    const asin = getAsin(str)
    const suggestionsBase = clone(EMPTY_ITEM_SUGGESTIONS)
    if (asin !== undefined) await this.addSuggestionsFromAngbo(suggestionsBase, asin)
    if (suggestionsBase.name.length === 0) await this.addSuggestionsFromDeyes(suggestionsBase, str)
    if (suggestionsBase.name.length === 0) await this.addSuggestionsFromAliEx(suggestionsBase, str)
    await this.addSuggestionsFromCampo(suggestionsBase, str)
    const suggestions: Partial<ItemSuggestions> = suggestionsBase
    for (const key in suggestions) {
      const k = key as keyof Item
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      if (suggestions[k]?.length === 0) delete suggestions[k] // clear empty fields
      else suggestions[k] = suggestions[k]?.filter((value, index, array) => array.indexOf(value) === index) // remove duplicates
    }
    const clean: ItemField[] = [ItemField.name, ItemField.details]
    clean.forEach((key) => {
      if (suggestions[key] === undefined) return
      suggestions[key] = suggestions[key]?.map(suggestion => capitalize(suggestion, true))
    })
    logger.log('final suggestions', suggestions)
    return suggestions
  }

  private async addSuggestionsFromWrap<T> (endpoint: string): Promise<T> {
    const wrapApiKey = this.getWrapApiKey()
    if (wrapApiKey === '') return {} as T
    return get<T>(`https://wrapapi.com/use/jojo/${endpoint}&wrapAPIKey=${wrapApiKey}`)
  }

  private async addSuggestionsFromDeyes (suggestions: ItemSuggestions, code: string): Promise<void> {
    const response = await this.addSuggestionsFromWrap<WrapApiDeyesResponse>(`deyes/json/0.0.2?code=${code}`)
    const data = response.data
    if (!response.success) return
    logger.log('deyes data', data)
    suggestions.name.push(data.name)
    suggestions.brand.push(data.brand.name)
    suggestions.details.push(data.description)
    const image = data.image[0]
    if (image !== undefined) suggestions.photo.push(image)
    suggestions.price.push(this.priceParse(data.offers.price))
    suggestions.reference.push(data.gtin13)
  }

  private async addSuggestionsFromAngbo (suggestions: ItemSuggestions, str: string): Promise<void> {
    const response = await this.addSuggestionsFromWrap<WrapApiAngboResponse>(`angbo/search/0.0.3?id=${str}`)
    if (!response.success) return
    const data = response.data
    logger.log('angbo data', data)
    suggestions.name.push(data.title)
    suggestions.photo.push(data.photo)
    suggestions.price.push(this.priceParse(data.price))
    suggestions.reference.push(data.asin)
  }

  private async addSuggestionsFromAliEx (suggestions: ItemSuggestions, str: string): Promise<void> {
    const response = await this.addSuggestionsFromWrap<WrapApiAliExResponse>(`aliex/search/0.0.1?str=${str}`)
    if (!response.success) return
    const data = response.data
    logger.log('AliEx data', data)
    data.items.forEach(item => {
      suggestions.name.push(item.title)
      suggestions.photo.push(item.photo)
      suggestions.price.push(this.priceParse(item.price))
      suggestions.reference.push(item.reference)
    })
  }

  private async addSuggestionsFromCampo (suggestions: ItemSuggestions, str: string): Promise<void> {
    const response = await this.addSuggestionsFromWrap<WrapApiCampoResponse>(`alcampo/search/0.0.3?str=${str}`)
    if (!response.success) return
    const data = response.data
    logger.log('campo data', data)
    data.items.forEach(item => {
      suggestions.brand.push(item.brand)
      suggestions.name.push(item.title)
      suggestions.photo.push(item.photo)
      if (item.price !== undefined) suggestions.price.push(this.priceParse(item.price))
      suggestions.reference.push(item.uuid)
    })
  }
}

export const itemSearch = new ItemSearch()
