import { div, emit, on } from 'shuutils'
import { DEFAULT_IMAGE } from '../constants'
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
    emit('app-form--edit-item--set', await this.getData(str))
    // emit('app-form--edit-item--suggestions', { name: ['Popop', 'Polop'] }) // TODO
    emit('app-loader--toggle', false)
  }
  async getData (str: string) {
    const data: PrefillItem = { 'name': str, 'brand': '', 'details': '', 'reference': '', 'barcode': '', 'photo': DEFAULT_IMAGE, 'status': 'acheté', 'ref-printed': true }
    Object.assign(data, await this.getDataFromDeyes(str))
    if (data.reference.length === 0 || data.details.length === 0) Object.assign(data, await this.getDataFromAmzn(str))
    console.log('final data', data)
    return data
  }
  async getDataFromDeyes (code: string): Promise<Partial<PrefillItem>> {
    const wrapApiKey = await this.getWrapApiKey()
    if (wrapApiKey === '') return {}
    const response = await getCached<WrapApiDeyesResponse>(`https://wrapapi.com/use/jojo/deyes/json/0.0.2?code=${code}&wrapAPIKey=${wrapApiKey}`)
    if (!response.success) return {}
    const data = response.data
    console.log('deyes data', data)
    return {
      name: data.name,
      brand: data.brand.name,
      details: data.description,
      photo: data.image[0],
      reference: data.gtin13,
      price: ['string', 'undefined'].includes(typeof data.offers[0]) ? undefined : Math.round(Number.parseFloat((data.offers[0] as { price: string }).price)),
    }
  }
  async getDataFromAmzn (str: string) {
    const wrapApiKey = await this.getWrapApiKey()
    if (wrapApiKey === '') return {}
    const response = await getCached<WrapApiAmznResponse>(`https://wrapapi.com/use/jojo/amzn/search/0.0.3?keywords=${str}&wrapAPIKey=${wrapApiKey}`)
    if (!response.success) return {}
    const data = response.data
    console.log('amazon data', data)
    const item = data.items[0]
    return {
      details: item.title,
      reference: (item.url.match(/\/dp\/(\w+)/) || [])[1], // get the asin from url
      photo: item.photo,
      price: Math.round(item.price),
    }
  }
}

export const itemSearch = new ItemSearch()
