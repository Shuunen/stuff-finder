import { clone, div, emit, on, storage } from 'shuutils'
import type { AppForm } from '../components/form'
import { emptyAppSettings, emptyItem, emptyItemSuggestions } from '../constants'
import { ItemField, ItemStatus, type AppFormData, type AppFormEditItemChangeEvent, type AppFormEditItemSetEvent, type AppFormEditItemSuggestionsEvent, type AppLoaderToggleEvent, type AppModalAddItemOpenEvent, type AppModalPrintOneOpenEvent, type AppSearchItemEvent, type AppSettings, type FormEditFormData, type Item, type ItemSuggestions, type PrintInputData, type WrapApiAliExResponse, type WrapApiAngboResponse, type WrapApiCampoResponse, type WrapApiDeyesResponse } from '../types'
import { find, get } from '../utils/browser.utils'
import { logger } from '../utils/logger.utils'
import { cleanSuggestions } from '../utils/suggestions.utils'
import { getAsin, normalizePhotoUrl } from '../utils/url.utils'

class ItemSearch {

  private wrap = ''

  public constructor () {
    on<AppFormEditItemChangeEvent>('app-form--edit-item--change', this.onEditItemFormChange.bind(this))
    on<AppModalAddItemOpenEvent>('app-modal--add-item--open', this.onModalOpen.bind(this))
    on<AppModalPrintOneOpenEvent>('app-modal--print-one--open', this.setPrinted.bind(this))
    on<AppSearchItemEvent>('app-search-item', this.onSearchItem.bind(this))
  }

  private onSearchItem (data: AppFormData) {
    void this.search(String(data.input))
  }

  private onEditItemFormChange (data: FormEditFormData) {
    logger.info('onEditItemFormChange', data)
    const form = find.one<AppForm>(`app-form[data-id="${data.id ?? ''}"]`)
    this.tryToReducePhotoSize(data)
    this.setPrintData(data, form)
    this.onlyRequireReferenceOrBarcode(data, form)
  }

  private tryToReducePhotoSize (data: FormEditFormData) {
    const url = data.photo
    if (url === undefined || url.length === 0) return
    const finalUrl = normalizePhotoUrl(url)
    if (finalUrl === url) { logger.info('photo url unchanged'); return }
    logger.info('photo url changed', url, finalUrl)
    emit<AppFormEditItemSetEvent>('app-form--edit-item--set', { photo: finalUrl })
  }

  // eslint-disable-next-line max-statements
  private onlyRequireReferenceOrBarcode (data: FormEditFormData, form: AppForm) {
    const reference = find.one<HTMLInputElement>('input[name="reference"]', form)
    const barcode = find.oneOrNone<HTMLInputElement>('input[name="barcode"]', form)
    if (!barcode) return
    const isBarcodeRequiredBefore = barcode.required
    barcode.required = !(data.reference !== undefined && data.reference.length > 0 && reference.checkValidity())
    const isBarcodeRequiredAfter = barcode.required
    const isReferenceRequiredBefore = reference.required
    reference.required = !(data.barcode !== undefined && data.barcode.length > 0 && barcode.checkValidity())
    const isReferenceRequiredAfter = reference.required
    if (isBarcodeRequiredBefore === isBarcodeRequiredAfter && isReferenceRequiredBefore === isReferenceRequiredAfter) { logger.info('barcode and reference required state unchanged'); return }
    form.validateBecause('reference-or-barcode-required-changed')
  }

  private setPrintData (data: FormEditFormData, form: AppForm) {
    const printTrigger = find.one<HTMLButtonElement>(`[data-id="${data.id ?? ''}"][data-action="app-modal--print-one--open"]`, form)
    printTrigger.disabled = !data.hasValidForm
    if (!data.hasValidForm) { logger.info('form not valid, not setting print data'); return }
    logger.info('setPrintDataSync for item', data, printTrigger)
    printTrigger.dataset.payload = JSON.stringify({ ...emptyItem, ...data })
  }

  private getWrapApiKey () {
    if (this.wrap.length > 0) return this.wrap
    const settings = storage.get<AppSettings>('app-settings', emptyAppSettings)
    this.wrap = !settings.wrap || settings.wrap.length === 0 ? '' : settings.wrap
    if (this.wrap === '') logger.showLog('no wrap api key available in settings stored')
    return this.wrap
  }

  private onModalOpen (element?: HTMLElement) {
    const str = element ? element.dataset.input ?? '' : ''
    if (str.length === 0) logger.info('no search input found')
    const input = find.one<HTMLInputElement>('app-form[name="search-item"] input')
    input.value = str
    this.setupItemForm()
    this.setDefaults()
    void this.search(str)
  }

  private setupItemForm () {
    const modal = find.one('.app-modal--add-item')
    find.oneOrNone('app-form[name="edit-item"]', modal)?.remove()
    const template = find.one<HTMLTemplateElement>('template#edit-item')
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const form = div('container', template.innerHTML).firstElementChild as HTMLElement
    form.dataset[ItemField.Id] = ''
    find.one<HTMLButtonElement>('[data-action="app-modal--print-one--open"]', form).dataset[ItemField.Id] = ''
    form.setAttribute('on-close', 'app-modal--add-item--close')
    const content = find.one('.content', modal)
    content.append(form)
  }

  private setPrinted (data: PrintInputData) {
    const form = find.one<AppForm>(`app-form[data-id="${data.id ?? ''}"]`)
    find.one<HTMLInputElement>('input[name="ref-printed"]', form).checked = true
    form.validateBecause('ref-printed-changed')
  }

  private setDefaults () {
    find.one<HTMLSelectElement>('.app-modal.visible select[name="status"]').value = ItemStatus.Acheté
  }

  private priceParse (price?: number | string) {
    if (price === undefined) return ''
    if (typeof price === 'string') return Math.round(Number.parseFloat(price)).toString()
    return Math.round(price).toString()
  }

  private async search (str: string) {
    logger.info('search', str)
    emit<AppLoaderToggleEvent>('app-loader--toggle', true)
    const items = storage.get<Item[]>('items', [])
    const result = items.find(item => item.reference === str || item.barcode === str)
    const appError = find.one('app-form[name="search-item"] .app-error')
    appError.textContent = result && str.length > 0 ? 'ITEM ALREADY EXISTS ! You might not want to add it... again.' : ''
    if (str.length > 0) emit<AppFormEditItemSuggestionsEvent>('app-form--edit-item--suggestions', await this.getSuggestions(str))
    emit<AppLoaderToggleEvent>('app-loader--toggle', false)
  }

  private async getSuggestions (str: string) {
    const asin = getAsin(str)
    const suggestionsBase = clone(emptyItemSuggestions)
    if (asin !== undefined) await this.addSuggestionsFromAngbo(suggestionsBase, asin)
    if (suggestionsBase.name.length === 0) await this.addSuggestionsFromDeyes(suggestionsBase, str)
    if (suggestionsBase.name.length === 0) await this.addSuggestionsFromAliEx(suggestionsBase, str)
    await this.addSuggestionsFromCampo(suggestionsBase, str)
    const suggestions = cleanSuggestions(suggestionsBase)
    logger.info('final suggestions', suggestions)
    return suggestions
  }

  // eslint-disable-next-line etc/no-misused-generics
  private async addSuggestionsFromWrap<ResponseType> (endpoint: string) {
    const wrapApiKey = this.getWrapApiKey()
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    if (wrapApiKey === '') return {} as ResponseType
    return await get<ResponseType>(`https://wrapapi.com/use/jojo/${endpoint}&wrapAPIKey=${wrapApiKey}`)
  }

  private async addSuggestionsFromDeyes (suggestions: ItemSuggestions, code: string) {
    const { data, success } = await this.addSuggestionsFromWrap<WrapApiDeyesResponse>(`deyes/json/0.0.2?code=${code}`) // eslint-disable-line @typescript-eslint/naming-convention
    if (!success) return
    logger.info('deyes data', data)
    suggestions.name.push(data.name)
    suggestions.brand.push(data.brand.name)
    suggestions.details.push(data.description)
    const [image] = data.image
    if (image !== undefined) suggestions.photo.push(image)
    suggestions.price.push(this.priceParse(data.offers.price))
    suggestions.reference.push(data.gtin13)
  }

  private async addSuggestionsFromAngbo (suggestions: ItemSuggestions, str: string) {
    const { data, success } = await this.addSuggestionsFromWrap<WrapApiAngboResponse>(`angbo/search/0.0.3?id=${str}`) // eslint-disable-line @typescript-eslint/naming-convention
    if (!success) return
    logger.info('angbo data', data)
    suggestions.name.push(data.title)
    suggestions.photo.push(data.photo)
    suggestions.price.push(this.priceParse(data.price))
    suggestions.reference.push(data.asin)
  }

  private async addSuggestionsFromAliEx (suggestions: ItemSuggestions, str: string) {
    const { data, success } = await this.addSuggestionsFromWrap<WrapApiAliExResponse>(`aliex/search/0.0.1?str=${str}`) // eslint-disable-line @typescript-eslint/naming-convention
    if (!success) return
    logger.info('AliEx data', data)
    data.items.forEach(item => {
      suggestions.name.push(item.title)
      suggestions.photo.push(item.photo)
      suggestions.price.push(this.priceParse(item.price))
      suggestions.reference.push(item.reference)
    })
  }

  private async addSuggestionsFromCampo (suggestions: ItemSuggestions, str: string) {
    const { data, success } = await this.addSuggestionsFromWrap<WrapApiCampoResponse>(`alcampo/search/0.0.3?str=${str}`) // eslint-disable-line @typescript-eslint/naming-convention
    if (!success) return
    logger.info('campo data', data)
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