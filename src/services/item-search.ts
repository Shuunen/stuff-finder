import { div, emit, on } from 'shuutils'
import { getCached, showLog } from '../utils'
import { storage } from './storage'

class ItemSearch {
  str = 'plop'
  form: HTMLFormElement
  wrap = ''
  constructor () {
    on('app-modal--add-item--open', (element: HTMLElement) => this.onModalOpen(element))
    on('app-search-item', data => this.search(data.input))
  }
  async getWrapApiKey () {
    if (this.wrap.length > 0) return this.wrap
    const settings = await storage.get<AppSettings>('app-settings')
    this.wrap = (!settings.wrap || settings.wrap.length === 0) ? '' : settings.wrap
    if (this.wrap === '') showLog('no wrap api key available in settings stored')
    return this.wrap
  }
  onModalOpen (element?: HTMLElement) {
    const str = element ? element.dataset.input : ''
    const input = document.querySelector<HTMLInputElement>('app-form[name="search-item"] input')
    if (input) input.value = str
    else console.error('no input found')
    this.setupItemForm()
    this.search(str)
  }
  setupItemForm () {
    const modal = document.querySelector('.app-modal--add-item')
    if (!modal) return console.error('No modal found')
    const old = modal.querySelector('app-form[name="edit-item"]')
    if (old) old.remove()
    const template = document.querySelector<HTMLTemplateElement>('template#edit-item')
    if (!template) return console.error('no item form template')
    const form = div('container', template.innerHTML).firstElementChild as HTMLFormElement
    form.setAttribute('on-close', 'app-modal--add-item--close')
    modal.querySelector('.content').append(form)
    this.form = form
  }
  async search (str) {
    console.log(str)
    emit('app-loader--toggle', true)
    const items = await storage.get<Item[]>('items')
    const result = items.find(item => (item.reference === str || item.barcode === str))
    document.querySelector('app-form[name="search-item"] .error').textContent = (result && str.length > 0) ? 'ITEM ALREADY EXISTS ! You might not want to add it... again.' : ''
    if (str.length > 0) emit('app-form--edit-item--suggestions', await this.getSuggestions(str))
    emit('app-loader--toggle', false)
  }
  priceParse (price: string | number): string {
    if (price === undefined) return ''
    if (typeof price === 'string') return Math.round(Number.parseFloat(price)).toString()
    return Math.round(price).toString()
  }
  async getSuggestions (str: string) {
    const suggestions: ItemSuggestions = { 'name': [], 'brand': [], 'details': [], 'reference': [], 'barcode': [], 'photo': [], 'status': ['acheté'], 'ref-printed': ['true'], 'category': [], 'box': [], 'drawer': [], 'id': [], 'location': [], 'price': [], 'updated-on': [] }
    await this.addSuggestionsFromDeyes(suggestions, str)
    if (suggestions.reference.length === 0 || suggestions.details.length === 0) await this.addSuggestionsFromAmzn(suggestions, str)
    if (suggestions.reference.length === 0) await this.addSuggestionsFromCampo(suggestions, str)
    for (const key in suggestions)
      if (suggestions[key].length === 0) delete suggestions[key] // clear empty fields
      else suggestions[key] = suggestions[key].filter((value, index, array) => array.indexOf(value) === index) // remove duplicates
    console.log('final suggestions', suggestions)
    return suggestions
  }
  async addSuggestionsFromWrap<T> (endpoint: string): Promise<T> {
    const wrapApiKey = await this.getWrapApiKey()
    if (wrapApiKey === '') return {} as T
    return getCached<T>(`https://wrapapi.com/use/jojo/${endpoint}&wrapAPIKey=${wrapApiKey}`)
  }
  async addSuggestionsFromDeyes (suggestions: ItemSuggestions, code: string) {
    const response = await this.addSuggestionsFromWrap<WrapApiDeyesResponse>(`deyes/json/0.0.2?code=${code}`)
    const data = response.data
    if (!response.success) return {}
    console.log('deyes data', data)
    suggestions.name.push(data.name)
    suggestions.brand.push(data.brand.name)
    suggestions.details.push(data.description)
    suggestions.photo.push(data.image[0])
    suggestions.price.push(this.priceParse(data.offers === '' ? undefined : data.offers[0].price))
    suggestions.reference.push(data.gtin13)
  }
  async addSuggestionsFromAmzn (suggestions: ItemSuggestions, str: string) {
    const response = await this.addSuggestionsFromWrap<WrapApiAmznResponse>(`amzn/search/0.0.3?keywords=${str}`)
    if (!response.success) return {}
    const data = response.data
    console.log('amazon data', data)
    data.items.forEach(item => {
      suggestions.details.push(item.title)
      suggestions.photo.push(item.photo)
      suggestions.price.push(this.priceParse(item.price))
      suggestions.reference.push((item.url.match(/\/dp\/(\w+)/) || [])[1]) // get the asin from url
    })
  }
  async addSuggestionsFromCampo (suggestions: ItemSuggestions, str: string) {
    const response = await this.addSuggestionsFromWrap<WrapApiCampoResponse>(`alcampo/search/0.0.3?str=${str}`)
    if (!response.success) return {}
    const data = response.data
    console.log('campo data', data)
    data.items.forEach(item => {
      suggestions.brand.push(item.brand)
      suggestions.name.push(item.title)
      suggestions.photo.push(item.photo)
      suggestions.price.push(this.priceParse(item.price))
      suggestions.reference.push(item.uuid)
    })
  }
}

export const itemSearch = new ItemSearch()
