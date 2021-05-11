/* global document, fetch */
import Fuse from 'fuse.js'
import { emit, on, pickOne, sleep, storage } from 'shuutils'
import './components/index.js'
import { JSON_HEADERS, SEARCH_ORIGIN } from './constants.js'
import './services/index.js'
import './styles/main.css'

const key = '@shuunen/stuff-finder_'

class App {
  constructor() {
    console.log('app start')
    this.items = []
    on('app-form--settings--save', settings => this.onSettingsSave(settings))
    on('app-update--item', item => this.onUpdateItem(item))
    on('get-barcodes-to-print', () => this.getBarcodesToPrint())
    on('search-start', data => this.onSearchStart(data))
    on('search-retry', () => this.onSearchRetry())
    on('fade-in', element => this.fadeIn(element))
    on('fade-out', element => this.fadeOut(element))
    on('fade-out-destroy', element => this.fadeOut(element, true))
    this.checkExistingSettings()
    this.showTitle()
  }

  async checkExistingSettings() {
    const settings = await storage.get(key + 'app-settings')
    if (!settings) return this.settingsActionRequired(true)
    this.onSettingsSave(settings)
    on('app-form--settings--ready', () => emit('app-form--settings--set', settings))
  }

  coolAscii() {
    return pickOne(['( ＾◡＾)', '♥‿♥', '八(＾□＾*)', '(◡ ‿ ◡ ✿)', '(=^ェ^=)', 'ʕ •ᴥ•ʔ', '(*°∀°)', '\\(-ㅂ-)/', 'ლ(╹◡╹ლ)', 'ლ(o◡oლ)', '＼(＾O＾)／'])
  }

  showTitle() {
    emit('app-prompter--type', ['Stuff Finder', 1000, `Stuff Finder\n${this.coolAscii()}`])
  }

  async onSettingsSave(settings) {
    this.apiUrl = `https://api.airtable.com/v0/${settings.base}/${settings.table}?api_key=${settings.key}&view=${settings.view}`
    const itemsLoaded = await this.loadItems()
    if (!itemsLoaded) return this.settingsActionRequired(true, 'failed to use api settings')
    this.settingsActionRequired(false)
    if (this.items.length > 0) emit('items-ready')
    storage.set(key + 'app-settings', settings)
  }

  settingsActionRequired(actionRequired, errorMessage = '') {
    emit('app-settings-trigger--animate', actionRequired)
    emit('app-form--settings--error', errorMessage)
    if (!actionRequired) emit('app-modal--close')
  }

  isLoading(active) {
    emit('app-loader--toggle', active)
  }

  async loadItems() {
    this.isLoading(true)
    const cachedItems = (await storage.get(key + 'items')) || []
    let response = await this.fetchApi()
    if (!response || response.error) {
      this.isLoading(false)
      return false
    }
    let records = response.records
    if (cachedItems.some(item => (item.id === records[0].id && item['updated-on'] === records[0].fields['updated-on']))) {
      this.items = cachedItems
      this.showLog(`${this.items.length} item(s) cached ` + this.coolAscii())
      this.initFuse()
      return true
    }
    let offset = response.offset
    while (offset) {
      response = await this.fetchApi(offset) // eslint-disable-line no-await-in-loop
      offset = response.offset
      records = records.concat(response.records)
    }
    this.parseApiRecords(records)
    return true
  }

  async getBarcodesToPrint() {
    const barcodes = this.items.filter(index => index['ref-printed'] === false && index.status === 'acheté')
    emit('barcodes-to-print', barcodes)
  }

  async fetchApi(offset) {
    const sortByUpdatedFirst = '&sort%5B0%5D%5Bfield%5D=updated-on&sort%5B0%5D%5Bdirection%5D=desc'
    const url = this.apiUrl + (offset ? `&offset=${offset}` : '') + sortByUpdatedFirst
    return fetch(url).then(response => response.json())
  }

  parseApiRecords(records) {
    // this.showLog('parsing api records :', records )
    let boxes = []
    let locations = []
    let statuses = []
    records.forEach(record => {
      const location = (record.fields.location && record.fields.location !== 'N/A') ? record.fields.location : ''
      const box = record.fields.box || ''
      const status = record.fields.status || 'acheté'
      if (location.length > 0 && !locations.includes(location)) locations.push(location)
      if (box.length > 0 && !boxes.includes(box)) boxes.push(box)
      if (!statuses.includes(status)) statuses.push(status)
    })
    locations = ['', 'N/A'].concat(locations.sort())
    boxes = [''].concat(boxes.sort())
    statuses = [''].concat(statuses.sort())
    this.items = records.map(record => ({
      id: record.id,
      name: '',
      brand: '',
      details: '',
      box: '',
      boxes,
      drawer: '',
      location: '',
      locations,
      reference: '',
      barcode: '',
      'ref-printed': false,
      status: 'acheté',
      statuses,
      ...record.fields,
    }))
    this.showLog(`${this.items.length} item(s) loaded ` + this.coolAscii())
    this.initFuse()
  }

  initFuse() {
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
    storage.set(key + 'items', this.items)
    this.isLoading(false)
  }

  onSearchStart({ str, origin }) {
    str = str.trim()
    this.lastSearchOrigin = origin
    const result = this.items.find(item => (item.reference === str || item.barcode === str))
    const results = result ? [result] : this.fuse.search(str).map(item => item.item)
    const title = `Results for “${str}”`
    emit('app-search-results--show', { title, results, byReference: Boolean(result) })
  }

  onSearchRetry() {
    console.log('retry and this.lastSearchOrigin', this.lastSearchOrigin)
    if (this.lastSearchOrigin === SEARCH_ORIGIN.type) return document.querySelector('#input-type').focus()
    if (this.lastSearchOrigin === SEARCH_ORIGIN.scan) return emit('app-scan-code--start')
    if (this.lastSearchOrigin === SEARCH_ORIGIN.speech) return emit('app-speech--start')
    this.showError('un-handled search retry case')
  }

  async fadeIn(element) {
    if (!element.classList.contains('hide')) return console.warn('please add "hide" class before mounting dom element and then call fade-in')
    await sleep(10)
    element.style.opacity = 1
  }

  async fadeOut(element, destroy = false) {
    element.classList.add('hide')
    await sleep(350)
    element.classList.remove('hide')
    element.classList.add('hidden')
    if (!destroy) return
    await sleep(350)
    element.remove()
  }

  showLog(message, data) {
    console.log(message, data || '')
    emit('app-toaster--show', { type: 'info', message })
  }

  showError(message) {
    console.error(message)
    emit('app-toaster--show', { type: 'error', message })
  }

  async onUpdateItem(item) {
    if (!item.id) return this.showError('cannot update an item without his id')
    this.isLoading(true)
    await this.updateItemRemotely(item)
    await this.updateItemLocally(item)
    this.isLoading(false)
  }

  async updateItemRemotely(item) {
    const fieldsToUpdate = ['name', 'brand', 'details', 'box', 'drawer', 'location', 'reference', 'barcode', 'ref-printed']
    const data = { fields: {} }
    fieldsToUpdate.forEach(field => {
      if (item[field] || typeof item[field] === 'boolean') data.fields[field] = item[field]
    })
    if (Object.keys(data.fields).length === 0) return this.showError('cannot update an item without data')
    const url = this.apiUrl.replace('?', `/${item.id}?`)
    return this.patch(url, data)
  }

  async updateItemLocally(itemToUpdate) {
    const index = this.items.findIndex(item => item.id === itemToUpdate.id)
    if (index < 0) return this.showError('failed to find local item')
    Object.assign(this.items[index], itemToUpdate)
    this.initFuse()
  }

  async patch(url, data) {
    const options = { headers: JSON_HEADERS, method: 'patch', body: JSON.stringify(data) }
    return fetch(url, options).then(response => response.json()).catch(error => this.showError(error.message))
  }
}

// eslint-disable-next-line no-new
new App()
