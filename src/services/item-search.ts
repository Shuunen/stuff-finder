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
    if (str.length > 0) emit('app-form--edit-item--set', await this.getData(str))
    // emit('app-form--edit-item--suggestions', { name: ['Popop', 'Polop'] }) // TODO
    emit('app-loader--toggle', false)
  }
  async getData (str: string) {
    const data: PrefillItem = { 'name': str, 'brand': '', 'details': '', 'reference': '', 'barcode': '', 'photo': '', 'status': 'acheté', 'ref-printed': true }
    Object.assign(data, await this.getDataFromDeyes(str))
    if (data.reference.length === 0 || data.details.length === 0) Object.assign(data, await this.getDataFromAmzn(str))
    if (data.reference.length === 0) Object.assign(data, await this.getDataFromCampo(str))
    console.log('final data', data)
    return data
  }
  async getDataFromWrap<T> (endpoint: string): Promise<T> {
    const wrapApiKey = await this.getWrapApiKey()
    if (wrapApiKey === '') return {} as T
    return getCached<T>(`https://wrapapi.com/use/jojo/${endpoint}&wrapAPIKey=${wrapApiKey}`)
  }
  async getDataFromDeyes (code: string): Promise<Partial<PrefillItem>> {
    const response = await this.getDataFromWrap<WrapApiDeyesResponse>(`deyes/json/0.0.2?code=${code}`)
    const data = response.data
    if (!response.success) return {}
    console.log('deyes data', data)
    return {
      brand: data.brand.name,
      details: data.description,
      name: data.name,
      photo: data.image[0],
      price: ['string', 'undefined'].includes(typeof data.offers[0]) ? undefined : Math.round(Number.parseFloat((data.offers[0] as { price: string }).price)),
      reference: data.gtin13,
    }
  }
  async getDataFromAmzn (str: string): Promise<Partial<PrefillItem>> {
    const response = await this.getDataFromWrap<WrapApiAmznResponse>(`amzn/search/0.0.3?keywords=${str}`)
    if (!response.success) return {}
    const data = response.data
    console.log('amazon data', data)
    const item = data.items[0]
    return {
      details: item.title,
      photo: item.photo,
      price: Math.round(item.price),
      reference: (item.url.match(/\/dp\/(\w+)/) || [])[1], // get the asin from url
    }
  }
  async getDataFromCampo (str: string): Promise<Partial<PrefillItem>> {
    const response = await this.getDataFromWrap<WrapApiCampoResponse>(`alcampo/search/0.0.3?str=${str}`)
    if (!response.success) return {}
    const data = response.data
    console.log('campo data', data)
    const item = data.items[0]
    return {
      brand: item.brand,
      name: item.title,
      photo: item.photo,
      price: item.price,
      reference: item.uuid,
    }
  }
}

export const itemSearch = new ItemSearch()
