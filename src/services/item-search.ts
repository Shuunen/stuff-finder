import { capitalize, div, dom, emit, on, storage } from 'shuutils'
import { EMPTY_APP_SETTINGS } from '../constants'
import { find, get, logger } from '../utils'

class ItemSearch {
  str = 'plop'
  form = dom('form')
  wrap = ''
  get formValid (): boolean {
    return this.form.dataset['valid'] === 'true'
  }
  constructor () {
    on('app-modal--add-item--open', (element: HTMLElement) => this.onModalOpen(element))
    on('app-form--edit-item--change', this.setPrintData.bind(this))
    on('app-modal--print-one--open', this.setPrinted.bind(this))
    on<AppSearchItemEvent>('app-search-item', data => this.search(String(data['input'])))
  }
  setPrintData (data: Item): void {
    const printTrigger = find.one<HTMLButtonElement>('.app-modal.visible [data-action="app-modal--print-one--open"]')
    printTrigger.disabled = !this.formValid
    if (!this.formValid) return logger.log('form not valid, not setting print data')
    logger.log('setPrintDataSync for item', data)
    const printInputData: PrintOneInputData = { name: data.name, brand: data.brand, details: data.details, reference: data.reference, barcode: data.barcode, box: data.box, drawer: data.drawer, location: data.location }
    printTrigger.dataset['payload'] = JSON.stringify(printInputData)
  }
  async getWrapApiKey (): Promise<string> {
    if (this.wrap.length > 0) return this.wrap
    const settings = storage.get<AppSettings>('app-settings', EMPTY_APP_SETTINGS)
    this.wrap = (!settings.wrap || settings.wrap.length === 0) ? '' : settings.wrap
    if (this.wrap === '') logger.showLog('no wrap api key available in settings stored')
    return this.wrap
  }
  onModalOpen (element?: HTMLElement): void {
    const str = element ? (element.dataset['input'] ?? '') : ''
    if (str.length === 0) logger.log('no search input found')
    const input = find.one<HTMLInputElement>('app-form[name="search-item"] input')
    input.value = str
    this.setupItemForm()
    this.search(str)
  }
  setupItemForm (): void {
    const modal = find.one('.app-modal--add-item')
    find.oneOrNone('app-form[name="edit-item"]', modal)?.remove()
    const template = find.one<HTMLTemplateElement>('template#edit-item')
    const form = div('container', template.innerHTML).firstElementChild
    if (!form) return logger.showError('no form found')
    form.setAttribute('on-close', 'app-modal--add-item--close')
    const content = find.one('.content', modal)
    content.append(form)
    this.form = form as HTMLFormElement
  }
  setPrinted (): void {
    if (!this.formValid) return logger.log('form not valid, not setting item as printed')
    find.one<HTMLInputElement>('input[name="ref-printed"]', this.form).checked = true
  }
  async search (str: string): Promise<void> {
    logger.log('search', str)
    emit<AppLoaderToggleEvent>('app-loader--toggle', true)
    const items = storage.get<Item[]>('items', [])
    const result = items.find(item => (item.reference === str || item.barcode === str))
    const appError = find.one('app-form[name="search-item"] .app-error')
    appError.textContent = (result && str.length > 0) ? 'ITEM ALREADY EXISTS ! You might not want to add it... again.' : ''
    if (str.length > 0) emit<AppFormEditItemSuggestionsEvent>('app-form--edit-item--suggestions', await this.getSuggestions(str))
    emit<AppLoaderToggleEvent>('app-loader--toggle', false)
  }
  priceParse (price: string | number): string {
    if (price === undefined) return ''
    if (typeof price === 'string') return Math.round(Number.parseFloat(price)).toString()
    return Math.round(price).toString()
  }
  async getSuggestions (str: string): Promise<ItemSuggestions> {
    const suggestions: ItemSuggestions = { 'name': [], 'brand': [], 'details': [], 'reference': [], 'barcode': [], 'photo': [], 'status': ['acheté'], 'ref-printed': ['true'], 'category': [], 'box': [], 'drawer': [], 'id': [], 'location': [], 'price': [], 'updated-on': [] }
    await this.addSuggestionsFromDeyes(suggestions, str)
    await this.addSuggestionsFromAliEx(suggestions, str)
    await this.addSuggestionsFromAmzn(suggestions, str)
    await this.addSuggestionsFromCampo(suggestions, str)
    for (const key in suggestions) {
      const k = key as keyof Item
      if (suggestions[k].length === 0) delete suggestions[k] // clear empty fields
      else suggestions[k] = suggestions[k].filter((value, index, array) => array.indexOf(value) === index) // remove duplicates
    }
    const clean: Array<keyof Item> = ['name', 'details']
    clean.forEach((key) => { suggestions[key] = (suggestions[key] || []).map(suggestion => capitalize(suggestion, true)) })
    logger.log('final suggestions', suggestions)
    return suggestions
  }
  async addSuggestionsFromWrap<T> (endpoint: string): Promise<T> {
    const wrapApiKey = await this.getWrapApiKey()
    if (wrapApiKey === '') return <T>{}
    return get<T>(`https://wrapapi.com/use/jojo/${endpoint}&wrapAPIKey=${wrapApiKey}`)
  }
  async addSuggestionsFromDeyes (suggestions: ItemSuggestions, code: string): Promise<void> {
    const response = await this.addSuggestionsFromWrap<WrapApiDeyesResponse>(`deyes/json/0.0.2?code=${code}`)
    const data = response.data
    if (!response.success) return
    logger.log('deyes data', data)
    suggestions.name.push(data.name)
    suggestions.brand.push(data.brand.name)
    suggestions.details.push(data.description)
    if (data.image[0]) suggestions.photo.push(data.image[0])
    suggestions.price.push(this.priceParse(data.offers.price))
    suggestions.reference.push(data.gtin13)
  }
  async addSuggestionsFromAmzn (suggestions: ItemSuggestions, str: string): Promise<void> {
    const response = await this.addSuggestionsFromWrap<WrapApiAmznResponse>(`amzn/search/0.0.3?keywords=${str}`)
    if (!response.success) return
    const data = response.data
    logger.log('amazon data', data)
    data.items.splice(0, 5).forEach(item => {
      suggestions.details.push(item.title)
      suggestions.photo.push(item.photo)
      if (item.price) suggestions.price.push(this.priceParse(item.price))
      const asin = item.url.match(/\/dp\/(\w+)/) // get the asin from url
      if (asin?.[1]) suggestions.reference.push(asin[1])
    })
  }
  async addSuggestionsFromAliEx (suggestions: ItemSuggestions, str: string): Promise<void> {
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
  async addSuggestionsFromCampo (suggestions: ItemSuggestions, str: string): Promise<void> {
    const response = await this.addSuggestionsFromWrap<WrapApiCampoResponse>(`alcampo/search/0.0.3?str=${str}`)
    if (!response.success) return
    const data = response.data
    logger.log('campo data', data)
    data.items.forEach(item => {
      suggestions.brand.push(item.brand)
      suggestions.name.push(item.title)
      suggestions.photo.push(item.photo)
      if (item.price) suggestions.price.push(this.priceParse(item.price))
      suggestions.reference.push(item.uuid)
    })
  }
}

export const itemSearch = new ItemSearch()
